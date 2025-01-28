This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project for langgraph.

## Getting Started

First, add your langgraph API url and assistant id to `.env.local` file:

```
LANGCHAIN_API_KEY=your_langchain_api_key
LANGGRAPH_API_URL=your_langgraph_api_url
NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID=your_assistant_id_or_graph_id 
```

Add your Auth0 configuration to the `.env.local` file:

```
AUTH0_DOMAIN=your_auth0_domain
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_REDIRECT_URI=your_auth0_redirect_uri
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
