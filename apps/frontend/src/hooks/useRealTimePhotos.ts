import { useState, useEffect, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { photoService, type Photo } from '@/services/photos'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function useRealTimePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const lastFetchRef = useRef<Date>(new Date())
  const pollingIntervalRef = useRef<number | null>(null)

  // Fetch initial photos
  const fetchInitialPhotos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await photoService.getAll()
      setPhotos(data.photos)
      lastFetchRef.current = new Date()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch photos since last update (polling fallback)
  const fetchNewPhotos = useCallback(async () => {
    try {
      const timestamp = lastFetchRef.current.toISOString()
      const response = await fetch(`${BACKEND_URL}/api/photos/since/${timestamp}`)

      if (!response.ok) {
        throw new Error('Failed to fetch new photos')
      }

      const data = await response.json()

      if (data.photos && data.photos.length > 0) {
        setPhotos(prev => {
          // Add new photos at the beginning, avoiding duplicates
          const newPhotos = data.photos.filter((newPhoto: Photo) =>
            !prev.some(existingPhoto => existingPhoto.id === newPhoto.id)
          )
          return [...newPhotos, ...prev]
        })
        lastFetchRef.current = new Date()
      }
    } catch (err) {
      console.warn('Polling fallback failed:', err)
      // Don't set error state for polling failures, just log
    }
  }, [])

  // Add new photo from WebSocket
  const addNewPhoto = useCallback((newPhoto: Photo) => {
    setPhotos(prev => {
      // Check if photo already exists to avoid duplicates
      if (prev.some(photo => photo.id === newPhoto.id)) {
        return prev
      }
      return [newPhoto, ...prev]
    })
    lastFetchRef.current = new Date()
  }, [])

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('WebSocket connected')
      setConnected(true)
      setError(null)
    })

    socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason)
      setConnected(false)

      // If disconnect was not intentional, try to reconnect
      if (reason === 'io server disconnect') {
        socket.connect()
      }
    })

    socket.on('connect_error', (error) => {
      console.warn('WebSocket connection error:', error)
      setConnected(false)
      // Don't set error state, fallback to polling
    })

    socket.on('new-photo', (photo: Photo) => {
      console.log('New photo received via WebSocket:', photo)
      addNewPhoto(photo)
    })

    return () => {
      socket.disconnect()
    }
  }, [addNewPhoto])

  // Setup polling fallback
  useEffect(() => {
    // Start polling after initial load
    if (!loading) {
      pollingIntervalRef.current = window.setInterval(() => {
        // Only poll if WebSocket is not connected or as backup
        if (!connected) {
          fetchNewPhotos()
        } else {
          // Even when connected, occasionally poll as backup
          if (Math.random() < 0.1) { // 10% chance every interval
            fetchNewPhotos()
          }
        }
      }, 10000) // Poll every 10 seconds
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [loading, connected, fetchNewPhotos])

  // Initial fetch
  useEffect(() => {
    fetchInitialPhotos()
  }, [fetchInitialPhotos])

  const refetch = useCallback(() => {
    fetchInitialPhotos()
  }, [fetchInitialPhotos])

  return {
    photos,
    loading,
    error,
    connected,
    refetch,
  }
}