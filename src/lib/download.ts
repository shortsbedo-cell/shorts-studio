import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ShortClip } from '../types/shorts'

export async function downloadAllAsZip(clips: ShortClip[]) {
  const completed = clips.filter((clip) => clip.status === 'completed' && clip.output)
  if (!completed.length) return

  const zip = new JSZip()
  completed.forEach((clip) => {
    zip.file(`short-${String(clip.index).padStart(2, '0')}.mp4`, clip.output as Uint8Array)
  })
  const archive = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  saveAs(archive, 'shorts-studio-export.zip')
}