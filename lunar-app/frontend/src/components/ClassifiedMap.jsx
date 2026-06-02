export default function ClassifiedMap({ result }) {
  if (!result) return (
    <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-ink/30">
      <span className="font-display text-5xl font-black text-ink/10">MAP</span>
      <p className="font-mono text-xs text-muted mt-2">Classify a scene first</p>
    </div>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="border-b-2 border-ink pb-4">
        <h2 className="font-display text-3xl font-black text-ink">Surface Map</h2>
        <p className="font-body text-muted mt-1">
          CNN predictions across the full {result.shape.rows.toLocaleString()}×{result.shape.cols} orbital strip
        </p>
      </div>

      {/* Map */}
      <div className="border-2 border-ink overflow-hidden">
        <img
          src={`data:image/png;base64,${result.classified_map}`}
          alt="Classified lunar surface"
          className="w-full h-auto block"
        />
      </div>

      {/* Legend */}
      <div className="card p-4">
        <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">Spectral Classes</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-2">
          {result.class_distribution.map((cls) => (
            <div key={cls.name} className="flex items-center gap-2">
              <div
                className="w-4 h-4 border border-ink flex-shrink-0"
                style={{ background: classColor(cls.name) }}
              />
              <span className="font-body text-xs text-ink leading-tight">{cls.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function classColor(name) {
  return {
    'Mare Basalt':          '#f7e8aa',
    'Highland Anorthosite': '#934b43',
    'Impact Melt':          '#708090',
    'Pyroclastic Deposit':  '#afafaf',
    'Mixed Terrain':        '#3a4e48',
  }[name] || '#ccc'
}
