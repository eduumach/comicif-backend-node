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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Gallery</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Browse all generated images
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
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group cursor-pointer flex flex-col h-full">
              <div
                className="relative h-48 sm:h-64 bg-muted flex-shrink-0 overflow-hidden rounded-t-lg"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.path}
                  alt={photo.prompt.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
              <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
                <h3 className="font-medium truncate mb-2 text-sm sm:text-base">{photo.prompt.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{new Date(photo.createdAt).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(photo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(photo)
                    }}
                    disabled={likingPhoto === photo.id}
                    className="h-8 px-2 flex-shrink-0 min-w-[44px]"
                  >
                    {likingPhoto === photo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-1" />
                        {photo.likes}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        {selectedPhoto && (
          <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-6xl max-h-[90vh] p-3 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">{selectedPhoto.prompt.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-center bg-muted rounded-lg p-2 sm:p-4">
                <img
                  src={selectedPhoto.path}
                  alt={selectedPhoto.prompt.title}
                  className="max-w-full max-h-[50vh] sm:max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-xs sm:text-sm">Created: {new Date(selectedPhoto.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(selectedPhoto)}
                      size="sm"
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => handleLike(selectedPhoto)}
                      disabled={likingPhoto === selectedPhoto.id}
                      size="sm"
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      {likingPhoto === selectedPhoto.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Heart className="h-4 w-4 mr-2" />
                      )}
                      {selectedPhoto.likes} Like{selectedPhoto.likes !== 1 ? 's' : ''}
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