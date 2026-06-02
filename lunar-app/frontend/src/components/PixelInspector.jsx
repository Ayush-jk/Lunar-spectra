import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { inspectPixel } from '../api'

const CLASS_COLORS = {
  'Mare Basalt':          '#c8a800',
  'Highland Anorthosite': '#934b43',
  'Impact Melt':          '#708090',
  'Pyroclastic Deposit':  '#888',
  'Mixed Terrain':        '#3a4e48',
}

export default function PixelInspector({ sceneShape }) {
  const maxX = sceneShape ? sceneShape.cols - 1 : 249
  const maxY = sceneShape ? sceneShape.rows - 1 : 9339

  const [x, setX]           = useState(125)
  const [y, setY]           = useState(4000)
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleInspect() {
    setLoading(true); setError('')
    try {
      const res = await inspectPixel(Number(x), Number(y))
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b-2 border-ink pb-4">
        <h2 className="font-display text-3xl font-black text-ink">Pixel Inspector</h2>
        <p className="font-body text-muted mt-1">
          Full spectrum + class prediction for any coordinate in the scene
        </p>
      </div>

      {/* Input */}
      <div className="card p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <CoordInput label={`X — column`} sub={`0 to ${maxX}`} value={x} min={0} max={maxX} onChange={setX} />
          <CoordInput label={`Y — scan line`} sub={`0 to ${maxY}`} value={y} min={0} max={maxY} onChange={setY} />
        </div>

        <button
          onClick={handleInspect}
          disabled={loading || !sceneShape}
          className="w-full py-3 border-2 border-ink font-display font-black text-sm tracking-widest uppercase
                     transition-all bg-paper hover:bg-ink hover:text-paper
                     disabled:opacity-30 disabled:cursor-not-allowed
                     active:translate-x-0.5 active:translate-y-0.5 shadow-panel hover:shadow-none"
        >
          {loading ? '▶ Inspecting…' : '▶ Inspect Pixel'}
        </button>

        {!sceneShape && (
          <p className="font-mono text-xs text-muted text-center">
            Classify a scene first to enable pixel inspection
          </p>
        )}
        {error && <p className="font-mono text-xs text-red">{error}</p>}
      </div>

      {/* Result */}
      {data && (
        <div className="space-y-4 animate-slide-up">
          {/* Class + confidence */}
          <div className="card p-5 flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">Predicted Class</p>
              <p className="font-display text-3xl font-black"
                 style={{ color: CLASS_COLORS[data.predicted_class] || '#1A1A1A' }}>
                {data.predicted_class}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">Confidence</p>
              <p className="font-display text-4xl font-black text-ink">
                {data.confidence}<span className="text-xl text-muted">%</span>
              </p>
            </div>
          </div>

          {/* Probability bars */}
          <div className="card p-5 space-y-2">
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">All Probabilities</p>
            {Object.entries(data.all_probabilities)
              .sort((a, b) => b[1] - a[1])
              .map(([cls, prob]) => (
                <div key={cls}>
                  <div className="flex justify-between font-body text-xs mb-1">
                    <span className="text-ink">{cls}</span>
                    <span className="font-mono text-muted">{prob}%</span>
                  </div>
                  <div className="h-1.5 border border-ink bg-paper overflow-hidden">
                    <div className="h-full" style={{
                      width: `${prob}%`,
                      background: CLASS_COLORS[cls] || '#1A1A1A'
                    }} />
                  </div>
                </div>
              ))}
          </div>

          {/* Spectrum chart */}
          <div className="card p-5">
            <p className="font-mono text-xs text-muted uppercase tracking-widest mb-1">
              Reflectance Spectrum — ({data.x}, {data.y})
            </p>
            <p className="font-body text-xs text-muted mb-4">
              Dashed lines mark 1µm and 2µm diagnostic absorption windows
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.spectrum}>
                <XAxis
                  dataKey="wavelength"
                  tick={{ fontSize: 10, fill: '#6B6B5A', fontFamily: 'JetBrains Mono' }}
                  tickFormatter={(v) => `${v}`}
                  interval={30}
                  label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -2, fill: '#6B6B5A', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6B6B5A', fontFamily: 'JetBrains Mono' }}
                  label={{ value: 'Reflectance', angle: -90, position: 'insideLeft', fill: '#6B6B5A', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '2px solid #1A1A1A', borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 11 }}
                  labelFormatter={(v) => `${v} nm`}
                  formatter={(v) => [v.toFixed(5), 'Reflectance']}
                />
                <ReferenceLine x={1000} stroke="#E8500A" strokeDasharray="4 2"
                  label={{ value: '1µm', fill: '#E8500A', fontSize: 10 }} />
                <ReferenceLine x={2000} stroke="#2D5BE3" strokeDasharray="4 2"
                  label={{ value: '2µm', fill: '#2D5BE3', fontSize: 10 }} />
                <Line type="monotone" dataKey="reflectance"
                  stroke={CLASS_COLORS[data.predicted_class] || '#1A1A1A'}
                  strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

function CoordInput({ label, sub, value, min, max, onChange }) {
  return (
    <div>
      <label className="block font-body text-sm font-semibold text-ink mb-0.5">{label}</label>
      <p className="font-mono text-xs text-muted mb-1.5">{sub}</p>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-paper border-2 border-ink px-3 py-2
                   font-mono text-sm text-ink focus:outline-none focus:bg-yellow/20
                   transition-colors"
      />
    </div>
  )
}
