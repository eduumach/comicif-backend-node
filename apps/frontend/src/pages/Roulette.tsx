import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RouletteWheel } from '@/components/RouletteWheel';
import { RoulettePromptWheel } from '@/components/RoulettePromptWheel';
import { rouletteService } from '@/services/roulette';
import type { RouletteCategory, RouletteResult } from '@/types/roulette';
import type { Prompt } from '@/types/prompt';
import { Loader2, Dices, Shuffle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Roulette() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<RouletteCategory[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentResult, setCurrentResult] = useState<RouletteResult | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [drawnPrompt, setDrawnPrompt] = useState<Prompt | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoryPrompts, setCategoryPrompts] = useState<Prompt[]>([]);
  const [drawnCategoryPrompt, setDrawnCategoryPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [spinningPrompt, setSpinningPrompt] = useState(false);
  const [spinningCategoryPrompt, setSpinningCategoryPrompt] = useState(false);
  const [drawingPrompt, setDrawingPrompt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, promptsData, resultData] = await Promise.all([
        rouletteService.getCategories(),
        rouletteService.getPrompts(),
        rouletteService.getCurrentResult()
      ]);

      setCategories(categoriesData);
      setPrompts(promptsData);
      setCurrentResult(resultData);
    } catch (err) {
      console.error('Error loading roulette data:', err);
      setError('Erro ao carregar dados da roleta');
    } finally {
      setLoading(false);
    }
  };

  const handleSpin = async () => {
    try {
      setSpinning(true);
      setError(null);

      // Chamar API para girar a roleta
      const result = await rouletteService.spin();

      // Aguardar a animação completar (4 segundos)
      setTimeout(() => {
        setCurrentResult(result);
        setSpinning(false);
      }, 4000);
    } catch (err) {
      console.error('Error spinning roulette:', err);
      setError('Erro ao girar a roleta');
      setSpinning(false);
    }
  };

  const handleDrawPrompt = async () => {
    if (!currentResult) return;

    try {
      setDrawingPrompt(true);
      setError(null);
      const prompt = await rouletteService.drawPrompt(currentResult.selectedCategory);
      setDrawnPrompt(prompt);
    } catch (err) {
      console.error('Error drawing prompt:', err);
      setError('Erro ao sortear prompt');
    } finally {
      setDrawingPrompt(false);
    }
  };

  const handleGenerateWithPrompt = () => {
    if (drawnPrompt) {
      // Redirecionar para a página de geração com o prompt sorteado
      navigate('/admin/generate', { state: { selectedPrompt: drawnPrompt } });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Roleta de Categorias</h1>
          <p className="text-muted-foreground">
            Gire a roleta para selecionar uma categoria aleatória
          </p>
        </div>

        <Card>
          <CardContent className="text-center py-12 px-4">
            <Dices className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">Nenhuma categoria disponível</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSpinPrompt = async () => {
    try {
      setSpinningPrompt(true);
      setError(null);

      // Chamar API para girar a roleta de prompts
      const result = await rouletteService.spinPrompts();

      // Aguardar a animação completar (4 segundos)
      setTimeout(() => {
        setSelectedPrompt(result);
        setSpinningPrompt(false);
      }, 4000);
    } catch (err) {
      console.error('Error spinning prompt roulette:', err);
      setError('Erro ao girar a roleta de prompts');
      setSpinningPrompt(false);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setDrawnCategoryPrompt(null);
    
    // Filtrar prompts da categoria selecionada
    const filtered = prompts.filter(p => p.category === category);
    setCategoryPrompts(filtered);
  };

  const handleSpinCategoryPrompt = async () => {
    if (!selectedCategory || categoryPrompts.length === 0) return;

    try {
      setSpinningCategoryPrompt(true);
      setError(null);

      // Chamar API para sortear um prompt da categoria selecionada
      const result = await rouletteService.drawPrompt(selectedCategory as any);

      // Aguardar a animação completar (4 segundos para a roleta girar)
      setTimeout(() => {
        setDrawnCategoryPrompt(result);
        setSpinningCategoryPrompt(false);
      }, 4000);
    } catch (err) {
      console.error('Error spinning category prompt:', err);
      setError('Erro ao sortear prompt da categoria');
      setSpinningCategoryPrompt(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Roletas de Sorteio</h1>
        <p className="text-muted-foreground">
          Escolha entre a roleta de categorias ou a roleta de prompts
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prompts">Roleta de Prompts</TabsTrigger>
          <TabsTrigger value="category-prompt">Categoria → Prompt</TabsTrigger>
          <TabsTrigger value="categories">Roleta de Categorias</TabsTrigger>

        </TabsList>

        {/* Tab: Roleta de Categorias */}
        <TabsContent value="categories" className="space-y-6">
          {/* Roleta */}
          <Card>
        <CardHeader>
          <CardTitle>Gire a Roleta</CardTitle>
          <CardDescription>
            {categories.length} categorias disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <RouletteWheel
              categories={categories}
              selectedCategory={currentResult?.selectedCategory || null}
              onSpin={handleSpin}
              spinning={spinning}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ações após resultado */}
      {currentResult && !spinning && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Resultado Selecionado</CardTitle>
            <CardDescription>
              Use este resultado para gerar uma imagem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted rounded-lg p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-lg">
                    {currentResult.categoryLabel}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Categoria: {currentResult.selectedCategory}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDrawPrompt}
                disabled={drawingPrompt}
                className="flex-1 min-h-[48px]"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                {drawingPrompt ? 'Sorteando...' : 'Sortear Prompt'}
              </Button>
              <Button
                onClick={handleSpin}
                variant="outline"
                className="flex-1 min-h-[48px]"
              >
                Girar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt Sorteado */}
      {drawnPrompt && !spinning && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle>Prompt Sorteado</CardTitle>
            <CardDescription>
              Este prompt foi sorteado da categoria selecionada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div>
                <p className="font-semibold text-lg text-blue-900">
                  {drawnPrompt.title}
                </p>
                {drawnPrompt.person_count !== null && drawnPrompt.person_count !== undefined && (
                  <p className="text-xs text-blue-600 mt-2">
                    Pessoas: {drawnPrompt.person_count}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGenerateWithPrompt}
                className="flex-1 min-h-[48px]"
              >
                Gerar com Este Prompt
              </Button>
              <Button
                onClick={handleDrawPrompt}
                disabled={drawingPrompt}
                variant="outline"
                className="flex-1 min-h-[48px]"
              >
                <Shuffle className="h-4 w-4 mr-2" />
                Sortear Outro
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

          {/* Info sobre as categorias */}
          <Card>
            <CardHeader>
              <CardTitle>Categorias Disponíveis</CardTitle>
              <CardDescription>
                Apenas categorias que têm prompts cadastrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <div
                    key={category.category}
                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors text-center"
                  >
                    <p className="font-medium text-sm">{category.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Roleta de Prompts */}
        <TabsContent value="prompts" className="space-y-6">
          {prompts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 px-4">
                <Dices className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">Nenhum prompt disponível</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Roleta de Prompts */}
              <Card>
                <CardHeader>
                  <CardTitle>Gire a Roleta de Prompts</CardTitle>
                  <CardDescription>
                    {prompts.length} prompts disponíveis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center py-8">
                    <RoulettePromptWheel
                      prompts={prompts}
                      selectedPrompt={selectedPrompt}
                      onSpin={handleSpinPrompt}
                      spinning={spinningPrompt}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Ações após resultado */}
              {selectedPrompt && !spinningPrompt && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle>Prompt Selecionado</CardTitle>
                    <CardDescription>
                      Use este prompt para gerar uma imagem
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted rounded-lg p-4 border">
                      <div>
                        <p className="font-semibold text-lg">
                          {selectedPrompt.title}
                        </p>
                        {selectedPrompt.person_count !== null && selectedPrompt.person_count !== undefined && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Pessoas: {selectedPrompt.person_count}
                          </p>
                        )}
                        {selectedPrompt.category && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Categoria: {selectedPrompt.category}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={() => navigate('/admin/generate', { state: { selectedPrompt } })}
                        className="flex-1 min-h-[48px]"
                      >
                        Gerar com Este Prompt
                      </Button>
                      <Button
                        onClick={handleSpinPrompt}
                        variant="outline"
                        className="flex-1 min-h-[48px]"
                      >
                        Girar Novamente
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista de Prompts */}
              <Card>
                <CardHeader>
                  <CardTitle>Prompts Disponíveis</CardTitle>
                  <CardDescription>
                    Total de {prompts.length} prompts cadastrados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {prompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <p className="font-medium text-sm">{prompt.title}</p>
                        {prompt.category && (
                          <span className="text-xs bg-muted px-2 py-1 rounded mt-2 inline-block">
                            {prompt.category}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Tab: Categoria → Prompt */}
        <TabsContent value="category-prompt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sortear Prompt por Categoria</CardTitle>
              <CardDescription>
                Selecione uma categoria e sorteie um prompt dessa categoria com a roleta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Seletor de Categoria */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Categoria</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full p-3 border rounded-lg bg-background"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map((category) => (
                    <option key={category.category} value={category.category}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info sobre a categoria selecionada */}
              {selectedCategory && categoryPrompts.length > 0 && (
                <div className="bg-muted rounded-lg p-4 border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">{categoryPrompts.length}</span> prompts disponíveis na categoria{' '}
                    <span className="font-semibold">
                      {categories.find(c => c.category === selectedCategory)?.label}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Roleta de Prompts da Categoria */}
          {selectedCategory && categoryPrompts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Gire a Roleta</CardTitle>
                <CardDescription>
                  {categoryPrompts.length} prompts da categoria {categories.find(c => c.category === selectedCategory)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-8">
                  <RoulettePromptWheel
                    prompts={categoryPrompts}
                    selectedPrompt={drawnCategoryPrompt}
                    onSpin={handleSpinCategoryPrompt}
                    spinning={spinningCategoryPrompt}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prompt Sorteado */}
          {drawnCategoryPrompt && !spinningCategoryPrompt && (
            <Card className="border-green-500">
              <CardHeader>
                <CardTitle>Prompt Sorteado</CardTitle>
                <CardDescription>
                  Prompt sorteado da categoria {categories.find(c => c.category === selectedCategory)?.label}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div>
                    <p className="font-semibold text-lg text-green-900">
                      {drawnCategoryPrompt.title}
                    </p>
                    {drawnCategoryPrompt.person_count !== null && drawnCategoryPrompt.person_count !== undefined && (
                      <p className="text-xs text-green-600 mt-2">
                        Pessoas: {drawnCategoryPrompt.person_count}
                      </p>
                    )}
                    {drawnCategoryPrompt.category && (
                      <p className="text-xs text-green-600 mt-1">
                        Categoria: {drawnCategoryPrompt.category}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate('/admin/generate', { state: { selectedPrompt: drawnCategoryPrompt } })}
                    className="flex-1 min-h-[48px]"
                  >
                    Gerar com Este Prompt
                  </Button>
                  <Button
                    onClick={handleSpinCategoryPrompt}
                    disabled={spinningCategoryPrompt}
                    variant="outline"
                    className="flex-1 min-h-[48px]"
                  >
                    <Shuffle className="h-4 w-4 mr-2" />
                    Sortear Outro
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedCategory && categoryPrompts.length === 0 && (
            <Card>
              <CardContent className="text-center py-12 px-4">
                <Dices className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Nenhum prompt disponível nesta categoria
                </p>
              </CardContent>
            </Card>
          )}

          {!selectedCategory && (
            <Card>
              <CardContent className="text-center py-12 px-4">
                <Dices className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  Selecione uma categoria para ver a roleta de prompts
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
