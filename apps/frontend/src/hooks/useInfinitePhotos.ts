import { useState, useEffect, useCallback } from 'react'
import { photoService, type Photo, type PhotoFilters } from '@/services/photos'

export function useInfinitePhotos(filters: PhotoFilters = {}) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const fetchPhotos = useCallback(async (pageNum: number, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const data = await photoService.getAll({
        ...filters,
        page: pageNum,
        limit: filters.limit || 20
      })
      
      if (isLoadMore) {
        setPhotos(prev => [...prev, ...data.photos])
      } else {
        setPhotos(data.photos)
      }
      
      setHasMore(data.hasMore)
      setTotalCount(data.totalCount)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch photos')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPhotos(page + 1, true)
    }
  }, [loadingMore, hasMore, page, fetchPhotos])

  const likePhoto = async (id: number) => {
    // Atualização otimista
    setPhotos(prev => prev.map(p =>
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    ))

    try {
      setError(null)
      const updatedPhoto = await photoService.like(id)
      setPhotos(prev => prev.map(p => p.id === id ? updatedPhoto : p))
      return updatedPhoto
    } catch (err) {
      // Reverte em caso de erro
      setPhotos(prev => prev.map(p =>
        p.id === id ? { ...p, likes: p.likes - 1 } : p
      ))
      const errorMessage = err instanceof Error ? err.message : 'Failed to like photo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deletePhoto = async (id: number) => {
    try {
      setError(null)
      await photoService.delete(id)
      // Remove a foto da lista e atualiza o total
      setPhotos(prev => prev.filter(p => p.id !== id))
      setTotalCount(prev => prev - 1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete photo'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const refetch = useCallback(() => {
    setPage(1)
    fetchPhotos(1, false)
  }, [fetchPhotos])

  // Reset when filters change
  useEffect(() => {
    setPage(1)
    fetchPhotos(1, false)
  }, [filters.type, filters.category])

  return {
    photos,
    loading,
    loadingMore,
    error,
    hasMore,
    totalCount,
    loadMore,
    likePhoto,
    deletePhoto,
    refetch,
  }
}
