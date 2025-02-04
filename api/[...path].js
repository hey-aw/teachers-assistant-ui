function getApiKey() {
  const apiKey = process.env["LANGSMITH_API_KEY"] || "";
  if (!apiKey) {
    console.warn("LANGSMITH_API_KEY is not set");
  }
  return apiKey;
}

function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

async function handleRequest(req, method) {
  try {
    const path = req.params.path.join('/');
    const searchParams = new URLSearchParams(req.query);
    const queryString = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";

    const apiKey = getApiKey();
    if (!apiKey) {
      return {
        status: 401,
        body: { error: "API key is not configured" },
        headers: getCorsHeaders(),
      };
    }

    const options = {
      method,
      headers: {
        "X-Api-Key": apiKey,
      },
    };

    if (["POST", "PUT", "PATCH"].includes(method)) {
      options.body = req.rawBody;
    }

    const res = await fetch(
      `${process.env["LANGGRAPH_API_URL"]}/${path}${queryString}`,
      options,
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: res.statusText }));
      return {
        status: res.status,
        body: { error: errorData.message || 'API request failed' },
        headers: getCorsHeaders(),
      };
    }

    const responseData = await res.text();
    return {
      status: res.status,
      body: responseData,
      headers: {
        ...Object.fromEntries(res.headers.entries()),
        ...getCorsHeaders(),
      },
    };
  } catch (e) {
    console.error('API request error:', e);
    const status = e.status ?? (e.message?.includes('API key') ? 401 : 500);
    return {
      status,
      body: { error: e.message || 'Internal server error' },
      headers: {
        'Content-Type': 'application/json',
        ...getCorsHeaders(),
      },
    };
  }
}

module.exports = async function (context, req) {
  const method = req.method.toUpperCase();
  
  if (method === 'OPTIONS') {
    context.res = {
      status: 204,
      headers: getCorsHeaders(),
    };
    return;
  }

  context.res = await handleRequest(req, method);
}; 