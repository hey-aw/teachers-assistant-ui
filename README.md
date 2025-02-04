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

### Setting Up GitHub Secrets for Deployment Tokens

To securely manage deployment tokens, follow these steps:

1. Go to your repository on GitHub.
2. Click on the "Settings" tab.
3. In the left sidebar, click on "Secrets and variables" and then "Actions".
4. Click on the "New repository secret" button.
5. Add a new secret with the name `DEPLOYMENT_TOKEN` and paste your deployment token as the value.
6. Repeat the process for any other secrets required by your workflow files.

### Updating GitHub Actions Workflow Files to Use Secrets

Ensure your GitHub Actions workflow files are configured to use the secrets you have set up. For example, in your `.github/workflows/azure-static-web-apps-lively-coast-0ae46e91e.yml` file, you can add the `deployment_token` secret to the `env` section and update the `Build And Deploy` step to use it:

```yaml
env:
  DEPLOYMENT_TOKEN: ${{ secrets.DEPLOYMENT_TOKEN }}

steps:
  - name: Build And Deploy
    id: builddeploy
    uses: Azure/static-web-apps-deploy@v1
    with:
      azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_LIVELY_COAST_0AE46E91E }}
      repo_token: ${{ secrets.GITHUB_TOKEN }}
      action: 'upload'
      app_location: '/' # App source code path
      api_location: '' # Api source code path - optional
      output_location: '' # Built app content directory - optional
    env:
      DEPLOYMENT_TOKEN: ${{ env.DEPLOYMENT_TOKEN }}
```

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
