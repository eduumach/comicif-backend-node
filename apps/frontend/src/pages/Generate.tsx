import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { usePrompts } from "@/hooks/usePrompts"
import { usePhotos } from "@/hooks/usePhotos"
import type { Prompt } from "@/services/prompts"
import type { Photo } from "@/services/photos"
import type { RouletteResult } from "@/types/roulette"
import { Loader2, Sparkles, Image as ImageIcon, Calendar, User, Upload, Shuffle, Camera, Dices, X } from "lucide-react"

export default function Generate() {
  const location = useLocation()
  const { prompts, loading: promptsLoading, error: promptsError } = usePrompts()
  const { generatePhoto, generateRandomPhoto, generating, error: photosError } = usePhotos()
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(
    location.state?.selectedPrompt || null
  )
  const [generatedPhoto, setGeneratedPhoto] = useState<Photo | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isRandomGeneration, setIsRandomGeneration] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [rouletteResult, setRouletteResult] = useState<RouletteResult | null>(
    location.state?.rouletteResult || null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Filtrar prompts pela categoria da roleta
  const filteredPrompts = rouletteResult 
    ? prompts.filter(p => p.category === rouletteResult.selectedCategory)
    : prompts

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
    <div className="space-y-4 sm:space-y-6 pb-4">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Generate Images</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Upload an image or take a photo and select a prompt to generate a new AI image
        </p>
      </div>

      {/* Roulette Result Card */}
      {rouletteResult && (
        <Card className="border-green-500 bg-green-50/50">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Dices className="h-5 w-5 mr-2" />
                Resultado da Roleta
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRouletteResult(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-sm">
              Você selecionou este resultado na roleta. Use-o para geração!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-lg text-green-900">
                {rouletteResult.categoryLabel}
              </p>
              <p className="text-xs text-green-600 mt-2">
                Categoria: {rouletteResult.selectedCategory}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Esta categoria será usada para filtrar os prompts disponíveis
            </p>
          </CardContent>
        </Card>
      )}

      {/* Selected Prompt from Roulette */}
      {selectedPrompt && !rouletteResult && (
        <Card className="border-blue-500 bg-blue-50/50">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Prompt Selecionado da Roleta
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPrompt(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-sm">
              Este prompt foi selecionado na roleta. Faça upload de uma imagem e clique em "Gerar com Este Prompt"!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="font-semibold text-lg text-blue-900">
                  {selectedPrompt.title}
                </p>
                {/* <p className="text-sm text-blue-700 mt-2">
                  {selectedPrompt.prompt}
                </p> */}
              </div>
              {selectedPrompt.person_count !== null && selectedPrompt.person_count !== undefined && (
                <div className="flex items-center text-xs text-blue-600">
                  <User className="h-4 w-4 mr-1" />
                  Pessoas: {selectedPrompt.person_count}
                </div>
              )}
              {selectedPrompt.category && (
                <div className="text-xs text-blue-600">
                  Categoria: {selectedPrompt.category}
                </div>
              )}
            </div>
            <div className="mt-4">
              <Button
                onClick={() => handleGenerate(selectedPrompt)}
                disabled={!selectedFile || generating}
                className="w-full min-h-[48px] text-base"
              >
                {generating && !isRandomGeneration ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando com Este Prompt...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar com Este Prompt
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Section */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Upload className="h-5 w-5 mr-2" />
            Upload Base Image
          </CardTitle>
          <CardDescription className="text-sm">
            Select an image file or take a photo that will be used as the base for generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">Image File</div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="flex-1">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="min-h-[48px] text-sm"
                  />
                </div>
                <Button
                  onClick={startCamera}
                  variant="outline"
                  size="default"
                  className="min-h-[48px] w-full sm:w-auto px-4 text-base"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  <span>Take Photo</span>
                </Button>
              </div>
            </div>
            {capturedImage && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Captured Photo</div>
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-muted rounded-lg overflow-hidden shadow-sm">
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
                  className="min-h-[48px] text-base"
                >
                  Retake Photo
                </Button>
              </div>
            )}
            {selectedFile && !capturedImage && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                <ImageIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
              </div>
            )}
            <Button
              onClick={handleRandomGenerate}
              disabled={!selectedFile || generating}
              className="w-full min-h-[48px] text-base"
              variant="outline"
            >
              {generating && isRandomGeneration ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Generating Random...</span>
                  <span className="sm:hidden">Generating...</span>
                </>
              ) : (
                <>
                  <Shuffle className="h-5 w-5 mr-2" />
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
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2 text-sm sm:text-base">No prompts available</p>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4">
              Create some prompts first to generate images
            </p>
            <Button
              onClick={() => window.location.href = '/prompts'}
              className="min-h-[48px] text-base"
            >
              Create Prompts
            </Button>
          </CardContent>
        </Card>
      ) : filteredPrompts.length === 0 ? (
        <Card className="border-amber-500 bg-amber-50/50">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <Sparkles className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-amber-600" />
            <p className="text-amber-900 mb-2 text-sm sm:text-base font-medium">
              Nenhum prompt na categoria "{rouletteResult?.categoryLabel}"
            </p>
            <p className="text-xs sm:text-sm text-amber-700 mb-4">
              Categoria da roleta: {rouletteResult?.selectedCategory}
            </p>
            <Button
              onClick={() => setRouletteResult(null)}
              variant="outline"
              className="min-h-[48px] text-base"
            >
              Limpar Filtro da Roleta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="group hover:shadow-md transition-shadow">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="truncate text-sm sm:text-base md:text-lg">{prompt.title}</span>
                  {prompt.person_count > 0 && (
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground self-start sm:self-center">
                      <User className="h-4 w-4 mr-1" />
                      {prompt.person_count}
                    </div>
                  )}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-xs sm:text-sm">
                  {prompt.prompt}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="hidden sm:inline">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(prompt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <Button
                    onClick={() => handleGenerate(prompt)}
                    disabled={!selectedFile || generating}
                    size="sm"
                    className="w-full sm:w-auto min-h-[48px] text-base"
                  >
                    {generating && selectedPrompt?.id === prompt.id && !isRandomGeneration ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        <span className="hidden sm:inline">Generating...</span>
                        <span className="sm:hidden">Gen...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
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
        <DialogContent className="max-w-[96vw] sm:max-w-lg max-h-[90vh] p-4 sm:p-6 overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center text-base sm:text-lg">
              <Camera className="h-5 w-5 mr-2" />
              Take Photo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            {!capturedImage ? (
              <>
                <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ maxHeight: 'calc(90vh - 200px)', minHeight: '300px' }}>
                  {cameraLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                      <div className="text-white text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Starting camera...</p>
                      </div>
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex justify-center py-2">
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="rounded-full h-16 w-16 sm:h-20 sm:w-20 p-0 shadow-lg"
                    disabled={cameraLoading}
                  >
                    <Camera className="h-6 w-6 sm:h-8 sm:w-8" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ maxHeight: 'calc(90vh - 200px)', minHeight: '300px' }}>
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    className="w-full sm:w-auto min-h-[48px] text-base"
                  >
                    Retake
                  </Button>
                  <Button
                    onClick={stopCamera}
                    className="w-full sm:w-auto min-h-[48px] text-base"
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
          <DialogContent className="max-w-[96vw] sm:max-w-2xl max-h-[90vh] p-4 sm:p-6 overflow-y-auto">
            <DialogHeader className="pb-2">
              <DialogTitle className="flex items-center text-base sm:text-lg">
                <ImageIcon className="h-5 w-5 mr-2" />
                Image Generated Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div className="w-full bg-muted rounded-lg overflow-hidden" style={{ maxHeight: 'calc(90vh - 220px)', minHeight: '250px' }}>
                <img
                  src={generatedPhoto.path}
                  alt={generatedPhoto.prompt.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm sm:text-base">{generatedPhoto.prompt.title}</h4>
                  {/* <p className="text-sm text-muted-foreground">
                    {generatedPhoto.prompt.prompt}
                  </p> */}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Generated: {new Date(generatedPhoto.createdAt).toLocaleString()}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/gallery'}
                      className="w-full sm:w-auto min-h-[48px] text-base"
                    >
                      View Gallery
                    </Button>
                    <Button
                      onClick={() => setShowResult(false)}
                      className="w-full sm:w-auto min-h-[48px] text-base"
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