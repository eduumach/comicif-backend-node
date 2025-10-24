import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePhotos } from "@/hooks/usePhotos"
import type { Photo } from "@/services/photos"
import { Heart, Loader2, Calendar, Download } from "lucide-react"

export default function Gallery() {
  const { photos, loading, error, likePhoto } = usePhotos()
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [likingPhoto, setLikingPhoto] = useState<number | null>(null)

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
      link.download = `${photo.prompt.title || 'image'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-4">
      <div className="space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Photo Gallery
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Explore our collection of AI-generated images. Click to view, like or download.
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {photos.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-2">No images generated yet</p>
            <p className="text-sm text-muted-foreground">Generate your first image to see it here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2 sm:gap-3 auto-rows-[200px] sm:auto-rows-[240px] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                  alt={photo.prompt.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />

                {/* Overlay escuro no hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Informações da foto */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold text-white text-sm sm:text-base mb-2 line-clamp-2">{photo.prompt.title}</h3>
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
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        {selectedPhoto && (
          <DialogContent className="max-w-[96vw] sm:max-w-4xl lg:max-w-6xl max-h-[95vh] p-0 overflow-hidden">
            <div className="flex flex-col h-full max-h-[95vh]">
              {/* Header */}
              <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 border-b">
                <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold pr-8">
                  {selectedPhoto.prompt.title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(selectedPhoto.createdAt).toLocaleString()}</span>
                </div>
              </DialogHeader>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center bg-black/5 dark:bg-black/20 p-3 sm:p-6 overflow-hidden">
                <img
                  src={selectedPhoto.path}
                  alt={selectedPhoto.prompt.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  style={{ maxHeight: 'calc(95vh - 200px)' }}
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />
              </div>

              {/* Footer Actions */}
              <div className="px-4 sm:px-6 py-4 border-t bg-background/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* Likes Display */}
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    <span className="font-semibold">{selectedPhoto.likes}</span>
                    <span className="text-muted-foreground">
                      {selectedPhoto.likes === 1 ? 'like' : 'likes'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="default"
                      onClick={() => handleLike(selectedPhoto)}
                      disabled={likingPhoto === selectedPhoto.id}
                      size="lg"
                      className="w-full sm:w-auto min-h-[48px]"
                    >
                      {likingPhoto === selectedPhoto.id ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Heart className="h-5 w-5 mr-2" />
                      )}
                      Like
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedPhoto)}
                      size="lg"
                      className="w-full sm:w-auto min-h-[48px]"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download
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