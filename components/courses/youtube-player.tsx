"use client"

import { useState, useEffect } from "react"

interface YouTubePlayerProps {
  videoId: string
  title?: string
}

export function YouTubePlayer({ videoId, title = "YouTube video player" }: YouTubePlayerProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Extract video ID from URL if a full URL is provided
  const extractVideoId = (url: string) => {
    if (!url) return url

    // Handle youtu.be format
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0]
    }

    // Handle youtube.com format
    const match = url.match(/[?&]v=([^&]+)/)
    return match ? match[1] : url
  }

  const cleanVideoId = extractVideoId(videoId)

  if (!isClient) {
    // Server-side or during hydration
    return (
      <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">Loading video player...</p>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${cleanVideoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      ></iframe>
    </div>
  )
}

