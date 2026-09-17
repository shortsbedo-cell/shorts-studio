import { useRef, useState } from 'react'
import { Film, FileVideo, UploadCloud } from 'lucide-react'

interface VideoUploaderProps {
  onFile: (file: File) => void
}

export function VideoUploader({ onFile }: VideoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file?: File) => {
    if (file) onFile(file)
  }

  return (
    <div
      className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => { event.preventDefault(); setIsDragging(false); handleFile(event.dataTransfer.files[0]) }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click() }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <div className="upload-icon"><UploadCloud size={23} /></div>
      <div>
        <strong>Drop your video here</strong>
        <span>or click to browse from your device</span>
      </div>
      <div className="upload-formats"><FileVideo size={14} /> MP4, MOV, WebM <i>up to 2GB</i></div>
      <Film className="upload-watermark" size={90} strokeWidth={1} />
    </div>
  )
}