process.env = {
  ...process.env,
  // Auth0 Configuration
  AUTH0_SECRET: 'test-secret',
  AUTH0_BASE_URL: 'http://localhost:3000',
  AUTH0_ISSUER_BASE_URL: 'https://test.auth0.com',
  AUTH0_CLIENT_ID: 'test-client-id',
  AUTH0_CLIENT_SECRET: 'test-client-secret',
  AUTH0_AUDIENCE: 'test-audience',
  AUTH0_SCOPE: 'openid profile email email_verified',
  
  // LangGraph Configuration
  LANGCHAIN_API_KEY: 'test-langchain-key',
  LANGGRAPH_API_URL: 'https://test-langgraph-api.com',
  NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID: 'test-assistant-id',
  
  // Node Environment
  NODE_ENV: 'test'
}; 