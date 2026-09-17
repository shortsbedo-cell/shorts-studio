import { useCallback, useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import type { ShortClip } from '../types/shorts'

const CORE_VERSION = '0.12.10'
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`

interface ProcessOptions {
  file: File
  clips: ShortClip[]
  onClipUpdate: (id: string, update: Partial<ShortClip>) => void
}

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentClipId, setCurrentClipId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (ffmpegRef.current && isLoaded) return
    const ffmpeg = ffmpegRef.current ?? new FFmpeg()
    ffmpegRef.current = ffmpeg
    setError(null)

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      setIsLoaded(true)
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load FFmpeg.'
      setError(message)
      throw loadError
    }
  }, [isLoaded])

  const processClips = useCallback(async ({ file, clips, onClipUpdate }: ProcessOptions) => {
    setIsProcessing(true)
    setError(null)

    try {
      await load()
      const ffmpeg = ffmpegRef.current
      if (!ffmpeg) throw new Error('FFmpeg is not ready.')

      await ffmpeg.writeFile('source.mp4', await fetchFile(file))
      let activeClipId: string | null = null
      const handleProgress = ({ progress }: { progress: number }) => {
        if (activeClipId) onClipUpdate(activeClipId, { progress: Math.round(progress * 100) })
      }
      ffmpeg.on('progress', handleProgress)

      for (const clip of clips) {
        activeClipId = clip.id
        setCurrentClipId(clip.id)
        onClipUpdate(clip.id, { status: 'processing', progress: 0, error: undefined })
        const outputName = `short-${String(clip.index).padStart(2, '0')}.mp4`
        const duration = Math.max(0.1, clip.end - clip.start)
        const cropWidth = 'ih*9/16'
        const cropFilter = `crop=${cropWidth}:ih:${clip.cropX}:0,scale=1080:1920`
        const drawText = clip.text.trim()
          ? `,drawtext=text='${clip.text.replaceAll("'", "\\'")}':fontsize=${clip.textSize}:fontcolor=white:borderw=4:bordercolor=black@0.7:x=(w-text_w)/2:y=${clip.textPosition === 'top' ? '120' : clip.textPosition === 'bottom' ? 'h-text_h-160' : '(h-text_h)/2'}`
          : ''

        await ffmpeg.exec([
          '-i', 'source.mp4', '-ss', String(clip.start), '-t', String(duration),
          '-vf', `${cropFilter}${drawText}`,
          ...(clip.muted ? ['-an'] : []),
          '-c:v', 'libx264', '-preset', 'ultrafast', '-movflags', '+faststart', outputName,
        ])

        const output = await ffmpeg.readFile(outputName)
        onClipUpdate(clip.id, { status: 'completed', progress: 100, output: output instanceof Uint8Array ? output : undefined })
        await ffmpeg.deleteFile(outputName)
      }
      ffmpeg.off('progress', handleProgress)
    } catch (processError) {
      const message = processError instanceof Error ? processError.message : 'Export failed.'
      setError(message)
      if (currentClipId) onClipUpdate(currentClipId, { status: 'error', error: message })
    } finally {
      setCurrentClipId(null)
      setIsProcessing(false)
    }
  }, [currentClipId, load])

  return { load, processClips, isLoaded, isProcessing, currentClipId, error }
}