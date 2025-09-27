import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { usePrompts } from "@/hooks/usePrompts"
import { usePhotos } from "@/hooks/usePhotos"
import type { Prompt } from "@/services/prompts"
import type { Photo } from "@/services/photos"
import { Loader2, Sparkles, Image as ImageIcon, Calendar, User, Upload, Shuffle, Camera } from "lucide-react"

export default function Generate() {
  const { prompts, loading: promptsLoading, error: promptsError } = usePrompts()
  const { generatePhoto, generateRandomPhoto, generating, error: photosError } = usePhotos()
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [generatedPhoto, setGeneratedPhoto] = useState<Photo | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRandomGeneration, setIsRandomGeneration] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

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
      setCapturedImage(null)
    } else {
      alert('Please select a valid image file')
    }
  }

  const startCamera = async () => {
    setCameraLoading(true)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Camera not supported in this browser.')
        return
      }

      let stream: MediaStream | null = null

      // Try different camera configurations
      const configs = [
        { video: { facingMode: 'environment' } },
        { video: { facingMode: 'user' } },
        { video: true }
      ]

      for (const config of configs) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(config)
          break
        } catch (configErr) {
          console.log('Failed with config:', config, configErr)
          continue
        }
      }

      if (!stream) {
        throw new Error('No camera configuration worked')
      }

      streamRef.current = stream
      setShowCamera(true)

      // Wait a bit then set up video
      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(console.error)
            setCameraLoading(false)
          }
        }
      }, 100)
    } catch (err) {
      setCameraLoading(false)
      console.error('Camera error:', err)
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          alert('Camera access denied. Please allow camera permissions and try again.')
        } else if (err.name === 'NotFoundError') {
          alert('No camera found on this device.')
        } else if (err.name === 'NotSupportedError') {
          alert('Camera not supported in this browser.')
        } else {
          alert('Unable to access camera. Please check permissions and try again.')
        }
      } else {
        alert('Unable to access camera. Please check permissions and try again.')
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setShowCamera(false)
    setCapturedImage(null)
    setCameraLoading(false)
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      if (context) {
        context.drawImage(video, 0, 0)
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setCapturedImage(imageDataUrl)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
            setSelectedFile(file)
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    setSelectedFile(null)
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

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
        <h1 className="text-2xl sm:text-3xl font-bold">Generate Images</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Upload an image or take a photo and select a prompt to generate a new AI image
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
            Select an image file or take a photo that will be used as the base for generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Image File</div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="min-h-[44px]"
                  />
                </div>
                <Button
                  onClick={startCamera}
                  variant="outline"
                  size="default"
                  className="px-3 min-h-[44px] w-full sm:w-auto"
                >
                  <Camera className="h-4 w-4 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Take Photo</span>
                </Button>
              </div>
            </div>
            {capturedImage && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Captured Photo</div>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  size="sm"
                  className="min-h-[44px]"
                >
                  Retake Photo
                </Button>
              </div>
            )}
            {selectedFile && !capturedImage && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <span>{selectedFile.name}</span>
              </div>
            )}
            <Button
              onClick={handleRandomGenerate}
              disabled={!selectedFile || generating}
              className="w-full min-h-[44px]"
              variant="outline"
            >
              {generating && isRandomGeneration ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Generating Random...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <Shuffle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Generate with Random Prompt</span>
                  <span className="sm:hidden">Random Generate</span>
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
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="truncate text-base sm:text-lg">{prompt.title}</span>
                  {prompt.person_count > 0 && (
                    <div className="flex items-center text-sm text-muted-foreground self-start sm:self-center">
                      <User className="h-4 w-4 mr-1" />
                      {prompt.person_count}
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-sm">
                  {prompt.prompt}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <Button
                    onClick={() => handleGenerate(prompt)}
                    disabled={!selectedFile || generating}
                    size="sm"
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    {generating && selectedPrompt?.id === prompt.id && !isRandomGeneration ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Generating...</span>
                        <span className="sm:hidden">Gen...</span>
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

      {/* Camera Modal */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[95vh] p-3 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg">
              <Camera className="h-5 w-5 mr-2" />
              Take Photo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!capturedImage ? (
              <>
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  {cameraLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <div className="text-white text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Starting camera...</p>
                      </div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="rounded-full h-14 w-14 sm:h-16 sm:w-16 p-0"
                    disabled={cameraLoading}
                  >
                    <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={stopCamera}
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    Use Photo
                  </Button>
                </div>
              </>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>

      {/* Generation Result Dialog */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        {generatedPhoto && (
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[95vh] p-3 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center text-lg">
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Generated: {new Date(generatedPhoto.createdAt).toLocaleString()}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/gallery'}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
                      View Gallery
                    </Button>
                    <Button
                      onClick={() => setShowResult(false)}
                      className="w-full sm:w-auto min-h-[44px]"
                    >
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