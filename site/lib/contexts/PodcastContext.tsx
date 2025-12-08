"use client"

import React, { createContext, useContext, useState, useRef } from 'react'

interface PodcastContextType {
  playPodcast: (url: string, title: string) => void
  stopPodcast: () => void
  isPlaying: boolean
  isReady: boolean
  currentUrl: string | null
  currentTitle: string | null
  togglePlayPause: () => void
  setIsPlaying: (playing: boolean) => void
  setIsReady: (ready: boolean) => void
  audioRef: React.RefObject<HTMLAudioElement>
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined)

export function PodcastProvider({ children }: { children: React.ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null!)

  const playPodcast = (url: string, title: string) => {
    console.log('[Podcast] playPodcast called', { url, title, alreadyPlaying: currentUrl === url })
    if (currentUrl === url) {
      // Toggle when the same stream is already loaded
      togglePlayPause()
      return
    }

    setIsReady(false)
    setCurrentUrl(url)
    setCurrentTitle(title)
    setIsPlaying(true)
  }

  const stopPodcast = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    setCurrentUrl(null)
    setCurrentTitle(null)
    setIsPlaying(false)
    setIsReady(false)
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <PodcastContext.Provider value={{
      playPodcast,
      stopPodcast,
      isPlaying,
      isReady,
      currentUrl,
      currentTitle,
      togglePlayPause,
      setIsPlaying,
      setIsReady,
      audioRef
    }}>
      {children}
    </PodcastContext.Provider>
  )
}

export function usePodcast() {
  const context = useContext(PodcastContext)
  if (context === undefined) {
    throw new Error('usePodcast must be used within a PodcastProvider')
  }
  return context
}
