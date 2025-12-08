"use client"

import { usePodcast } from "@/lib/contexts/PodcastContext"
import { Button } from "@/components/ui/button"
import { X, Play, Pause, Download, Volume2, VolumeX, RotateCcw, RotateCw, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { getPodcast } from "@/app/documents/actions"

export function PodcastPlayer() {
  const { currentUrl, currentTitle, isPlaying, isReady, togglePlayPause, stopPodcast, setIsPlaying, setIsReady, audioRef } = usePodcast()
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [buffered, setBuffered] = useState(0)
  const [hasAudioData, setHasAudioData] = useState(false)

  const [isDragging, setIsDragging] = useState(false)

  // Handle progress updates with smooth RAF
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let rafId: number

    const updateProgress = () => {
      if (!isDragging && audio.currentTime !== undefined) {
        setProgress(audio.currentTime)
        if (audio.currentTime > 0 && !hasAudioData) {
          setHasAudioData(true)
        }
      }
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1))
        if (audio.buffered.end(audio.buffered.length - 1) > 0 && !hasAudioData) {
          setHasAudioData(true)
        }
      }
      // Try to backfill duration during streaming if still unknown
      if ((!duration || !isFinite(duration)) && audio.seekable.length > 0) {
        const seekableEnd = audio.seekable.end(audio.seekable.length - 1)
        if (!isNaN(seekableEnd) && seekableEnd > 0) {
          setDuration(seekableEnd)
        }
      }
      if (isPlaying) {
        rafId = requestAnimationFrame(updateProgress)
      }
    }

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setProgress(audio.currentTime)
        if (audio.currentTime > 0 && !hasAudioData) {
          setHasAudioData(true)
        }
      }
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1))
        if (audio.buffered.end(audio.buffered.length - 1) > 0 && !hasAudioData) {
          setHasAudioData(true)
        }
      }
    }

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1))
        if (audio.buffered.end(audio.buffered.length - 1) > 0 && !hasAudioData) {
          setHasAudioData(true)
        }
      }
    }

    if (isPlaying) {
      rafId = requestAnimationFrame(updateProgress)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('progress', handleProgress)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('progress', handleProgress)
    }
  }, [isDragging, isPlaying, audioRef, duration])

  // Handle audio events, streaming readiness, and duration updates
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const isStreamingSource = currentUrl?.includes('/api/podcast/stream')

    const updateDuration = () => {
      const d = audio.duration
      if (d && !isNaN(d) && isFinite(d)) {
        setDuration(d)
        // For cached/static files mark ready immediately; for streaming wait for saved metadata
        if (!isStreamingSource && d > 0) {
          setIsReady(true)
        }
        return
      }

      // Fallback for streaming sources without known duration (duration = Infinity)
      if (audio.seekable?.length > 0) {
        const seekableEnd = audio.seekable.end(audio.seekable.length - 1)
        if (!isNaN(seekableEnd) && seekableEnd > 0) {
          setDuration(seekableEnd)
          return
        }
      }

      if (audio.buffered?.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1)
        if (!isNaN(bufferedEnd) && bufferedEnd > 0) {
          setDuration(bufferedEnd)
        }
      }
    }

    const handleLoadedMetadata = () => {
      updateDuration()
    }

    const handleLoadedData = () => {
      setHasAudioData(true)
      updateDuration()
    }

    const handleCanPlay = () => {
      setHasAudioData(true)
      updateDuration()
    }

    const handleDurationChange = () => {
      updateDuration()
    }

    const handlePlaying = () => {
      setHasAudioData(true)
      updateDuration()
    }

    const handleEnded = () => {
      // Ensure we capture final duration when streams report Infinity
      const endTime = audio.currentTime || duration
      if (endTime && endTime > duration) {
        setDuration(endTime)
      }
      setIsPlaying(false)
      setProgress(0)
    }

    const handleError = () => {
      const error = audio.error
      if (error) {
        console.error(`Audio playback error: Code ${error.code}, Message: ${error.message}`)
      } else {
        console.error('Audio playback error: Unknown error')
      }
      setIsPlaying(false)
      setIsReady(false)
      setHasAudioData(false)
      toast.error("Failed to play podcast. Please try again. If you were signed out, please sign back in and retry.")
    }

    // Kick off duration check quickly for known durations (non-stream fallback)
    updateDuration()

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('playing', handlePlaying)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('playing', handlePlaying)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [audioRef, setIsPlaying, setIsReady, currentUrl])

  // Poll duration/seekable while streaming if metadata is missing
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || isReady || !currentUrl) return

    const isStreamingSource = currentUrl.includes('/api/podcast/stream')

    const interval = setInterval(() => {
      // Try seekable first (preferred for streams)
      if (audio.seekable?.length > 0) {
        const end = audio.seekable.end(audio.seekable.length - 1)
        if (!isNaN(end) && end > 0) {
          setDuration(end)
          if (!isStreamingSource) {
            setIsReady(true)
          }
          return
        }
      }

      // Fallback to buffered range
      if (audio.buffered?.length > 0) {
        const end = audio.buffered.end(audio.buffered.length - 1)
        if (!isNaN(end) && end > 0) {
          setDuration(end)
        }
      }

      // If duration becomes finite, mark ready
      if (audio.duration && isFinite(audio.duration) && !isNaN(audio.duration)) {
        setDuration(audio.duration)
        if (!isStreamingSource) {
          setIsReady(true)
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [audioRef, currentUrl, isReady, setIsReady])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Autoplay once any audio data is available for streaming; browsers may block autoplay without user gesture
    if (isPlaying) {
      audio.play().catch(e => console.error("Playback failed", e))
    } else {
      audio.pause()
    }
  }, [isPlaying, currentUrl, audioRef])

  // Reset progress when URL changes
  useEffect(() => {
    setProgress(0)
    setDuration(0)
    setHasAudioData(false)
  }, [currentUrl])

  // When streaming a fresh podcast, poll (with backoff) for the saved file after first audio data arrives, then swap to the saved file to read real duration
  useEffect(() => {
    // Only start polling after we know we received some audio data (first chunk)
    if (!currentUrl || isReady || !hasAudioData) return

    let cancelled = false
    let switched = false
    const url = (() => {
      try {
        return new URL(currentUrl, window.location.origin)
      } catch (e) {
        return null
      }
    })()

    const documentId = url?.searchParams.get('documentId')
    if (!documentId) return

    let timeout: ReturnType<typeof setTimeout> | null = null
    let attempts = 0
    let delay = 1500 // start after initial 1.5s to allow upload to begin

    const pollForSaved = async () => {
      if (cancelled) return
      attempts += 1
      try {
        const existing = await getPodcast(documentId)
        if (existing?.audio_url && audioRef.current && !switched) {
          const audio = audioRef.current
          const wasPlaying = isPlaying
          const currentTime = audio.currentTime || 0
          const savedUrl = existing.audio_url

          switched = true

          const handleSavedMetadata = () => {
            if (cancelled) return
            const metaDuration = audio.duration
            if (metaDuration && isFinite(metaDuration) && !isNaN(metaDuration)) {
              setDuration(metaDuration)
              setIsReady(true)
            }
            setHasAudioData(true)
            audio.currentTime = currentTime
            if (wasPlaying) {
              audio.play().catch(() => {})
            }
          }

          audio.addEventListener('loadedmetadata', handleSavedMetadata, { once: true })
          audio.src = savedUrl
          audio.load()
          return
        }
      } catch (e) {
        console.error('Podcast metadata poll failed', e)
      }

      if (attempts < 40) {
        // Exponential-ish backoff capped at 8s to handle slower uploads
        delay = Math.min(delay * 1.25, 8000)
        timeout = setTimeout(pollForSaved, delay)
      }
    }

    timeout = setTimeout(pollForSaved, delay)

    return () => {
      cancelled = true
      if (timeout) clearTimeout(timeout)
    }
  }, [currentUrl, isReady, hasAudioData, isPlaying, setIsReady])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, audioRef])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
      setIsMuted(volume === 0)
    }
  }, [volume, audioRef])

  const formatTime = (time: number) => {
    if (isNaN(time) || time <= 0 || !isFinite(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSeek = (value: number[]) => {
    setIsDragging(true)
    setProgress(value[0])
  }

  const handleSeekCommit = (value: number[]) => {
    const time = value[0]
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setProgress(time)
    }
    setIsDragging(false)
  }

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime
      const maxTime = duration > 0 ? duration : audioRef.current.duration || currentTime + Math.abs(seconds)
      const newTime = Math.min(Math.max(currentTime + seconds, 0), maxTime)
      audioRef.current.currentTime = newTime
      setProgress(newTime)
    }
  }

  const handlePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75]
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length]
    setPlaybackRate(nextRate)
  }

  const handleDownload = async () => {
    if (!currentUrl) return
    try {
      const response = await fetch(currentUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${currentTitle || 'podcast'}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuted = !isMuted
      audioRef.current.muted = newMuted
      setIsMuted(newMuted)
      if (newMuted) {
        setVolume(0)
      } else {
        setVolume(1)
        audioRef.current.volume = 1
      }
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  if (!currentUrl) return null

  return (
    <motion.div
      layout
      className={cn(
        "fixed bottom-6 right-6 z-50 bg-[#0A0A0A] border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden",
        isMinimized ? "rounded-full" : "rounded-xl w-[360px]"
      )}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Do not set crossOrigin so cookies/auth are sent for same-origin streaming */}
      <audio ref={audioRef} src={currentUrl} />
      
      <AnimatePresence mode="popLayout" initial={false}>
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 py-2 pr-4 pl-5"
          >
            <div className="flex flex-col max-w-[120px]">
              <span className="text-xs font-medium text-white truncate">{currentTitle}</span>
              <span className="text-[10px] text-gray-400">{formatTime(progress)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/10 rounded-full transition-all hover:scale-110"
                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all hover:scale-110"
                onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-gray-300 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all hover:scale-110"
                onClick={(e) => { e.stopPropagation(); stopPodcast(); }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-white truncate" title={currentTitle || 'Podcast'}>
                    {currentTitle || 'Podcast'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">Audio Explanation</p>
                </div>
              </div>
              <div className="flex items-center gap-1 -mr-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsMinimized(true)}
                  className="text-gray-300 hover:text-white hover:bg-white/10 h-9 w-9 rounded-full transition-all hover:scale-110"
                  title="Minimize"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={stopPodcast}
                  className="text-gray-300 hover:text-red-400 hover:bg-red-500/20 h-9 w-9 rounded-full transition-all hover:scale-110"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="relative h-4 w-full flex items-center">
                  {/* Buffered Bar */}
                  <div 
                    className="absolute left-0 h-1.5 rounded-full bg-white/20 transition-all duration-300 ease-out pointer-events-none"
                    style={{ width: `${duration > 0 ? (buffered / duration) * 100 : 0}%` }}
                  />
                  <Slider
                    value={[progress]}
                    max={duration > 0 ? duration : 100}
                    step={0.1}
                    onValueChange={handleSeek}
                    onValueCommit={handleSeekCommit}
                    className="cursor-pointer group [&>span:first-child]:bg-transparent [&>span:first-child]:h-1.5 [&>span>span]:bg-gradient-to-r [&>span>span]:from-white [&>span>span]:to-gray-300 [&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-xl [&_[role=slider]]:shadow-white/20 [&_[role=slider]]:opacity-0 group-hover:[&_[role=slider]]:opacity-100 [&_[role=slider]]:transition-all hover:[&_[role=slider]]:scale-125 active:[&_[role=slider]]:opacity-100 active:[&_[role=slider]]:scale-110"
                  />
                </div>
                <div className="flex justify-between items-center px-0.5">
                  <span className="text-xs text-white font-medium font-mono">{formatTime(progress)}</span>
                  <span className="text-xs text-gray-500 font-mono flex items-center gap-1">
                    {isReady && duration > 0 ? (
                      formatTime(duration)
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="text-[10px] uppercase tracking-wide text-gray-400">loading</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => handleSkip(-15)}
                  title="Rewind 15s"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  variant="default"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-white text-black hover:bg-gray-200 shadow-lg shadow-white/10"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                  onClick={() => handleSkip(15)}
                  title="Forward 15s"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>

              {/* Secondary Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 w-12"
                    onClick={handlePlaybackRate}
                    title="Playback Speed"
                  >
                    {playbackRate}x
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div 
                    className="flex items-center gap-2 group relative"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <div className={cn(
                      "absolute bottom-full left-1/2 -translate-x-1/2 pb-2 transition-all duration-200",
                      showVolumeSlider ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                    )}>
                      <div className="bg-[#1A1A1A] border border-white/10 p-3 rounded-lg shadow-xl h-32 w-10 flex justify-center">
                        <Slider
                          orientation="vertical"
                          value={[volume]}
                          max={1}
                          step={0.01}
                          onValueChange={handleVolumeChange}
                          className="h-full"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                      onClick={toggleMute}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5"
                    onClick={handleDownload}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
