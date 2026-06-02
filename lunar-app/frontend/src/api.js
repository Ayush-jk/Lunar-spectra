const BASE = import.meta.env.VITE_API_URL || '/api'

export async function checkHealth() {
  const r = await fetch(`${BASE}/health`)
  return r.json()
}

export async function classifyScene(qubFile, hdrFile) {
  const form = new FormData()
  form.append('qub_file', qubFile)
  form.append('hdr_file', hdrFile)
  const r = await fetch(`${BASE}/classify`, { method: 'POST', body: form })
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.detail || 'Classification failed')
  }
  return r.json()
}

export async function inspectPixel(x, y) {
  const r = await fetch(`${BASE}/pixel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y }),
  })
  if (!r.ok) {
    const err = await r.json()
    throw new Error(err.detail || 'Pixel inspection failed')
  }
  return r.json()
}

export async function getValidation() {
  const r = await fetch(`${BASE}/validation`)
  return r.json()
}
