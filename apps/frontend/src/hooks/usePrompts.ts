import { useState, useEffect } from 'react'
import { promptService, type Prompt, type CreatePromptData, type UpdatePromptData } from '@/services/prompts'
import { MediaCategory } from '@/types/MediaCategory'

export function usePrompts(categoryFilter?: MediaCategory | null) {
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPrompts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await promptService.getAll(categoryFilter)
      setPrompts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prompts')
    } finally {
      setLoading(false)
    }
  }

  const createPrompt = async (data: CreatePromptData) => {
    try {
      setError(null)
      const newPrompt = await promptService.create(data)
      setPrompts(prev => [...prev, newPrompt])
      return newPrompt
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create prompt'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updatePrompt = async (id: number, data: UpdatePromptData) => {
    try {
      setError(null)
      const updatedPrompt = await promptService.update(id, data)
      setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p))
      return updatedPrompt
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update prompt'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const deletePrompt = async (id: number) => {
    try {
      setError(null)
      await promptService.delete(id)
      setPrompts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete prompt'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchPrompts()
  }, [categoryFilter])

  return {
    prompts,
    loading,
    error,
    createPrompt,
    updatePrompt,
    deletePrompt,
    refetch: fetchPrompts,
  }
}