import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
         BarChart, Bar } from 'recharts'
import { getValidation } from '../api'

const CLASS_COLORS = {
  'Mare Basalt':          '#c8a800',
  'Highland Anorthosite': '#934b43',
  'Impact Melt':          '#708090',
  'Pyroclastic Deposit':  '#888',
  'Mixed Terrain':        '#3a4e48',
}

export default function ValidationPanel() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState('spectra')

  useEffect(() => {
    setLoading(true)
    getValidation().then(setData).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b-2 border-ink pb-4">
        <h2 className="font-display text-3xl font-black text-ink">Spectral Validation</h2>
        <p className="font-body text-muted mt-1">
          Continuum-removal band depths at 1µm and 2µm validate the assigned class names
          against known lunar mineral signatures
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-40 font-mono text-xs text-muted">
          Loading validation data…
        </div>
      )}

      {data?.error && (
        <div className="card p-5 font-mono text-sm text-muted">{data.error}</div>
      )}

      {data && !data.error && (
        <>
          {/* Sub-tabs */}
          <div className="flex border-2 border-ink w-fit">
            {['spectra', 'bands'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2 font-mono text-xs uppercase tracking-widest transition-all
                  ${tab === t
                    ? 'bg-ink text-paper'
                    : 'bg-paper text-muted hover:text-ink border-r-2 border-ink last:border-r-0'}`}
              >
                {t === 'spectra' ? 'Spectral Signatures' : 'Band Depths'}
              </button>
            ))}
          </div>

          {tab === 'spectra' && (
            <div className="card p-5 animate-fade-in">
              <p className="font-body text-sm text-ink font-semibold mb-1">
                Average reflectance per class · IIRS 800–5000 nm
              </p>
              <p className="font-mono text-xs text-muted mb-5">
                Dashed lines: 1µm (orange) and 2µm (blue) diagnostic absorption windows
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <XAxis dataKey="wavelength" type="number" domain={[800, 5000]}
                    tick={{ fontSize: 10, fill: '#6B6B5A', fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Wavelength (nm)', position: 'insideBottom', offset: -2, fill: '#6B6B5A', fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#6B6B5A', fontFamily: 'JetBrains Mono' }}
                    label={{ value: 'Reflectance', angle: -90, position: 'insideLeft', fill: '#6B6B5A', fontSize: 11 }}
                  />
                  <Tooltip contentStyle={{ background: '#fff', border: '2px solid #1A1A1A', borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                  <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                  {data.spectral_signatures.map((cls) => (
                    <Line key={cls.name} data={cls.points} dataKey="reflectance"
                      name={cls.name} stroke={CLASS_COLORS[cls.name] || '#1A1A1A'}
                      strokeWidth={2} dot={false} type="monotone" />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === 'bands' && (
            <div className="space-y-4 animate-fade-in">
              {/* Bar chart */}
              <div className="card p-5">
                <p className="font-body text-sm font-semibold text-ink mb-4">
                  Absorption Band Depths — BD@1µm vs BD@2µm
                </p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.band_depths} barCategoryGap="25%">
                    <XAxis dataKey="class"
                      tick={{ fontSize: 9, fill: '#6B6B5A', fontFamily: 'JetBrains Mono' }}
                      interval={0} angle={-15} textAnchor="end" height={50}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#6B6B5A', fontFamily: 'JetBrains Mono' }} />
                    <Tooltip contentStyle={{ background: '#fff', border: '2px solid #1A1A1A', borderRadius: 0, fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11 }} />
                    <Bar dataKey="bd_1um" name="BD @ 1µm" fill="#E8500A" radius={0} />
                    <Bar dataKey="bd_2um" name="BD @ 2µm" fill="#2D5BE3" radius={0} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Table */}
              <div className="card overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b-2 border-ink bg-ink text-paper">
                      <th className="text-left py-2.5 px-4 font-semibold">Class</th>
                      <th className="text-right py-2.5 px-3 font-semibold">BD_1µm</th>
                      <th className="text-right py-2.5 px-3 font-semibold">BD_2µm</th>
                      <th className="text-right py-2.5 px-4 font-semibold">Slope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.band_depths.map((row, i) => (
                      <tr key={row.class}
                          className={`border-b border-ink/20 ${i % 2 === 0 ? 'bg-white' : 'bg-paper'}`}>
                        <td className="py-2.5 px-4 font-body font-medium text-ink">{row.class}</td>
                        <td className={`text-right px-3 ${row.bd_1um > 0.05 ? 'text-orange font-semibold' : 'text-muted'}`}>
                          {row.bd_1um.toFixed(4)}
                        </td>
                        <td className={`text-right px-3 ${row.bd_2um > 0.05 ? 'text-blue font-semibold' : 'text-muted'}`}>
                          {row.bd_2um.toFixed(4)}
                        </td>
                        <td className={`text-right px-4 ${row.slope > 0 ? 'text-ink font-semibold' : 'text-muted'}`}>
                          {row.slope.toFixed(6)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 border-t border-ink/20 space-y-1 font-mono text-xs text-muted">
                  <p><span className="text-orange font-semibold">BD_1µm &gt; 0.05</span> → mafic absorption (pyroxene / olivine)</p>
                  <p><span className="text-blue font-semibold">BD_2µm &gt; 0.05</span> → pyroxene confirmed (LCP / HCP)</p>
                  <p><span className="text-ink font-semibold">Slope &gt; 0</span> → red spectral slope = mature highland regolith</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
