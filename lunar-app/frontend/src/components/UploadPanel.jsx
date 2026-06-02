import { useState } from 'react'
import { classifyScene } from '../api'

const CLASS_COLORS = {
  'Mare Basalt':          '#f7e8aa',
  'Highland Anorthosite': '#934b43',
  'Impact Melt':          '#708090',
  'Pyroclastic Deposit':  '#afafaf',
  'Mixed Terrain':        '#3a4e48',
}

export default function UploadPanel({ onResult }) {
  const [qub, setQub]       = useState(null)
  const [hdr, setHdr]       = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError]   = useState('')
  const [result, setResult] = useState(null)

  async function handleClassify() {
    if (!qub || !hdr) return
    setStatus('loading'); setError('')
    try {
      const data = await classifyScene(qub, hdr)
      setResult(data); setStatus('done')
      onResult(data)
    } catch (e) {
      setError(e.message); setStatus('error')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div className="border-b-2 border-ink pb-4">
        <h2 className="font-display text-3xl font-black text-ink">Upload IIRS Scene</h2>
        <p className="font-body text-muted mt-1">
          Chandrayaan-2 calibrated hyperspectral data — requires a matched .qub + .hdr pair
        </p>
      </div>

      {/* File zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileZone label=".qub" hint="Hyperspectral image (~1–4 GB)" accept=".qub" file={qub} onChange={setQub} />
        <FileZone label=".hdr" hint="Metadata header (~2 KB)"       accept=".hdr" file={hdr} onChange={setHdr} />
      </div>

      {/* Button */}
      <button
        onClick={handleClassify}
        disabled={!qub || !hdr || status === 'loading'}
        className={`
          w-full py-3.5 border-2 border-ink font-display font-black text-sm tracking-widest uppercase
          transition-all duration-150 active:translate-x-0.5 active:translate-y-0.5
          disabled:opacity-30 disabled:cursor-not-allowed
          ${status === 'loading'
            ? 'bg-yellow text-ink shadow-panel-sm'
            : 'bg-ink text-paper shadow-panel hover:shadow-panel-orange hover:border-orange hover:bg-orange'}
        `}
      >
        {status === 'loading' ? '▶ Processing scene…' : '▶ Classify Scene'}
      </button>

      {/* Error */}
      {status === 'error' && (
        <div className="card-orange p-4 font-mono text-sm text-ink animate-fade-in">
          ✗ {error}
        </div>
      )}

      {/* Result summary */}
      {status === 'done' && result && (
        <div className="card-blue p-5 space-y-5 animate-slide-up">
          {/* Stats row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="tag bg-yellow">✓ Done in {result.processing_time}s</span>
            <div className="flex gap-3 font-mono text-xs text-muted">
              <span>{result.shape.rows.toLocaleString()} rows</span>
              <span>×</span>
              <span>{result.shape.cols} cols</span>
              <span>×</span>
              <span>{result.shape.bands} bands</span>
            </div>
          </div>

          {/* Distribution */}
          <div>
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">
              Class Distribution
            </p>
            <div className="space-y-2">
              {result.class_distribution.map((cls) => (
                <div key={cls.name}>
                  <div className="flex justify-between font-body text-xs mb-1">
                    <span className="text-ink font-medium">{cls.name}</span>
                    <span className="font-mono text-muted">{cls.percentage}%</span>
                  </div>
                  <div className="h-2 border border-ink bg-paper overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${cls.percentage}%`, background: CLASS_COLORS[cls.name] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FileZone({ label, hint, accept, file, onChange }) {
  return (
    <label className={`
      flex flex-col items-center justify-center gap-2 p-8 cursor-pointer
      border-2 border-dashed transition-all duration-150
      ${file
        ? 'border-ink bg-yellow/20'
        : 'border-ink/30 bg-paper hover:border-ink hover:bg-white'}
    `}>
      <input type="file" accept={accept} className="hidden"
        onChange={(e) => e.target.files[0] && onChange(e.target.files[0])} />
      <span className="font-display text-2xl font-black text-ink">{label}</span>
      <span className="font-mono text-xs text-muted text-center">
        {file ? `✓ ${file.name}` : hint}
      </span>
    </label>
  )
}
