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

## Troubleshooting

### Verify `azure_static_web_apps_api_token` Secret

Ensure that the `azure_static_web_apps_api_token` secret is correctly set in your GitHub repository settings. This token is required for the deployment process to authenticate with Azure Static Web Apps.

### Check Build and Deployment Logs

Check the build and deployment logs for any specific error messages that can help identify the root cause of the issue. The logs can provide valuable insights into what might be going wrong during the build or deployment process.
