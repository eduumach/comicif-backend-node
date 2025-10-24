# 🎰 Guia da Roleta - ComicIF

## Visão Geral

A funcionalidade de Roleta permite que você gire uma roda virtual para selecionar aleatoriamente um prompt, tema ou categoria para geração de imagens. O resultado fica salvo no banco de dados e pode ser usado na página Generate.

## Funcionalidades Implementadas

### Backend

#### Entidades
- **RouletteOption**: Armazena as opções disponíveis na roleta
  - `type`: Tipo da opção (PROMPT, THEME, CATEGORY)
  - `label`: Nome exibido na roleta
  - `value`: Valor opcional (ex: texto do prompt)
  - `category`: Categoria opcional (MediaCategory)
  - `weight`: Peso para probabilidade de seleção
  - `active`: Se a opção está ativa

- **RouletteResult**: Armazena o resultado atual da roleta
  - `selectedOption`: Opção selecionada
  - `isActive`: Se é o resultado ativo atual

#### API Endpoints

**Públicos:**
- `POST /api/roulette/spin` - Gira a roleta e retorna o resultado
- `GET /api/roulette/current` - Obtém o resultado atual ativo
- `GET /api/roulette/options` - Lista opções ativas

**Protegidos (requer autenticação):**
- `GET /api/roulette/options/all` - Lista todas as opções
- `GET /api/roulette/options/:id` - Obtém opção por ID
- `POST /api/roulette/options` - Cria nova opção
- `PUT /api/roulette/options/:id` - Atualiza opção
- `DELETE /api/roulette/options/:id` - Deleta opção

### Frontend

#### Páginas
- **/roulette** - Página principal da roleta (pública)
  - Animação de roleta giratória
  - Exibição do resultado selecionado
  - Botão para gerar imagem com o resultado
  - Lista de opções disponíveis

- **/admin/generate** - Modificada para aceitar resultado da roleta
  - Card especial mostrando resultado da roleta quando vindo da página Roulette
  - Opção para limpar resultado da roleta

#### Componentes
- **RouletteWheel** - Componente visual da roleta com animação

## Como Usar

### 1. Criar Opções da Roleta (Admin)

Use a API para criar opções:

```bash
curl -X POST http://localhost:3000/api/roulette/options \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "prompt",
    "label": "Tema Cyberpunk",
    "value": "Futuristic cyberpunk city with neon lights",
    "weight": 2,
    "active": true
  }'
```

**Tipos de Opções:**
- `prompt`: Um prompt específico para geração
- `theme`: Um tema geral
- `category`: Uma categoria de mídia

**Peso (`weight`):**
- Valores maiores = maior probabilidade de seleção
- Padrão: 1

### 2. Usar a Roleta (Público)

1. Acesse `/roulette` na aplicação
2. Clique em "🎰 Girar Roleta"
3. Aguarde a animação (4 segundos)
4. Veja o resultado selecionado
5. Clique em "✨ Gerar Imagem com Este Resultado"
6. Você será redirecionado para `/admin/generate` com o resultado

### 3. Gerar Imagem com Resultado

1. Na página Generate, você verá um card verde com o resultado da roleta
2. Faça upload de uma imagem base
3. Use geração aleatória ou selecione um prompt
4. O resultado da roleta serve como referência/contexto

### 4. Gerenciar Opções (Admin)

**Listar todas opções:**
```bash
GET /api/roulette/options/all
```

**Atualizar opção:**
```bash
PUT /api/roulette/options/:id
```

**Desativar opção:**
```bash
PUT /api/roulette/options/:id
{
  "active": false
}
```

**Deletar opção:**
```bash
DELETE /api/roulette/options/:id
```

## Exemplos de Opções

### Prompts
```json
[
  {
    "type": "prompt",
    "label": "Estilo Anime",
    "value": "Transform into anime art style with vibrant colors",
    "weight": 1
  },
  {
    "type": "prompt",
    "label": "Realismo",
    "value": "Photorealistic style with detailed textures",
    "weight": 1
  }
]
```

### Temas
```json
[
  {
    "type": "theme",
    "label": "Fantasia Medieval",
    "value": "Medieval fantasy theme with castles and dragons",
    "weight": 2
  },
  {
    "type": "theme",
    "label": "Sci-Fi Futurista",
    "value": "Futuristic science fiction theme",
    "weight": 1
  }
]
```

### Categorias
```json
[
  {
    "type": "category",
    "label": "Evento Corporativo",
    "category": "event",
    "weight": 1
  },
  {
    "type": "category",
    "label": "Conteúdo Social",
    "category": "social",
    "weight": 2
  }
]
```

## Fluxo de Dados

```
1. Usuário acessa /roulette
   ↓
2. Frontend carrega opções ativas (GET /api/roulette/options)
   ↓
3. Usuário clica em "Girar"
   ↓
4. Backend seleciona opção aleatória baseada em peso
   ↓
5. Backend desativa resultados anteriores
   ↓
6. Backend cria novo resultado ativo (POST /api/roulette/spin)
   ↓
7. Frontend exibe animação e resultado
   ↓
8. Usuário clica em "Gerar Imagem"
   ↓
9. Redirecionamento para /admin/generate com resultado
   ↓
10. Página Generate exibe card com resultado da roleta
```

## Animação da Roleta

A roleta usa uma animação CSS de 4 segundos com:
- 5 rotações completas
- Easing: `cubic-bezier(0.17, 0.67, 0.12, 0.99)`
- Rotação calculada para parar na opção selecionada
- Cores alternadas para melhor visualização

## Esquema de Cores

- **Opções da roleta**: Cores alternadas (vermelho, azul, verde, amarelo, roxo, rosa, índigo, laranja)
- **Resultado ativo**: Verde (#10b981)
- **Indicador**: Vermelho (#dc2626)

## Navegação

O link "Roulette" foi adicionado ao menu de navegação:
- Desktop: Botão no header
- Mobile: Item no menu mobile
- Ícone: 🎲 (Dices)

## Banco de Dados

As tabelas são criadas automaticamente pelo TypeORM:
- `roulette_option`
- `roulette_result`

**Nota**: Como `synchronize: true` está habilitado no desenvolvimento, as tabelas são criadas automaticamente ao iniciar o servidor.

## Próximos Passos (Opcional)

1. **Admin UI**: Criar interface web para gerenciar opções da roleta
2. **Histórico**: Salvar histórico de todas as roletas giradas
3. **Estatísticas**: Mostrar quantas vezes cada opção foi selecionada
4. **Múltiplas Roletas**: Permitir criar roletas diferentes para diferentes propósitos
5. **Preset Packs**: Criar pacotes pré-definidos de opções (ex: "Temas de Festa", "Estilos de Arte")

## Troubleshooting

### Erro: "Nenhuma opção disponível"
- Verifique se há opções ativas no banco: `GET /api/roulette/options`
- Crie novas opções usando `POST /api/roulette/options`

### Roleta não gira
- Verifique se há opções ativas
- Verifique console do navegador para erros
- Verifique se a API está respondendo

### Resultado não aparece na página Generate
- Verifique se você clicou no botão "Gerar Imagem" na página Roulette
- Verifique se o estado está sendo passado corretamente via React Router

---

**Desenvolvido para ComicIF** 🎨
