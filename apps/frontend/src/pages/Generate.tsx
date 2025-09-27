import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { usePrompts } from "@/hooks/usePrompts"
import { usePhotos } from "@/hooks/usePhotos"
import type { Prompt } from "@/services/prompts"
import type { Photo } from "@/services/photos"
import { Loader2, Sparkles, Image as ImageIcon, Calendar, User, Upload, Shuffle } from "lucide-react"

export default function Generate() {
  const { prompts, loading: promptsLoading, error: promptsError } = usePrompts()
  const { generatePhoto, generateRandomPhoto, generating, error: photosError } = usePhotos()
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [generatedPhoto, setGeneratedPhoto] = useState<Photo | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRandomGeneration, setIsRandomGeneration] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = async (prompt: Prompt) => {
    if (!selectedFile) {
      alert('Please select an image file first')
      return
    }

    try {
      setSelectedPrompt(prompt)
      setIsRandomGeneration(false)
      const photo = await generatePhoto({ promptId: prompt.id, photo: selectedFile })
      setGeneratedPhoto(photo)
      setShowResult(true)
    } catch (err) {
      // Error is handled by hook
    }
  }

  const handleRandomGenerate = async () => {
    if (!selectedFile) {
      alert('Please select an image file first')
      return
    }

    try {
      setSelectedPrompt(null)
      setIsRandomGeneration(true)
      const photo = await generateRandomPhoto({ photo: selectedFile })
      setGeneratedPhoto(photo)
      setShowResult(true)
    } catch (err) {
      // Error is handled by hook
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
    } else {
      alert('Please select a valid image file')
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
          Upload an image and select a prompt to generate a new AI image
        </p>
      </div>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload Base Image
          </CardTitle>
          <CardDescription>
            Select an image file that will be used as the base for generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Image File</div>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
            </div>
            {selectedFile && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>{selectedFile.name}</span>
              </div>
            )}
            <Button
              onClick={handleRandomGenerate}
              disabled={!selectedFile || generating}
              className="w-full"
              variant="outline"
            >
              {generating && isRandomGeneration ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Random...
                </>
              ) : (
                <>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Generate with Random Prompt
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                    disabled={!selectedFile || generating}
                    size="sm"
                  >
                    {generating && selectedPrompt?.id === prompt.id && !isRandomGeneration ? (
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
      {generating && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <div>
                <p className="font-medium">Generating image...</p>
                <p className="text-sm text-muted-foreground">
                  {isRandomGeneration
                    ? 'Using a random prompt from the database'
                    : selectedPrompt
                      ? `Using prompt: "${selectedPrompt.title}"`
                      : 'Processing...'
                  }
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
                  src={generatedPhoto.path}
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
                  {/* <p className="text-sm text-muted-foreground">
                    {generatedPhoto.prompt.prompt}
                  </p> */}
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