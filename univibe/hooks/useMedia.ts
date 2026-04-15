import { useCallStore } from "@/store/useCallStore"

export const useMedia = () => {
  const { setLocalStream } = useCallStore()

  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })

    setLocalStream(stream)
    return stream
  }

  return { getMedia }
}