import { useState, useRef, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { usePrompts } from "@/hooks/usePrompts"
import { usePhotos } from "@/hooks/usePhotos"
import type { Prompt } from "@/services/prompts"
import type { Photo } from "@/services/photos"
import type { RouletteResult } from "@/types/roulette"
import { Loader2, Sparkles, Image as ImageIcon, Upload, Shuffle, Camera, X, ChevronDown } from "lucide-react"

export default function Generate() {
  const location = useLocation()
  const { prompts } = usePrompts()
  const { generatePhoto, generateRandomPhoto, generating, error } = usePhotos()
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
  const [showPromptSelector, setShowPromptSelector] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Filtrar prompts pela categoria da roleta se houver
  const availablePrompts = rouletteResult 
    ? prompts.filter(p => p.category === rouletteResult.selectedCategory)
    : prompts

  const handleGenerate = async (prompt: Prompt) => {
    if (!selectedFile) {
      alert('Por favor, selecione um arquivo de imagem primeiro')
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
      alert('Por favor, selecione um arquivo de imagem primeiro')
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
      alert('Por favor, selecione um arquivo de imagem válido')
    }
  }

  const startCamera = async () => {
    setCameraLoading(true)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Câmera não suportada neste navegador.')
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
          alert('Acesso à câmera negado. Por favor, permita o acesso à câmera e tente novamente.')
        } else if (err.name === 'NotFoundError') {
          alert('Nenhuma câmera encontrada neste dispositivo.')
        } else if (err.name === 'NotSupportedError') {
          alert('Câmera não suportada neste navegador.')
        } else {
          alert('Não foi possível acessar a câmera. Por favor, verifique as permissões e tente novamente.')
        }
      } else {
        alert('Não foi possível acessar a câmera. Por favor, verifique as permissões e tente novamente.')
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
        const imageDataUrl = canvas.toDataURL('image/png')
        setCapturedImage(imageDataUrl)

        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'camera-capture.png', { type: 'image/png' })
            setSelectedFile(file)
          }
        }, 'image/png')
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

  return (
    <div className="space-y-6 pb-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Gerar Imagem</h1>
        {rouletteResult ? (
          <p className="text-muted-foreground">
            🎲 Categoria: <span className="font-semibold text-foreground">{rouletteResult.categoryLabel}</span>
          </p>
        ) : selectedPrompt ? (
          <p className="text-muted-foreground">
            ✨ {selectedPrompt.title}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Tire ou envie uma foto e gere sua imagem
          </p>
        )}
      </div>

      {/* Image Preview/Upload */}
      <Card>
        <CardContent className="pt-6">
          {!selectedFile && !capturedImage ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 sm:p-12 text-center bg-muted/30">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-6">Adicione uma foto para começar</p>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    size="lg"
                    variant="outline"
                    className="flex-1"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Escolher Arquivo
                  </Button>
                  <Button
                    onClick={startCamera}
                    size="lg"
                    className="flex-1"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Tirar Foto
                  </Button>
                </div>
                
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative w-full max-w-lg mx-auto bg-muted rounded-lg overflow-hidden" style={{ maxHeight: '70vh' }}>
                <img
                  src={capturedImage || (selectedFile ? URL.createObjectURL(selectedFile) : '')}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => {
                    setSelectedFile(null)
                    setCapturedImage(null)
                  }}
                  variant="outline"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remover
                </Button>
                <Button
                  onClick={startCamera}
                  variant="outline"
                  size="sm"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Tirar Outra
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {selectedFile && (
        <div className="space-y-3">
          {selectedPrompt ? (
            <>
              <Button
                onClick={() => handleGenerate(selectedPrompt)}
                disabled={generating}
                size="lg"
                className="w-full"
              >
                {generating && !isRandomGeneration ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Gerar com "{selectedPrompt.title}"
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowPromptSelector(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Escolher Outro Prompt
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleRandomGenerate}
                disabled={generating}
                size="lg"
                className="w-full"
              >
                {generating && isRandomGeneration ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Shuffle className="h-5 w-5 mr-2" />
                    Gerar com Prompt Aleatório
                  </>
                )}
              </Button>
              {availablePrompts.length > 0 && (
                <Button
                  onClick={() => setShowPromptSelector(true)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Escolher Prompt Manualmente
                </Button>
              )}
            </>
          )}

          {(selectedPrompt || rouletteResult) && (
            <Button
              onClick={() => {
                setSelectedPrompt(null)
                setRouletteResult(null)
              }}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Limpar seleção da roleta
            </Button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Prompt Selector Modal */}
      <Dialog open={showPromptSelector} onOpenChange={setShowPromptSelector}>
        <DialogContent className="max-w-[96vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Escolher Prompt
              {rouletteResult && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({availablePrompts.length} na categoria "{rouletteResult.categoryLabel}")
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {availablePrompts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum prompt disponível</p>
                {rouletteResult && (
                  <p className="text-sm mt-2">
                    Não há prompts na categoria "{rouletteResult.categoryLabel}"
                  </p>
                )}
              </div>
            ) : (
              availablePrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => {
                    setSelectedPrompt(prompt)
                    setShowPromptSelector(false)
                  }}
                  className="w-full text-left p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="font-medium">{prompt.title}</div>
                  <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {prompt.prompt}
                  </div>
                  {prompt.category && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {prompt.category}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Camera Modal */}
      <Dialog open={showCamera} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-[96vw] sm:max-w-lg max-h-[90vh] p-4 sm:p-6 overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center text-base sm:text-lg">
              <Camera className="h-5 w-5 mr-2" />
              Tirar Foto
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
                    Tirar Outra
                  </Button>
                  <Button
                    onClick={stopCamera}
                    className="w-full sm:w-auto min-h-[48px] text-base"
                  >
                    Usar Foto
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
                Imagem Gerada com Sucesso!
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div className="w-full bg-muted rounded-lg overflow-hidden" style={{ maxHeight: 'calc(90vh - 220px)', minHeight: '250px' }}>
                <img
                  src={generatedPhoto.path}
                  alt={generatedPhoto.prompt?.title || 'Generated image'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280">No Image</text></svg>'
                  }}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm sm:text-base">{generatedPhoto.prompt?.title}</h4>
                  {/* <p className="text-sm text-muted-foreground">
                    {generatedPhoto.prompt.prompt}
                  </p> */}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Gerada em: {new Date(generatedPhoto.createdAt).toLocaleString('pt-BR')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/gallery'}
                      className="w-full sm:w-auto min-h-[48px] text-base"
                    >
                      Ver Galeria
                    </Button>
                    <Button
                      onClick={() => setShowResult(false)}
                      className="w-full sm:w-auto min-h-[48px] text-base"
                    >
                      Gerar Outra
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