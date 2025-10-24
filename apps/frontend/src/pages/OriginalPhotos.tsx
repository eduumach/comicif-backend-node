import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { config } from "@/config/env"
import { Loader2, Upload, Camera, X, CheckCircle2, Image as ImageIcon } from "lucide-react"

export default function OriginalPhotos() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      setCapturedImage(null)
      setError(null)
      setUploadSuccess(false)
    } else {
      setError('Por favor, selecione um arquivo de imagem válido')
    }
  }

  const startCamera = async () => {
    setCameraLoading(true)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Câmera não suportada neste navegador.')
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
          setError('Acesso à câmera negado. Por favor, permita o acesso à câmera.')
        } else if (err.name === 'NotFoundError') {
          setError('Nenhuma câmera encontrada neste dispositivo.')
        } else {
          setError('Não foi possível acessar a câmera.')
        }
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
    setUploadSuccess(false)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      const token = localStorage.getItem('comicif_token')
      if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.')
      }

      const formData = new FormData()
      formData.append('photo', selectedFile)

      const response = await fetch(`${config.apiBaseUrl}/original-photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao fazer upload')
      }

      setUploadSuccess(true)
      setTimeout(() => {
        setSelectedFile(null)
        setCapturedImage(null)
        setUploadSuccess(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold">Fotos do Evento</h1>
        <p className="text-muted-foreground">
          Registre as fotos originais do evento sem processamento
        </p>
      </div>

      {/* Image Upload/Preview */}
      <Card>
        <CardContent className="pt-6">
          {!selectedFile && !capturedImage ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 sm:p-12 text-center bg-muted/30">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-6">Adicione uma foto do evento</p>
                
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
                  onClick={retakePhoto}
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

      {/* Upload Button */}
      {selectedFile && !uploadSuccess && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          size="lg"
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Salvar Foto do Evento
            </>
          )}
        </Button>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-green-900 font-medium">Foto salva com sucesso!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

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
                        <p className="text-sm">Iniciando câmera...</p>
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
    </div>
  )
}
