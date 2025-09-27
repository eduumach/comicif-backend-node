import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { usePrompts } from "@/hooks/usePrompts"
import { usePhotos } from "@/hooks/usePhotos"
import type { Prompt } from "@/services/prompts"
import type { Photo } from "@/services/photos"
import { Loader2, Sparkles, Image as ImageIcon, Calendar, User } from "lucide-react"

export default function Generate() {
  const { prompts, loading: promptsLoading, error: promptsError } = usePrompts()
  const { generatePhoto, generating, error: photosError } = usePhotos()
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [generatedPhoto, setGeneratedPhoto] = useState<Photo | null>(null)
  const [showResult, setShowResult] = useState(false)

  const handleGenerate = async (prompt: Prompt) => {
    try {
      setSelectedPrompt(prompt)
      const photo = await generatePhoto({ promptId: prompt.id })
      setGeneratedPhoto(photo)
      setShowResult(true)
    } catch (err) {
      // Error is handled by hook
    }
  }

  const error = promptsError || photosError

  if (promptsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Generate Images</h1>
        <p className="text-muted-foreground">
          Select a prompt to generate a new AI image
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {prompts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No prompts available</p>
            <p className="text-sm text-muted-foreground mb-4">
              Create some prompts first to generate images
            </p>
            <Button onClick={() => window.location.href = '/prompts'}>
              Create Prompts
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{prompt.title}</span>
                  {prompt.person_count > 0 && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      {prompt.person_count}
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {prompt.prompt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(prompt.createdAt).toLocaleDateString()}
                  </div>
                  <Button
                    onClick={() => handleGenerate(prompt)}
                    disabled={generating}
                    size="sm"
                  >
                    {generating && selectedPrompt?.id === prompt.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Generation Status */}
      {generating && selectedPrompt && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">Generating image...</p>
                <p className="text-sm text-muted-foreground">
                  Using prompt: "{selectedPrompt.title}"
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        {generatedPhoto && (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Image Generated Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={`/api/files/${generatedPhoto.path}`}
                  alt={generatedPhoto.prompt.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />
              </div>

              <div className="space-y-2">
                <div>
                  <h4 className="font-medium">{generatedPhoto.prompt.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {generatedPhoto.prompt.prompt}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Generated: {new Date(generatedPhoto.createdAt).toLocaleString()}
                  </p>
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/gallery'}
                    >
                      View Gallery
                    </Button>
                    <Button onClick={() => setShowResult(false)}>
                      Generate Another
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