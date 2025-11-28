"use client"

import { usePodcast } from "@/lib/contexts/PodcastContext"
import { Button } from "@/components/ui/button"
import { X, Play, Pause, Download, Volume2, VolumeX, RotateCcw, RotateCw, ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { motion, AnimatePresence } from "framer-motion"

export function PodcastPlayer() {
  const { currentUrl, currentTitle, isPlaying, togglePlayPause, stopPodcast, setIsPlaying, audioRef } = usePodcast()
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const [isDragging, setIsDragging] = useState(false)

  // Handle progress updates with requestAnimationFrame for smoothness
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let rafId: number

    const updateProgress = () => {
      if (!isDragging) {
        setProgress(audio.currentTime)
      }
      if (isPlaying) {
        rafId = requestAnimationFrame(updateProgress)
      }
    }

    if (isPlaying) {
      rafId = requestAnimationFrame(updateProgress)
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [isPlaying, isDragging, audioRef])

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    // Initial duration check
    if (audio.duration) {
      setDuration(audio.duration)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [audioRef, setIsPlaying])

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback failed", e))
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentUrl, audioRef])

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
    if (isNaN(time)) return "0:00"
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
    }
    setIsDragging(false)
  }

  const handleSkip = (seconds: number) => {
    if (audioRef.current && duration > 0) {
      const newTime = Math.min(Math.max(audioRef.current.currentTime + seconds, 0), duration)
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
    if (currentUrl) {
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
      <audio ref={audioRef} src={currentUrl} crossOrigin="anonymous" />
      
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
                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/5 rounded-full"
                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/5 rounded-full"
                onClick={(e) => { e.stopPropagation(); setIsMinimized(false); }}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/5 rounded-full"
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
                  className="text-gray-400 hover:text-white h-8 w-8"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={stopPodcast}
                  className="text-gray-400 hover:text-white h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[progress]}
                  max={duration > 0 ? duration : 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  onValueCommit={handleSeekCommit}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-mono px-0.5">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
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
