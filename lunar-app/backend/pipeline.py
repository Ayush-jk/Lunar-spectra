import numpy as np
import joblib
import os
import tempfile
import base64
import io
import time
from pathlib import Path
from matplotlib.colors import ListedColormap
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use("Agg")  # no display needed

# ── State (lives in memory after first /classify call) ────────────────────────
state = {
    "hyperspectral_data": None,
    "flattened_data": None,
    "reduced_data": None,
    "predicted_labels": None,
    "classified_image": None,
    "class_spectra": None,
    "wavelengths": None,
}

# ── Constants ─────────────────────────────────────────────────────────────────
CLASS_NAMES  = ["Mare Basalt", "Highland Anorthosite", "Impact Melt",
                "Pyroclastic Deposit", "Mixed Terrain"]
CLASS_COLORS = ["#f7e8aa", "#934b43", "#708090", "#afafaf", "#3a4e48"]
MODELS_DIR   = Path(__file__).parent / "models"


def load_artifacts():
    """Load saved PCA, KMeans and CNN once at startup."""
    import tensorflow as tf
    pca   = joblib.load(MODELS_DIR / "pca_transform.pkl")
    kmean = joblib.load(MODELS_DIR / "kmeans.pkl")
    cnn   = tf.keras.models.load_model(MODELS_DIR / "lunar_cnn.h5")
    return pca, kmean, cnn


# Loaded once when the server starts
try:
    PCA_MODEL, KMEAN_MODEL, CNN_MODEL = load_artifacts()
    ARTIFACTS_READY = True
except Exception as e:
    print(f"[WARNING] Could not load artifacts: {e}")
    ARTIFACTS_READY = False


def classify_scene(qub_bytes: bytes, hdr_bytes: bytes) -> dict:
    """Full pipeline: raw bytes → classified image + stats."""
    import spectral

    t0 = time.time()

    # Write uploaded files to temp dir (spectral lib needs paths on disk)
    with tempfile.TemporaryDirectory() as tmp:
        qub_path = os.path.join(tmp, "scene.qub")
        hdr_path = os.path.join(tmp, "scene.hdr")

        with open(qub_path, "wb") as f: f.write(qub_bytes)
        with open(hdr_path, "wb") as f: f.write(hdr_bytes)

        data = spectral.io.envi.open(hdr_path, image=qub_path)
        hsi  = data.load()   # shape: (rows, cols, bands)

    rows, cols, bands = hsi.shape

    # Normalize
    normalized = hsi / np.max(hsi)
    flattened  = normalized.reshape(-1, bands)

    # PCA → CNN
    reduced    = PCA_MODEL.transform(flattened)
    cnn_input  = reduced.reshape(-1, 10, 1, 1)
    probs      = CNN_MODEL.predict(cnn_input, verbose=0)
    pred_labels = np.argmax(probs, axis=1)
    classified  = pred_labels.reshape(rows, cols)

    # Average spectrum per class
    wavelengths  = np.linspace(800, 5000, bands).tolist()
    class_spectra = []
    for i in range(5):
        mask = pred_labels == i
        avg  = np.mean(flattened[mask], axis=0).tolist() if mask.any() else [0.0] * bands
        class_spectra.append(avg)

    # Save state for pixel inspector
    state.update({
        "hyperspectral_data": hsi,
        "flattened_data":     flattened,
        "reduced_data":       reduced,
        "predicted_labels":   pred_labels,
        "classified_image":   classified,
        "class_spectra":      class_spectra,
        "wavelengths":        wavelengths,
    })

    # Render classified map to base64 PNG
    map_b64 = _render_classified_map(classified)

    # Class distribution
    counts      = np.bincount(pred_labels, minlength=5)
    percentages = (counts / len(pred_labels) * 100).tolist()

    return {
        "classified_map": map_b64,
        "shape":          {"rows": rows, "cols": cols, "bands": bands},
        "processing_time": round(time.time() - t0, 1),
        "class_distribution": [
            {"name": n, "count": int(c), "percentage": round(p, 2)}
            for n, c, p in zip(CLASS_NAMES, counts, percentages)
        ],
    }


