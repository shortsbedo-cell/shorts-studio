import { useEffect, useState } from 'react'
import { Check, Download, LoaderCircle, LockKeyhole, MicOff, MoreHorizontal, RotateCcw, Volume2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import type { ShortClip, TextPosition } from '../types/shorts'

interface ClipCardProps {
  clip: ShortClip
  sourceUrl: string | null
  onUpdate: (id: string, update: Partial<ShortClip>) => void
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`

export function ClipCard({ clip, sourceUrl, onUpdate }: ClipCardProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!clip.output) { setPreviewUrl(null); return }
    const url = URL.createObjectURL(new Blob([clip.output.buffer as ArrayBuffer], { type: 'video/mp4' }))
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [clip.output])

  const download = () => {
    if (clip.output) saveAs(new Blob([clip.output.buffer as ArrayBuffer], { type: 'video/mp4' }), `short-${String(clip.index).padStart(2, '0')}.mp4`)
  }

  return (
    <article className={`clip-card ${clip.status === 'processing' ? 'clip-card-processing' : ''}`}>
      <div className="clip-card-top">
        <div className="clip-number">{String(clip.index).padStart(2, '0')}</div>
        <div className="clip-card-title"><strong>Short {String(clip.index).padStart(2, '0')}</strong><span>{formatTime(clip.end - clip.start)} duration</span></div>
        <div className={`status-pill status-${clip.status}`}>{clip.status === 'completed' && <Check size={12} />}{clip.status === 'processing' && <LoaderCircle size={12} className="spin" />}{clip.status}</div>
        <button type="button" className="icon-button" title="More clip options"><MoreHorizontal size={18} /></button>
      </div>
      <div className="clip-preview-wrap">
        {previewUrl || sourceUrl ? <video src={previewUrl ?? sourceUrl ?? undefined} muted playsInline controls={Boolean(previewUrl)} className="clip-preview" /> : <div className="preview-placeholder"><span>9:16</span><small>Preview after upload</small></div>}
        <div className="preview-badge">9:16</div>
        {clip.status === 'processing' && <div className="processing-overlay"><LoaderCircle className="spin" size={25} /><span>Rendering {clip.progress}%</span></div>}
      </div>
      <div className="clip-fields">
        <label>Trim range <span>{formatTime(clip.start)} - {formatTime(clip.end)}</span><input type="range" min={0} max={Math.max(clip.end, 1)} step="0.1" value={clip.start} onChange={(event) => onUpdate(clip.id, { start: Number(event.target.value) })} /></label>
        <label>Caption <input type="text" value={clip.text} placeholder="Add a caption..." onChange={(event) => onUpdate(clip.id, { text: event.target.value })} /></label>
        <div className="clip-settings">
          <label>Size <select value={clip.textSize} onChange={(event) => onUpdate(clip.id, { textSize: Number(event.target.value) })}><option value={42}>Small</option><option value={58}>Medium</option><option value={76}>Large</option></select></label>
          <label>Position <select value={clip.textPosition} onChange={(event) => onUpdate(clip.id, { textPosition: event.target.value as TextPosition })}><option value="top">Top</option><option value="center">Center</option><option value="bottom">Bottom</option></select></label>
          <button type="button" className={`sound-toggle ${clip.muted ? 'sound-muted' : ''}`} onClick={() => onUpdate(clip.id, { muted: !clip.muted })} title={clip.muted ? 'Unmute clip' : 'Mute clip'}>{clip.muted ? <MicOff size={16} /> : <Volume2 size={16} />}</button>
        </div>
      </div>
      <div className="clip-card-footer">
        {clip.error ? <span className="error-text"><RotateCcw size={13} /> {clip.error}</span> : <span className="footer-note">{clip.muted ? <LockKeyhole size={12} /> : null} Local processing</span>}
        <button type="button" className="download-button" disabled={clip.status !== 'completed'} onClick={download}><Download size={15} /> Download</button>
      </div>
    </article>
  )
}