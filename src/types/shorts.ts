export type TextPosition = 'top' | 'center' | 'bottom'

export type ClipStatus = 'pending' | 'processing' | 'completed' | 'error'

export type AutoSplitMode = 15 | 30 | 60

export interface ShortClip {
  id: string
  index: number
  start: number
  end: number
  cropX: number
  text: string
  textSize: number
  textPosition: TextPosition
  muted: boolean
  status: ClipStatus
  progress: number
  output?: Uint8Array
  error?: string
}