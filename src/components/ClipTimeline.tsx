import { Plus, Scissors, Zap } from 'lucide-react'
import type { AutoSplitMode, ShortClip } from '../types/shorts'

interface ClipTimelineProps {
  clips: ShortClip[]
  duration: number
  splitMode: AutoSplitMode
  onSplitModeChange: (mode: AutoSplitMode) => void
  onAutoSplit: () => void
  onAddClip: () => void
  onSelect: (id: string) => void
  selectedId: string | null
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`

export function ClipTimeline({ clips, duration, splitMode, onSplitModeChange, onAutoSplit, onAddClip, onSelect, selectedId }: ClipTimelineProps) {
  return (
    <section className="timeline-panel">
      <div className="section-heading">
        <div><span className="eyebrow">02 / Arrange</span><h2>Shorts timeline</h2></div>
        <span className="duration-label">{formatTime(duration)} total</span>
      </div>
      <div className="timeline-track">
        {clips.map((clip) => (
          <button key={clip.id} type="button" className={`timeline-segment ${selectedId === clip.id ? 'timeline-segment-selected' : ''}`} onClick={() => onSelect(clip.id)} style={{ width: `${Math.max(((clip.end - clip.start) / Math.max(duration, 1)) * 100, 8)}%` }}>
            <span>#{String(clip.index).padStart(2, '0')}</span><small>{formatTime(clip.start)} - {formatTime(clip.end)}</small>
          </button>
        ))}
        {!clips.length && <div className="timeline-empty">Set an auto-split to create your first short</div>}
      </div>
      <div className="timeline-actions">
        <button type="button" className="secondary-button" onClick={onAddClip}><Plus size={15} /> Add clip</button>
        <div className="split-control">
          <Zap size={15} />
          {([15, 30, 60] as AutoSplitMode[]).map((mode) => <button key={mode} type="button" className={splitMode === mode ? 'split-option-active' : ''} onClick={() => onSplitModeChange(mode)}>{mode}s</button>)}
          <button type="button" className="split-apply" onClick={onAutoSplit}><Scissors size={14} /> Auto-split</button>
        </div>
      </div>
    </section>
  )
}