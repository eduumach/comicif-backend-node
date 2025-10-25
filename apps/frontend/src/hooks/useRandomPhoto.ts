import { useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

interface Photo {
  id: number
  path: string
  likes: number
  type?: string
  createdAt: string
  updatedAt: string
  prompt?: {
    id: number
    title: string
    prompt: string
    category?: string
  } | null
}

interface UseRandomPhotoReturn {
  currentPhoto: Photo | null
  loading: boolean
  error: string | null
  fetchRandomPhoto: () => Promise<void>
  totalPhotos: number
}

export function useRandomPhoto(autoFetch = true, intervalMs = 7000): UseRandomPhotoReturn {
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPhotos, setTotalPhotos] = useState(0)
  const [seenPhotoIds, setSeenPhotoIds] = useState<Set<number>>(new Set())

  const fetchRandomPhoto = useCallback(async () => {
    try {
      setError(null)
      const response = await api.get('/photos/random')
      const photo = response.data

      // If we've seen this photo and there are more photos available, try again
      if (seenPhotoIds.has(photo.id) && seenPhotoIds.size < totalPhotos && totalPhotos > 1) {
        // Try once more to get a different photo
        const retryResponse = await api.get('/photos/random')
        const retryPhoto = retryResponse.data
        setCurrentPhoto(retryPhoto)
        setSeenPhotoIds(prev => new Set([...prev, retryPhoto.id]))
      } else {
        setCurrentPhoto(photo)
        setSeenPhotoIds(prev => new Set([...prev, photo.id]))
      }

      setLoading(false)
    } catch (err: any) {
      console.error('Erro ao buscar foto aleatória:', err)
      setError(err.response?.data?.error || 'Erro ao buscar foto')
      setLoading(false)
    }
  }, [seenPhotoIds, totalPhotos])

  // Get total photo count on mount
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await api.get('/photos?limit=1')
        setTotalPhotos(response.data.totalCount || 0)
      } catch (err) {
        console.error('Erro ao buscar contagem de fotos:', err)
      }
    }
    fetchCount()
  }, [])

  // Reset seen photos when total count changes significantly
  useEffect(() => {
    if (seenPhotoIds.size > totalPhotos * 0.8 && totalPhotos > 0) {
      setSeenPhotoIds(new Set())
    }
  }, [totalPhotos, seenPhotoIds.size])

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchRandomPhoto()
    }
  }, [])

  // Auto-fetch interval
  useEffect(() => {
    if (!autoFetch || intervalMs <= 0) return

    const interval = setInterval(() => {
      fetchRandomPhoto()
    }, intervalMs)

    return () => clearInterval(interval)
  }, [autoFetch, intervalMs, fetchRandomPhoto])

  return {
    currentPhoto,
    loading,
    error,
    fetchRandomPhoto,
    totalPhotos
  }
}
