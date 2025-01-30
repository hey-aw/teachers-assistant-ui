# Assistant UI Starter for LangGraph

This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project for LangGraph.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- pnpm (recommended) or npm
- Access to either LangGraph Studio (local) or LangGraph Cloud

### Configuration Options

#### Option 1: Local Development with LangGraph Studio

1. Start LangGraph Studio locally
2. Create a `.env.local` file with the following configuration:

```env
NEXT_PUBLIC_LANGGRAPH_API_URL="http://localhost:8000"  # Local LangGraph Studio URL
NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID="your_local_graph_id"
```

#### Option 2: LangGraph Cloud Deployment

1. Deploy your graph to LangGraph Cloud
2. Create a `.env.local` file with the following configuration:

```env
LANGCHAIN_API_KEY="your_langchain_api_key"
LANGGRAPH_API_URL="https://api.langgraph.com"
LANGGRAPH_ASSISTANT_ID="your_cloud_graph_id"
```

### Running the Application

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Additional Configuration

### LangSmith Integration (Optional)

For debugging and monitoring, you can configure LangSmith:

```env
LANGSMITH_API_KEY="your_langsmith_api_key"
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
LANGSMITH_PROJECT="your-project-name"
```

### Authentication (Optional)

If you need authentication, configure Auth0:

```env
AUTH0_SECRET=your-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL='https://{DOMAIN}'
AUTH0_CLIENT_ID='{CLIENT_ID}'
AUTH0_CLIENT_SECRET='{CLIENT_SECRET}'
```

## Learn More

- [Assistant UI Documentation](https://www.assistant-ui.com)
- [LangGraph Documentation](https://python.langchain.com/docs/langgraph)
