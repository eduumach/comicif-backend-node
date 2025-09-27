import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { usePrompts } from "@/hooks/usePrompts"
import type { Prompt, CreatePromptData } from "@/services/prompts"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"

export default function Prompts() {
  const { prompts, loading, error, createPrompt, updatePrompt, deletePrompt } = usePrompts()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [formData, setFormData] = useState<CreatePromptData>({
    title: '',
    prompt: '',
    person_count: 0
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (editingPrompt) {
        console.log('Updating prompt with ID:', editingPrompt.id, 'Data:', formData)
        await updatePrompt(editingPrompt.id, formData)
        setEditingPrompt(null)
      } else {
        await createPrompt(formData)
        setIsCreateOpen(false)
      }
      setFormData({ title: '', prompt: '', person_count: 0 })
    } catch (err) {
      // Error is handled by hook
      console.error('Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (prompt: Prompt) => {
    console.log('HandleEdit called with prompt:', prompt)
    setFormData({
      title: prompt.title,
      prompt: prompt.prompt,
      person_count: prompt.person_count
    })
    setEditingPrompt(prompt)
  }

  const handleDelete = async (id: number) => {
    try {
      await deletePrompt(id)
    } catch (err) {
      // Error is handled by hook
    }
  }

  const resetForm = () => {
    setFormData({ title: '', prompt: '', person_count: 0 })
    setEditingPrompt(null)
    setIsCreateOpen(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-muted-foreground">
            Create and manage your AI prompts
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Prompt</DialogTitle>
              <DialogDescription>
                Add a new prompt for AI image generation
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter prompt title"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    value={formData.prompt}
                    onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                    placeholder="Enter your AI prompt"
                    className="min-h-[100px] max-h-[300px] resize-none overflow-y-auto"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Person Count</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.person_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, person_count: parseInt(e.target.value) || 0 }))}
                    placeholder="Number of people in the image"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Prompts</CardTitle>
          <CardDescription>
            {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prompts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No prompts created yet</p>
              <p className="text-sm text-muted-foreground">Create your first prompt to get started</p>
            </div>
          ) : (
            <div className="max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Prompt</TableHead>
                    <TableHead>People</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell className="font-medium">{prompt.title}</TableCell>
                      <TableCell className="max-w-md">
                        <div className="max-h-20 overflow-y-auto text-sm">
                          {prompt.prompt}
                        </div>
                      </TableCell>
                      <TableCell>{prompt.person_count}</TableCell>
                      <TableCell>
                        {new Date(prompt.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(prompt)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Prompt</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{prompt.title}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(prompt.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingPrompt} onOpenChange={(open) => !open && setEditingPrompt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update your prompt details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter prompt title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prompt</label>
                <Textarea
                  value={formData.prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Enter your AI prompt"
                  className="min-h-[100px] max-h-[300px] resize-none overflow-y-auto"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Person Count</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.person_count}
                  onChange={(e) => setFormData(prev => ({ ...prev, person_count: parseInt(e.target.value) || 0 }))}
                  placeholder="Number of people in the image"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}