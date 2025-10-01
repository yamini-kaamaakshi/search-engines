# AI-Powered Document Search Engine

A powerful document search engine built with Next.js, Cloudflare AI Worker, and Vectorize. Upload documents and search them using semantic understanding and AI-powered chat responses.

## Features

- **Document Upload**: Support for PDF, DOCX, TXT, and HTML files
- **Semantic Search**: Vector-based search using Cloudflare AI embeddings
- **AI Chat**: Ask questions about your documents with AI-powered responses
- **No Third-party APIs**: Everything runs on Cloudflare's edge network
- **Real-time Processing**: Fast document indexing and search

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Cloudflare Workers
- **Vector Database**: Cloudflare Vectorize
- **AI Models**: Cloudflare AI Worker
  - Embeddings: `@cf/baai/bge-base-en-v1.5`
  - Chat: `@cf/meta/llama-3.1-8b-instruct`

## Prerequisites

1. **Cloudflare Account**: You need a Cloudflare account with Workers and AI enabled
2. **Node.js**: Version 18 or higher
3. **Wrangler CLI**: Installed globally or via npm

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Cloudflare Setup

#### Login to Cloudflare
```bash
npx wrangler login
```

#### Create Vectorize Databases
```bash
# For development
npm run worker:create-vectorize-dev

# For production
npm run worker:create-vectorize
```

#### Update wrangler.toml
Edit `wrangler.toml` and update the `name` field to your preferred worker name.

### 3. Deploy the Worker

```bash
# Deploy to production
npm run worker:deploy
```

After deployment, Wrangler will provide you with a worker URL like:
`https://search-engine.your-subdomain.workers.dev`

### 4. Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your worker URL:
```env
CLOUDFLARE_WORKER_URL=https://your-worker-url.workers.dev
```

### 5. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to use your search engine!

## Usage

### 1. Upload Documents
- Drag and drop files or click to select
- Supported formats: PDF, DOCX, TXT, HTML
- Documents are automatically chunked and vectorized

### 2. Search Documents
- Enter a search query in natural language
- Get semantically relevant results with similarity scores
- Results show document content, metadata, and match percentage

### 3. Ask AI Questions
- After searching, click "Ask AI" to get AI-powered answers
- The AI uses search results as context to provide relevant responses
- Great for summarization and specific questions about your documents

## Development Commands

```bash
# Frontend development
npm run dev                    # Start Next.js dev server
npm run build                  # Build for production
npm run start                  # Start production server

# Worker development
npm run worker:dev             # Start worker dev server
npm run worker:deploy          # Deploy worker to production

# Database management
npm run worker:create-vectorize     # Create production Vectorize DB
npm run worker:create-vectorize-dev # Create development Vectorize DB
```

## Architecture

### Frontend (Next.js)
- **Components**: Document upload, search interface, results display
- **API Routes**: Proxy requests to Cloudflare Worker
- **Document Processing**: Parse various file formats client-side

### Backend (Cloudflare Worker)
- **Vector Operations**: Store and query document embeddings
- **AI Integration**: Generate embeddings and chat responses
- **API Endpoints**:
  - `/api/ingest` - Document ingestion and vectorization
  - `/api/search` - Semantic search queries
  - `/api/chat` - AI-powered chat responses
  - `/api/embed` - Generate text embeddings

### Data Flow
1. User uploads documents → Parsed and chunked → Sent to Worker
2. Worker generates embeddings → Stores in Vectorize
3. Search query → Worker generates query embedding → Vector similarity search
4. Results returned → Displayed in UI
5. Chat query → AI generates response using search context

## Configuration

### Document Processing
- **Chunk Size**: 1000 characters (configurable in `document-parser.ts`)
- **Overlap**: 100 characters between chunks
- **Supported Formats**: PDF, DOCX, TXT, HTML

### Vector Database
- **Dimensions**: 768 (matches BGE model)
- **Metric**: Cosine similarity
- **Storage**: Metadata includes content preview and document info

### AI Models
- **Embedding Model**: BGE Base EN v1.5 (768 dimensions)
- **Chat Model**: Llama 3.1 8B Instruct
- **Context Window**: Uses top 5 search results for chat

## Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy to your preferred platform
3. Set environment variables in deployment settings

### Worker Deployment
1. Update `wrangler.toml` configuration
2. Run `npm run worker:deploy`
3. Update frontend environment with worker URL

## Troubleshooting

### Common Issues

1. **Worker deployment fails**
   - Ensure you're logged in: `npx wrangler login`
   - Check your Cloudflare plan supports Workers AI
   - Verify Vectorize database is created

2. **Search returns no results**
   - Ensure documents are uploaded successfully
   - Check worker logs: `npx wrangler tail`
   - Verify Vectorize database has data

3. **File upload fails**
   - Check file format is supported
   - Ensure file size is reasonable (<10MB recommended)
   - Verify API routes are working

### Logs and Debugging
```bash
# View worker logs
npx wrangler tail

# Test worker locally
npm run worker:dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
