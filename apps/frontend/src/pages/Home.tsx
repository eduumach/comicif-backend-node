import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">ComicIF</h1>
        <p className="text-muted-foreground">
          Generate amazing images with AI-powered prompts
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Prompts</CardTitle>
            <CardDescription>
              Create and manage your AI prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => navigate('/prompts')}
            >
              Manage Prompts
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
            <CardDescription>
              View all generated images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => navigate('/gallery')}
            >
              View Gallery
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generate</CardTitle>
            <CardDescription>
              Create new images from prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
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