def inspect_pixel(x: int, y: int) -> dict:
    """Return spectrum + prediction for a single pixel."""
    if state["hyperspectral_data"] is None:
        raise ValueError("No scene loaded yet. Run /classify first.")

    hsi     = state["hyperspectral_data"]
    reduced = state["reduced_data"]
    waves   = state["wavelengths"]
    pred    = state["predicted_labels"]
    cols    = hsi.shape[1]

    # Bounds check
    if not (0 <= x < hsi.shape[1] and 0 <= y < hsi.shape[0]):
        raise ValueError(f"Coordinates out of range. Valid: x 0–{hsi.shape[1]-1}, y 0–{hsi.shape[0]-1}")

    # Raw reflectance
    reflectance = hsi[y, x, :].squeeze().tolist()

    # CNN confidence for this pixel
    pixel_reduced = reduced[y * cols + x].reshape(1, 10, 1, 1)
    probs  = CNN_MODEL.predict(pixel_reduced, verbose=0)[0]
    cls_id = int(np.argmax(probs))

    return {
        "x": x, "y": y,
        "spectrum": [{"wavelength": round(w, 1), "reflectance": round(r, 6)}
                     for w, r in zip(waves, reflectance)],
        "predicted_class": CLASS_NAMES[cls_id],
        "confidence":      round(float(probs[cls_id]) * 100, 2),
        "all_probabilities": {n: round(float(p) * 100, 2)
                              for n, p in zip(CLASS_NAMES, probs)},
    }


def get_validation_data() -> dict:
    """Band depth validation data for pre-loaded or demo spectra."""
    if state["class_spectra"] is None:
        return {"error": "No scene loaded yet."}

    waves    = np.array(state["wavelengths"])
    spectra  = state["class_spectra"]

    def band_at(nm):
        return int(np.argmin(np.abs(waves - nm)))

    b800  = band_at(800);  b1000 = band_at(1000); b1300 = band_at(1300)
    b1600 = band_at(1600); b2000 = band_at(2000); b2500 = band_at(2500)

    results = []
    for name, sp in zip(CLASS_NAMES, spectra):
        sp = np.array(sp)
        c1 = np.interp(waves[b1000], [waves[b800],  waves[b1300]],
                                     [sp[b800],      sp[b1300]])
        bd1 = float(1.0 - sp[b1000] / c1) if c1 > 0 else 0.0

        c2 = np.interp(waves[b2000], [waves[b1600], waves[b2500]],
                                     [sp[b1600],     sp[b2500]])
        bd2 = float(1.0 - sp[b2000] / c2) if c2 > 0 else 0.0

        slope = float((sp[b1300] - sp[b800]) / (waves[b1300] - waves[b800]))
        results.append({"class": name, "bd_1um": round(bd1, 4),
                        "bd_2um": round(bd2, 4), "slope": round(slope, 6)})

    # Spectral signatures (downsampled to every 4th band for fast transfer)
    sig_data = []
    for name, color, sp in zip(CLASS_NAMES, CLASS_COLORS, spectra):
        sig_data.append({
            "name":   name,
            "color":  color,
            "points": [{"wavelength": round(float(waves[i]), 1),
                        "reflectance": round(float(sp[i]), 6)}
                       for i in range(0, len(waves), 4)],
        })

    return {"band_depths": results, "spectral_signatures": sig_data}


def _render_classified_map(classified: np.ndarray) -> str:
    """Render classified image → base64 PNG string."""
    cmap = ListedColormap(CLASS_COLORS)
    fig, ax = plt.subplots(figsize=(10, 8))
    im = ax.imshow(classified, cmap=cmap, vmin=0, vmax=4)
    cbar = plt.colorbar(im, ax=ax, ticks=range(5))
    cbar.set_ticklabels(CLASS_NAMES)
    ax.set_title("CNN-Classified Lunar Surface — Chandrayaan-2 IIRS", fontsize=13)
    ax.set_xlabel("Pixel"); ax.set_ylabel("Scan Line")
    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", dpi=120)
    plt.close(fig)
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")
