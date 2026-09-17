import { useCallback, useEffect, useRef, useState } from 'react'

interface VideoState {
  file: File | null
  url: string | null
  duration: number
  isLoading: boolean
  error: string | null
}

export function useVideo() {
  const [state, setState] = useState<VideoState>({
    file: null,
    url: null,
    duration: 0,
    isLoading: false,
    error: null,
  })
  const urlRef = useRef<string | null>(null)

  const setVideo = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      setState((current) => ({ ...current, error: 'Please choose a video file.' }))
      return
    }

    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    const url = URL.createObjectURL(file)
    urlRef.current = url
    setState({ file, url, duration: 0, isLoading: true, error: null })
  }, [])

  const clearVideo = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = null
    setState({ file: null, url: null, duration: 0, isLoading: false, error: null })
  }, [])

  const onLoadedMetadata = useCallback((duration: number) => {
    setState((current) => ({ ...current, duration, isLoading: false }))
  }, [])

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
  }, [])

  return { ...state, setVideo, clearVideo, onLoadedMetadata }
}