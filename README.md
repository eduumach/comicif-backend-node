# ComicIF Monorepo

Monorepo para aplicação ComicIF completa, incluindo backend (Node.js/TypeScript) e frontend, com APIs para gerenciamento de prompts e geração de imagens usando Google GenAI.

## 📋 Descrição

Este é um monorepo completo para uma aplicação de geração de imagens baseada em prompts. O backend permite criar, gerenciar e executar prompts que são processados pelo Google GenAI para gerar imagens, além de armazenar as imagens geradas e seus metadados. O frontend (a ser implementado) consumirá essas APIs.

## 🚀 Funcionalidades

- **Gestão de Prompts**: CRUD completo para prompts com título, texto e contagem de pessoas
- **Geração de Imagens**: Integração com Google GenAI para criar imagens a partir de prompts
- **Armazenamento de Imagens**: Upload e gerenciamento de imagens usando MinIO
- **Banco de Dados**: Persistência de dados com PostgreSQL e TypeORM
- **API REST**: Endpoints organizados para prompts, arquivos e fotos

## 🛠️ Tecnologias

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **MinIO** - Armazenamento de objetos (S3-compatible)
- **Google GenAI** - API de IA para geração de conteúdo e imagens
- **Multer** - Middleware para upload de arquivos
- **Docker** + **Docker Compose** - Containerização

## 📁 Estrutura do Monorepo

```
comicif-monorepo/
├── apps/
│   ├── backend/          # API Backend (Node.js/TypeScript)
│   │   ├── controllers/  # Controladores das rotas
│   │   ├── entities/     # Entidades do banco de dados
│   │   ├── routes/       # Definição das rotas da API
│   │   ├── services/     # Serviços de negócio
│   │   ├── app.ts        # Arquivo principal do backend
│   │   └── package.json  # Dependências do backend
│   └── frontend/         # Frontend (a ser implementado)
├── docs/                 # Documentação geral
├── docker-compose.yml    # Orquestração de serviços
└── package.json         # Configuração do workspace
```

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js (versão 18+)
- Docker e Docker Compose
- Chave da API do Google GenAI

### 1. Clone o repositório

```bash
git clone git@github.com:eduumach/comicif-backend-node.git
cd comicif-backend-node
```

### 2. Instale as dependências do monorepo

```bash
# Instalar dependências de todos os workspaces
npm install

# Ou instalar dependências específicas
npm install --workspace=apps/backend
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
GOOGLE_GENAI_API_KEY=sua_chave_aqui

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=comicif

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=comicif
MINIO_USE_SSL=false
```

### 4. Inicie os serviços com Docker

```bash
docker-compose up -d
```

### 5. Execute a aplicação

**Desenvolvimento (ambos apps):**
```bash
npm run dev
```

**Desenvolvimento (backend apenas):**
```bash
npm run backend:dev
```

**Desenvolvimento (frontend apenas):**
```bash
npm run frontend:dev
```

**Produção:**
```bash
npm run build
npm run backend:start
```

## 🌐 API Endpoints

### Prompts

- `GET /api/prompts` - Listar todos os prompts
- `GET /api/prompts/:id` - Buscar prompt por ID
- `POST /api/prompts` - Criar novo prompt
- `PUT /api/prompts/:id` - Atualizar prompt
- `DELETE /api/prompts/:id` - Excluir prompt

### Fotos

- `GET /api/photos` - Listar todas as fotos
- `POST /api/photos/generate` - Gerar foto a partir de prompt
- `POST /api/photos/:id/like` - Curtir uma foto

### Arquivos

- `POST /api/files/upload` - Upload de arquivos
- `GET /api/files/:filename` - Download de arquivos

## 📊 Modelo de Dados

### Prompt
- `id` (PK) - Identificador único
- `title` - Título do prompt
- `prompt` - Texto do prompt
- `person_count` - Número de pessoas no prompt
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização
- `photos` - Relação com as fotos geradas

### Photo
- `id` (PK) - Identificador único
- `path` - Caminho da imagem no MinIO
- `likes` - Número de curtidas
- `createdAt` - Data de criação
- `updatedAt` - Data de atualização
- `prompt` - Prompt relacionado (FK)

## 🔄 Serviços de Infraestrutura

### PostgreSQL
- **Porta**: 5432
- **Database**: comicif
- **Usuário**: postgres
- **Senha**: postgres

### MinIO
- **Console**: http://localhost:9001
- **API**: http://localhost:9000
- **Usuário**: minioadmin
- **Senha**: minioadmin

## 🧪 Testando a API

A documentação da API está disponível na pasta `docs/api-docs/` com arquivos de coleção para o Bruno (alternativa ao Postman).

### Exemplo de uso:

```bash
# Listar prompts
curl http://localhost:3000/api/prompts

# Criar prompt
curl -X POST http://localhost:3000/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Paisagem tropical",
    "prompt": "Uma bela praia tropical com coqueiros e mar azul",
    "person_count": 0
  }'

# Gerar foto
curl -X POST http://localhost:3000/api/photos/generate \
  -H "Content-Type: application/json" \
  -d '{
    "promptId": 1
  }'
```

## 📝 Scripts Disponíveis

### Monorepo (raiz)
- `npm run dev` - Inicia backend e frontend em paralelo
- `npm run build` - Builda todos os workspaces
- `npm test` - Executa testes de todos os workspaces

### Backend específico
- `npm run backend:dev` - Inicia apenas o backend em desenvolvimento
- `npm run backend:build` - Compila apenas o backend
- `npm run backend:start` - Inicia apenas o backend em produção

### Frontend específico
- `npm run frontend:dev` - Inicia apenas o frontend em desenvolvimento
- `npm run frontend:build` - Builda apenas o frontend
- `npm run frontend:start` - Inicia apenas o frontend

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

- **Eduardo Machado** - [eduumach](https://github.com/eduumach)

## 📞 Suporte

Em caso de problemas ou dúvidas, abra uma issue no repositório do projeto.
