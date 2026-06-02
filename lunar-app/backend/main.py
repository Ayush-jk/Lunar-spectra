from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pipeline

app = FastAPI(title="Lunar Spectra API")

# Allow Vercel frontend (and localhost during dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten to your Vercel URL after deploy
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "artifacts_loaded": pipeline.ARTIFACTS_READY,
    }


@app.post("/classify")
async def classify(
    qub_file: UploadFile = File(..., description=".qub hyperspectral image"),
    hdr_file: UploadFile = File(..., description=".hdr metadata header"),
):
    if not pipeline.ARTIFACTS_READY:
        raise HTTPException(503, "Model artifacts not loaded. Check models/ directory.")

    qub_bytes = await qub_file.read()
    hdr_bytes = await hdr_file.read()

    try:
        result = pipeline.classify_scene(qub_bytes, hdr_bytes)
    except Exception as e:
        raise HTTPException(500, str(e))

    return result


class PixelRequest(BaseModel):
    x: int
    y: int


@app.post("/pixel")
def pixel(req: PixelRequest):
    if not pipeline.ARTIFACTS_READY:
        raise HTTPException(503, "Model artifacts not loaded.")
    try:
        return pipeline.inspect_pixel(req.x, req.y)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/validation")
def validation():
    return pipeline.get_validation_data()
