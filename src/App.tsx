import { useState } from 'react'
import { GitBranch, MonitorPlay, RotateCcw, Settings2, Sparkles, Video, X } from 'lucide-react'
import { ClipCard } from './components/ClipCard'
import { ClipTimeline } from './components/ClipTimeline'
import { ExportProgress } from './components/ExportProgress'
import { VideoUploader } from './components/VideoUploader'
import { useFFmpeg } from './hooks/useFFmpeg'
import { useVideo } from './hooks/useVideo'
import { downloadAllAsZip } from './lib/download'
import type { AutoSplitMode, ShortClip } from './types/shorts'
import './App.css'

const makeClip = (index: number, start: number, end: number): ShortClip => ({
  id: crypto.randomUUID(), index, start, end, cropX: 0, text: '', textSize: 58,
  textPosition: 'center', muted: false, status: 'pending', progress: 0,
})

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`

function App() {
  const video = useVideo()
  const ffmpeg = useFFmpeg()
  const [clips, setClips] = useState<ShortClip[]>([])
  const [splitMode, setSplitMode] = useState<AutoSplitMode>(30)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const updateClip = (id: string, update: Partial<ShortClip>) => setClips((current) => current.map((clip) => clip.id === id ? { ...clip, ...update } : clip))
  const autoSplit = () => {
    if (!video.duration) return
    const next: ShortClip[] = []
    for (let start = 0; start < video.duration; start += splitMode) next.push(makeClip(next.length + 1, start, Math.min(start + splitMode, video.duration)))
    setClips(next)
    setSelectedId(next[0]?.id ?? null)
  }
  const addClip = () => {
    const start = clips.length ? clips[clips.length - 1].end : 0
    const end = Math.min(start + splitMode, video.duration || start + splitMode)
    const clip = makeClip(clips.length + 1, start, end)
    setClips((current) => [...current, clip])
    setSelectedId(clip.id)
  }
  const handleVideo = (file: File) => {
    video.setVideo(file)
    setClips([])
    setSelectedId(null)
  }
  const exportClips = () => {
    if (video.file && clips.length) void ffmpeg.processClips({ file: video.file, clips, onClipUpdate: updateClip })
  }

  return (
    <main className="studio-shell">
      <header className="app-header"><a href="/" className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>SHORTS <b>STUDIO</b></span></a><div className="header-meta"><span className="local-badge"><span /> Runs locally in your browser</span><a href="https://github.com/ffmpegwasm/ffmpeg.wasm" target="_blank" rel="noreferrer" className="github-link"><GitBranch size={16} /> GitHub <span>↗</span></a><button type="button" className="icon-button" title="Settings"><Settings2 size={18} /></button></div></header>
      <div className="studio-content">
        <section className="intro-row"><div><span className="eyebrow">VIDEO EDITOR / 01</span><h1>Turn one video<br /><i>into a series.</i></h1><p>Make scroll-stopping vertical shorts without sending your footage to the cloud.</p></div><div className="intro-stats"><div><strong>{clips.length.toString().padStart(2, '0')}</strong><span>clips queued</span></div><div><strong>{formatTime(video.duration)}</strong><span>source length</span></div></div></section>
        {!video.file ? <section className="upload-section"><VideoUploader onFile={handleVideo} /><div className="upload-note"><MonitorPlay size={15} /> Your footage never leaves this tab <span>•</span> Powered by FFmpeg.wasm</div></section> : <>
          <section className="workspace-grid">
            <div className="source-panel"><div className="section-heading"><div><span className="eyebrow">01 / Source</span><h2>Original video</h2></div><button type="button" className="icon-button" title="Remove source" onClick={video.clearVideo}><X size={17} /></button></div><div className="source-preview"><video src={video.url ?? undefined} controls onLoadedMetadata={(event) => video.onLoadedMetadata(event.currentTarget.duration)} /><div className="portrait-guide"><span>9:16 crop</span></div><div className="video-time">{formatTime(video.duration)} <span>•</span> {video.file.name}</div></div><div className="source-meta"><span><Video size={14} /> {video.file.type.split('/')[1]?.toUpperCase()} source</span><button type="button" onClick={video.clearVideo}><RotateCcw size={13} /> Replace</button></div></div>
            <aside className="sidebar-intro"><span className="sidebar-number">A</span><h2>Frame the<br /><i>moment.</i></h2><p>Every clip is automatically formatted for the feed. Add a caption to give it a little more lift.</p><div className="tip-line"><Sparkles size={14} /><span>Tip: Shorter clips keep attention longer.</span></div></aside>
          </section>
          <ClipTimeline clips={clips} duration={video.duration} splitMode={splitMode} onSplitModeChange={setSplitMode} onAutoSplit={autoSplit} onAddClip={addClip} onSelect={setSelectedId} selectedId={selectedId} />
          <section className="clips-section"><div className="section-heading"><div><span className="eyebrow">Your edits</span><h2>{clips.length ? 'Review your shorts' : 'Your shorts will appear here'}</h2></div>{clips.length > 0 && <span className="muted-label">{clips.length} {clips.length === 1 ? 'clip' : 'clips'} in queue</span>}</div><div className="clips-grid">{clips.map((clip) => <ClipCard key={clip.id} clip={clip} sourceUrl={video.url} onUpdate={updateClip} />)}</div>{!clips.length && <div className="empty-clips"><Sparkles size={18} /><span>Choose a split length above to start building your queue.</span></div>}</section>
          {ffmpeg.error && <div className="app-error">{ffmpeg.error}</div>}
          <ExportProgress clips={clips} isProcessing={ffmpeg.isProcessing} onExport={exportClips} onDownloadAll={() => void downloadAllAsZip(clips)} />
        </>}
      </div>
      <footer className="app-footer"><span>SHORTS STUDIO <i>v1.0</i></span><span>Made for the feed <b>•</b> Everything happens locally</span></footer>
    </main>
  )
}

export default App
