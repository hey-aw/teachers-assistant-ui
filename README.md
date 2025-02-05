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

## Environments

The application supports two environments:

### Preview Environment

The preview environment is activated when:

- `NEXT_PUBLIC_MOCK_AUTH` is set to 'true'

In the preview environment:

- Authentication uses a mock login system
- Users can log in with any email address
- No actual Auth0 integration is required
- Useful for development and testing


### Production Environment

The production environment is active when:

- `NEXT_PUBLIC_MOCK_AUTH` is set to 'false' or not set
In the production environment:

- Full Auth0 authentication is enabled
- Requires proper Auth0 configuration
- Secure authentication flow is enforced
- Used for staging and production deployments

### Environment Variables

For authentication setup:

```
# Production Auth0 Configuration (server-side)
AUTH0_SECRET=your_auth0_secret                  # Required in production - used to encrypt cookies
AUTH0_ISSUER_BASE_URL=your_auth0_issuer_url    # Required in production - your Auth0 domain
AUTH0_CLIENT_ID=your_auth0_client_id           # Required in production - your Auth0 application client ID
AUTH0_CLIENT_SECRET=your_auth0_client_secret   # Required in production - your Auth0 application client secret

# Note: AUTH0_BASE_URL is automatically set in deployments to the Azure Static Web Apps URL:
# - PR deployments: https://<preview-url>.azurestaticapps.net
# - Production: https://<app-name>.azurestaticapps.net

# Preview Environment Configuration
NEXT_PUBLIC_MOCK_AUTH=true                           # Set to 'true' to enable mock authentication regardless of environment
```

For local development:

- Set `NEXT_PUBLIC_MOCK_AUTH=true` in your `.env.local`
- Preview mode will be enabled, allowing mock authentication
- To enable production mode locally:
  1. Set up an Auth0 application in your Auth0 dashboard
  2. Set `AUTH0_BASE_URL=http://localhost:3000` in your `.env.local`
  3. Set all other required Auth0 environment variables
  4. Set `NEXT_PUBLIC_MOCK_AUTH=false` in your `.env.local`

## Note
