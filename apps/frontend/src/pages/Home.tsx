import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">ComicIF</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Generate amazing images with AI-powered prompts
        </p>
      </header>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Prompts</CardTitle>
            <CardDescription className="text-sm">
              Create and manage your AI prompts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button
              className="w-full min-h-[44px]"
              onClick={() => navigate('/prompts')}
            >
              Manage Prompts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Gallery</CardTitle>
            <CardDescription className="text-sm">
              View all generated images
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button
              className="w-full min-h-[44px]"
              variant="outline"
              onClick={() => navigate('/gallery')}
            >
              View Gallery
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Generate</CardTitle>
            <CardDescription className="text-sm">
              Create new images from prompts
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Button
              className="w-full min-h-[44px]"
              variant="secondary"
              onClick={() => navigate('/generate')}
            >
              Generate Image
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Backend API: <code className="bg-muted px-2 py-1 rounded">/api</code>
        </p>
      </div>
    </div>
  )
}