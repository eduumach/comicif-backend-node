import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useInfinitePhotos } from "@/hooks/useInfinitePhotos"
import type { Photo } from "@/services/photos"
import { MediaCategory, MediaCategoryLabels } from "@/types/MediaCategory"
import { Heart, Loader2, Calendar, Download, Filter } from "lucide-react"

export default function Gallery() {
  const [typeFilter, setTypeFilter] = useState<'all' | 'generated' | 'original'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [likingPhoto, setLikingPhoto] = useState<number | null>(null)
  
  const { photos, loading, loadingMore, error, hasMore, totalCount, loadMore, likePhoto } = useInfinitePhotos({
    type: typeFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    limit: 20
  })

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null)

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries
    if (target.isIntersecting && hasMore && !loadingMore) {
      loadMore()
    }
  }, [hasMore, loadingMore, loadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    })

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [handleObserver])

  // Sincroniza selectedPhoto quando photos mudar (para atualizar likes em tempo real)
  useEffect(() => {
    if (selectedPhoto) {
      const updatedPhoto = photos.find(p => p.id === selectedPhoto.id)
      if (updatedPhoto) {
        setSelectedPhoto(updatedPhoto)
      }
    }
  }, [photos, selectedPhoto])

  const handleLike = async (photo: Photo) => {
    setLikingPhoto(photo.id)
    try {
      await likePhoto(photo.id)
    } catch (err) {
      // Error is handled by hook
    } finally {
      setLikingPhoto(null)
    }
  }

  const handleDownload = async (photo: Photo) => {
    try {
      const response = await fetch(photo.path)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${photo.prompt?.title || 'image'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Galeria de Fotos
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore nossa coleção de imagens geradas por IA. Clique para visualizar, curtir ou baixar.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Tipo de Foto</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as fotos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fotos</SelectItem>
                  <SelectItem value="generated">Com IA</SelectItem>
                  <SelectItem value="original">Sem IA (Originais)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <Select value={categoryFilter || "all"} onValueChange={(value) => setCategoryFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {Object.entries(MediaCategoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={MediaCategory[key as keyof typeof MediaCategory]}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setTypeFilter('all')
                  setCategoryFilter('all')
                }}
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </div>
          
          {totalCount > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              {totalCount} {totalCount === 1 ? 'foto encontrada' : 'fotos encontradas'}
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {loading && photos.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-2">Nenhuma imagem encontrada</p>
            <p className="text-sm text-muted-foreground">
              {typeFilter !== 'all' || categoryFilter !== 'all'
                ? 'Tente ajustar os filtros para ver mais resultados' 
                : 'Gere sua primeira imagem para vê-la aqui'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-2 sm:gap-3 auto-rows-[200px] sm:auto-rows-[240px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" style={{ gridAutoFlow: 'dense' }}>
            {photos.map((photo, index) => {
            // Padrão mais controlado para evitar buracos
            const isLarge = index % 10 === 0
            const isTall = index % 6 === 2 && !isLarge
            const isWide = index % 7 === 3 && !isLarge && !isTall

            let gridClass = ''
            if (isLarge) {
              gridClass = 'col-span-2 row-span-2'
            } else if (isTall) {
              gridClass = 'row-span-2'
            } else if (isWide) {
              gridClass = 'col-span-2'
            }

            return (
              <div
                key={photo.id}
                className={`group relative overflow-hidden rounded-xl cursor-pointer bg-card shadow-md hover:shadow-2xl transition-all duration-300 ${gridClass}`}
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.path}
                  alt={photo.prompt?.title || 'Photo'}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />

                {/* Overlay escuro no hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Informações da foto */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold text-white text-sm sm:text-base mb-2 line-clamp-2">
                    {photo.prompt?.title || 'Foto Original'}
                  </h3>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center text-xs text-white/80">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(photo)
                        }}
                        className="h-8 px-2 sm:px-3 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(photo)
                        }}
                        disabled={likingPhoto === photo.id}
                        className="h-8 px-2 sm:px-3 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                      >
                        {likingPhoto === photo.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Heart className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{photo.likes}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Badge de likes no canto superior direito (sempre visível) */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-white" />
                  <span className="font-medium">{photo.likes}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Infinite Scroll Loading Indicator */}
        <div ref={observerTarget} className="flex items-center justify-center py-8">
          {loadingMore && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm text-muted-foreground">Carregando mais fotos...</span>
            </div>
          )}
          {!hasMore && photos.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Você chegou ao fim da galeria 🎉
            </p>
          )}
        </div>
      </>
      )}

      {/* Photo Detail Dialog - Mobile Optimized */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        {selectedPhoto && (
          <DialogContent className="max-w-full sm:max-w-4xl lg:max-w-6xl w-full h-full sm:h-auto sm:max-h-[95vh] p-0 overflow-hidden gap-0">
            <div className="flex flex-col h-full sm:max-h-[95vh]">
              {/* Header - Compacto no mobile */}
              <DialogHeader className="px-4 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-3 border-b shrink-0">
                <DialogTitle className="text-base sm:text-xl md:text-2xl font-bold pr-8 line-clamp-2">
                  {selectedPhoto.prompt?.title || 'Foto Original'}
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{new Date(selectedPhoto.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}</span>
                </div>
              </DialogHeader>

              {/* Image - Ocupa todo espaço disponível no mobile */}
              <div className="flex-1 flex items-center justify-center bg-black/5 dark:bg-black/20 p-2 sm:p-6 overflow-hidden min-h-0">
                <img
                  src={selectedPhoto.path}
                  alt={selectedPhoto.prompt?.title || 'Photo'}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />
              </div>

              {/* Footer Actions - Fixo na parte inferior no mobile */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-background shrink-0 safe-bottom">
                <div className="flex flex-col gap-3">
                  {/* Likes Display */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 fill-red-500" />
                    <span className="font-semibold text-base sm:text-lg">{selectedPhoto.likes}</span>
                    <span className="text-muted-foreground">
                      {selectedPhoto.likes === 1 ? 'curtida' : 'curtidas'}
                    </span>
                  </div>

                  {/* Action Buttons - Grid 2 colunas no mobile */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleLike(selectedPhoto)}
                      disabled={likingPhoto === selectedPhoto.id}
                      size="lg"
                      className="w-full min-h-[52px] sm:min-h-[48px] text-base touch-manipulation"
                    >
                      {likingPhoto === selectedPhoto.id ? (
                        <Loader2 className="h-5 w-5 sm:mr-2 animate-spin" />
                      ) : (
                        <>
                          <Heart className="h-5 w-5 sm:mr-2" />
                          <span className="hidden sm:inline">Curtir</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant="default"
                      onClick={() => handleDownload(selectedPhoto)}
                      size="lg"
                      className="w-full min-h-[52px] sm:min-h-[48px] text-base touch-manipulation"
                    >
                      <Download className="h-5 w-5 sm:mr-2" />
                      <span className="hidden sm:inline">Baixar</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}