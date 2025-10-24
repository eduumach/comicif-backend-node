# Sistema de Tokens de Autenticação

## Visão Geral

O sistema possui dois níveis de autenticação por token:

### 1. **ADMIN_TOKEN** (Token Administrativo)
- **Variável de ambiente**: `AUTH_TOKEN`
- **Valor padrão**: `comicif-secret-token-2025`
- **Permissões**: Acesso completo a todas as funcionalidades
  - ✅ Criar, editar e deletar prompts
  - ✅ Gerar imagens com IA
  - ✅ Fazer upload de fotos originais do evento
  - ✅ Visualizar galeria e fotos

### 2. **ORIGINAL_UPLOAD_TOKEN** (Token de Upload)
- **Variável de ambiente**: `ORIGINAL_UPLOAD_TOKEN`
- **Valor padrão**: `comicif-upload-only-token`
- **Permissões**: Acesso limitado apenas para upload de fotos
  - ❌ Não pode acessar prompts
  - ❌ Não pode gerar imagens com IA
  - ✅ Pode fazer upload de fotos originais do evento
  - ✅ Pode visualizar galeria

## Como Usar

### No Backend

Configure as variáveis de ambiente no `.env`:

\`\`\`env
# Token com acesso completo
AUTH_TOKEN=seu-token-admin-super-secreto

# Token apenas para upload de fotos do evento
ORIGINAL_UPLOAD_TOKEN=token-para-fotografos-do-evento
\`\`\`

### No Frontend

Ao fazer login, o token é armazenado no `localStorage` e enviado em todas as requisições protegidas:

\`\`\`typescript
// O token é enviado automaticamente no header
headers: {
  'Authorization': `Bearer ${token}`
}
\`\`\`

## Endpoints Protegidos

### Apenas ADMIN_TOKEN

- `POST /api/prompts` - Criar prompt
- `PUT /api/prompts/:id` - Atualizar prompt
- `DELETE /api/prompts/:id` - Deletar prompt
- `POST /api/photos` - Gerar foto com IA

### ADMIN_TOKEN ou ORIGINAL_UPLOAD_TOKEN

- `POST /api/original-photos` - Upload de foto original
- `GET /api/original-photos` - Listar fotos originais

### Públicos (sem autenticação)

- `GET /api/prompts` - Listar prompts
- `GET /api/prompts/:id` - Ver prompt específico
- `GET /api/photos` - Listar fotos

## Caso de Uso

**Evento com Múltiplos Fotógrafos:**

1. **Organizador** usa o `ADMIN_TOKEN`:
   - Cria prompts
   - Configura roleta de categorias
   - Gera imagens com IA
   
2. **Fotógrafos** usam o `ORIGINAL_UPLOAD_TOKEN`:
   - Fazem login com token limitado
   - Tiram fotos do evento
   - Fazem upload sem processar
   - Não têm acesso a prompts ou geração de IA

## Segurança

⚠️ **IMPORTANTE**: Em produção, use tokens fortes e únicos!

\`\`\`bash
# Gerar tokens seguros
openssl rand -hex 32
\`\`\`

Nunca commite os tokens reais no git. Use `.env` e adicione ao `.gitignore`.
