This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project for langgraph.

## Getting Started

First, add your configuration to `.env.local`. You have two options for setup:

### Option 1: Using the Next.js API Proxy (Recommended)

This approach keeps your API key secure on the server side.

```
# Server-side only - used by the Next.js API route
LANGSMITH_API_KEY=your_api_key
LANGGRAPH_API_URL=your_langgraph_api_url

# Public - safe to expose to the client
NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID=your_assistant_id_or_graph_id
```

### Option 2: Direct API Access

If you prefer to access the LangGraph API directly (not recommended for production):

```
NEXT_PUBLIC_LANGGRAPH_API_URL=your_langgraph_api_url
NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID=your_assistant_id_or_graph_id
```

Note: Do not set both `LANGGRAPH_API_URL` and `NEXT_PUBLIC_LANGGRAPH_API_URL`. Choose one approach or the other.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Note

Ensure `pnpm` is installed before running any commands. You can install it globally using the following command:

```bash
npm install -g pnpm
```

## Authentication

This project uses Azure Static Web Apps' built-in authentication with basic password protection. This provides a simple and secure way to protect your application without implementing a full authentication system.

To configure authentication:

1. Deploy your app to Azure Static Web Apps
2. In the Azure Portal, navigate to your Static Web App
3. Go to Settings > Authentication
4. Enable Basic Authentication and set up your credentials

For more information, see [Azure Static Web Apps Authentication](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-authorization).
