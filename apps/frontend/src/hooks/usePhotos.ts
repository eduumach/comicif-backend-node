import { useState, useEffect } from 'react'
import { photoService, type Photo, type GeneratePhotoData, type GenerateRandomPhotoData } from '@/services/photos'

export function usePhotos() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await photoService.getAll()
      setPhotos(data.photos)
      setCount(data.count)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos')
    } finally {
      setLoading(false)
    }
  }

  const generatePhoto = async (data: GeneratePhotoData) => {
    try {
      setGenerating(true)
      setError(null)
      const newPhoto = await photoService.generate(data)
      setPhotos(prev => [newPhoto, ...prev])
      setCount(prev => prev + 1)
      return newPhoto
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate photo'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const generateRandomPhoto = async (data: GenerateRandomPhotoData) => {
    try {
      setGenerating(true)
      setError(null)
      const newPhoto = await photoService.generateRandom(data)
      setPhotos(prev => [newPhoto, ...prev])
      setCount(prev => prev + 1)
      return newPhoto
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate random photo'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setGenerating(false)
    }
  }

  const likePhoto = async (id: number) => {
    // Atualização otimista - incrementa o like imediatamente
    setPhotos(prev => prev.map(p =>
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    ))

    try {
      setError(null)
      const updatedPhoto = await photoService.like(id)
      // Atualiza com os dados reais do servidor
      setPhotos(prev => prev.map(p => p.id === id ? updatedPhoto : p))
      return updatedPhoto
    } catch (err) {
      // Reverte o like em caso de erro
      setPhotos(prev => prev.map(p =>
        p.id === id ? { ...p, likes: p.likes - 1 } : p
      ))
      const errorMessage = err instanceof Error ? err.message : 'Failed to like photo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  return {
    photos,
    count,
    loading,
    error,
    generating,
    generatePhoto,
    generateRandomPhoto,
    likePhoto,
    refetch: fetchPhotos,
  }
}