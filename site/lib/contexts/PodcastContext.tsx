"use client"

import React, { createContext, useContext, useState, useRef } from 'react'

interface PodcastContextType {
  playPodcast: (url: string, title: string) => void
  stopPodcast: () => void
  isPlaying: boolean
  currentUrl: string | null
  currentTitle: string | null
  togglePlayPause: () => void
  setIsPlaying: (playing: boolean) => void
  audioRef: React.RefObject<HTMLAudioElement>
}

const PodcastContext = createContext<PodcastContextType | undefined>(undefined)

export function PodcastProvider({ children }: { children: React.ReactNode }) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [currentTitle, setCurrentTitle] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null!)

  const playPodcast = (url: string, title: string) => {
    if (currentUrl === url) {
      togglePlayPause()
      return
    }
    setCurrentUrl(url)
    setCurrentTitle(title)
    setIsPlaying(true)
  }

  const stopPodcast = () => {
    setCurrentUrl(null)
    setCurrentTitle(null)
    setIsPlaying(false)
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
      currentUrl,
      currentTitle,
      togglePlayPause,
      setIsPlaying,
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
