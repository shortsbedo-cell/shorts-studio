import { Download, Pause, Play, Square } from 'lucide-react'
import type { ShortClip } from '../types/shorts'

interface ExportProgressProps {
  clips: ShortClip[]
  isProcessing: boolean
  onExport: () => void
  onDownloadAll: () => void
}

export function ExportProgress({ clips, isProcessing, onExport, onDownloadAll }: ExportProgressProps) {
  const completed = clips.filter((clip) => clip.status === 'completed').length
  const progress = clips.length ? Math.round((completed / clips.length) * 100) : 0
  return (
    <div className="export-progress">
      <div className="export-summary"><div><span className="eyebrow">03 / Export</span><strong>{completed} <em>/ {clips.length || 0}</em> shorts ready</strong></div><span className="export-percent">{progress}%</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <div className="export-actions">
        <span>{isProcessing ? 'Rendering your clips...' : completed === clips.length && clips.length ? 'Everything is ready to download' : 'Your exports stay in this browser'}</span>
        <div><button type="button" className="quiet-button" onClick={isProcessing ? undefined : onExport}>{isProcessing ? <><Pause size={15} /> Processing</> : <><Play size={15} /> Export all</>}</button><button type="button" className="primary-button" disabled={!completed} onClick={onDownloadAll}><Download size={16} /> Download ZIP</button><button type="button" className="stop-button" title="Stop export"><Square size={13} /></button></div>
      </div>
    </div>
  )
}