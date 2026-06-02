import { useState, useEffect } from 'react'
import UploadPanel     from './components/UploadPanel'
import ClassifiedMap   from './components/ClassifiedMap'
import PixelInspector  from './components/PixelInspector'
import ValidationPanel from './components/ValidationPanel'
import { checkHealth } from './api'

const TABS = [
  { id: 'upload',     label: 'Upload',     num: '01' },
  { id: 'map',        label: 'Map',        num: '02' },
  { id: 'pixel',      label: 'Pixel',      num: '03' },
  { id: 'validation', label: 'Validation', num: '04' },
]

export default function App() {
  const [tab, setTab]         = useState('upload')
  const [result, setResult]   = useState(null)
  const [connected, setConnected] = useState(null)

  useEffect(() => {
    checkHealth()
      .then(() => setConnected(true))
      .catch(() => setConnected(false))
  }, [])

  function handleResult(data) {
    setResult(data)
    setTab('map')
  }

  return (
    <div className="relative min-h-screen z-10">

      {/* Header */}
      <header className="border-b-2 border-ink bg-paper sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-black leading-none text-ink">
              Lunar Spectra
            </h1>
            <p className="font-mono text-xs text-muted mt-0.5 tracking-wide">
              Chandrayaan-2 · IIRS · CNN Surface Classifier
            </p>
          </div>

          {/* Status pill */}
          <div className={`tag ${
            connected === true  ? 'bg-yellow text-ink'  :
            connected === false ? 'bg-red text-paper'   :
                                  'bg-paper text-muted'
          }`}>
            {connected === true  ? '● Backend live' :
             connected === false ? '○ Backend offline' :
                                   '… checking'}
          </div>
        </div>

        {/* Tab bar */}
        <div className="max-w-5xl mx-auto px-6 flex gap-0 border-t-2 border-ink">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`
                relative px-5 py-2.5 font-body font-semibold text-sm
                border-r-2 border-ink transition-all duration-150
                ${i === 0 ? '' : ''}
                ${tab === t.id
                  ? 'bg-ink text-paper'
                  : 'bg-paper text-muted hover:text-ink hover:bg-yellow/30'}
              `}
            >
              <span className="font-mono text-xs opacity-50 mr-1.5">{t.num}</span>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Offline banner */}
      {connected === false && (
        <div className="border-b-2 border-ink bg-yellow px-6 py-2 text-center">
          <p className="font-mono text-xs text-ink">
            Start backend → <span className="font-semibold">cd backend && uvicorn main:app --reload</span>
          </p>
        </div>
      )}

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <div className="card p-6 md:p-8">
          {tab === 'upload'     && <UploadPanel onResult={handleResult} />}
          {tab === 'map'        && <ClassifiedMap result={result} />}
          {tab === 'pixel'      && <PixelInspector sceneShape={result?.shape} />}
          {tab === 'validation' && <ValidationPanel />}
        </div>

        <footer className="mt-6 text-center font-mono text-xs text-muted space-y-0.5">
          <p>ISRO · Chandrayaan-2 · IIRS Calibrated Scene 20240209</p>
          <p>Spatial generalization accuracy: 98.75% · Random split: 98.84%</p>
        </footer>
      </main>
    </div>
  )
}
