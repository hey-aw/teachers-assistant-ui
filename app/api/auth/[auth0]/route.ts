import { handleAuth } from '@auth0/nextjs-auth0';

if (process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT) {
  process.env.AUTH0_BASE_URL = `https://${process.env.AZURE_STATIC_WEBAPPS_ENVIRONMENT}.azurecontainerapps.io`;
}

export const GET = handleAuth();
