import { useState, useEffect, useCallback } from "react"
import { usePhotos } from "@/hooks/usePhotos"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"

export default function EventCarousel() {
  const { photos, refetch } = usePhotos()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [mouseTimer, setMouseTimer] = useState<number | null>(null)

  // Auto-advance timer (7 seconds per image)
  useEffect(() => {
    if (!isPlaying || photos.length === 0) return

    const timer = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length)
        setIsTransitioning(false)
      }, 300) // Transition duration
    }, 7000) // 7 seconds per image

    return () => clearInterval(timer)
  }, [isPlaying, photos.length])

  // Auto-refresh timer (fetch new photos every 30 seconds)
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      refetch()
    }, 30000) // 30 seconds

    return () => clearInterval(refreshTimer)
  }, [refetch])

  // Keyboard controls
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    switch (e.code) {
      case 'Space':
        e.preventDefault()
        setIsPlaying(prev => !prev)
        break
      case 'ArrowLeft':
        e.preventDefault()
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
          setIsTransitioning(false)
        }, 300)
        break
      case 'ArrowRight':
        e.preventDefault()
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % photos.length)
          setIsTransitioning(false)
        }, 300)
        break
      case 'Escape':
        e.preventDefault()
        // Toggle fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.documentElement.requestFullscreen()
        }
        break
    }
  }, [photos.length])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  // Mouse movement handler
  const handleMouseMove = useCallback(() => {
    setShowControls(true)

    // Clear existing timer
    if (mouseTimer) {
      clearTimeout(mouseTimer)
    }

    // Set new timer to hide controls after 3 seconds of inactivity
    const timer = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    setMouseTimer(timer)
  }, [mouseTimer])

  // Mouse move effect
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)

    // Start with controls hidden after 3 seconds
    const initialTimer = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (mouseTimer) clearTimeout(mouseTimer)
      clearTimeout(initialTimer)
    }
  }, [handleMouseMove])

  // Auto-enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen()
        } catch (err) {
          console.log('Fullscreen request failed:', err)
        }
      }
    }
    enterFullscreen()
  }, [])

  const nextImage = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length)
      setIsTransitioning(false)
    }, 300)
  }

  const previousImage = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
      setIsTransitioning(false)
    }, 300)
  }

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev)
  }

  if (photos.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-2xl text-center">
          <div className="mb-4">Aguardando imagens...</div>
          <div className="text-lg opacity-70">As imagens geradas aparecerão aqui automaticamente</div>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div className="fixed inset-0 bg-black overflow-hidden cursor-none">
      {/* Main Image */}
      <div className="relative w-full h-full flex items-center justify-center">
        <img
          src={currentPhoto.path}
          alt={currentPhoto.prompt.title}
          className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23000"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%23fff">Imagem não encontrada</text></svg>'
          }}
        />

        {/* Loading overlay during transition */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Controls Overlay - Only visible when mouse moves */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Navigation Buttons */}
        <button
          onClick={previousImage}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
          aria-label="Imagem anterior"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        <button
          onClick={nextImage}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
          aria-label="Próxima imagem"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
          aria-label={isPlaying ? "Pausar" : "Reproduzir"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        {/* Info Panel */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-4 rounded-lg max-w-sm">
          <h3 className="font-medium mb-1">{currentPhoto.prompt.title}</h3>
          <p className="text-sm opacity-80">{currentIndex + 1} de {photos.length}</p>
          <p className="text-xs opacity-60 mt-1">
            {new Date(currentPhoto.createdAt).toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Instructions */}
        <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg">
          <div className="text-sm space-y-1">
            <div><strong>Espaço:</strong> Pausar/Reproduzir</div>
            <div><strong>←/→:</strong> Navegar</div>
            <div><strong>ESC:</strong> Tela cheia</div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm">{isPlaying ? 'Reproduzindo' : 'Pausado'}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{
            width: `${((currentIndex + 1) / photos.length) * 100}%`
          }}
        ></div>
      </div>
    </div>
  )
}