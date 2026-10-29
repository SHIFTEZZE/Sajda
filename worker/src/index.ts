export interface Env {
  FCM_PROJECT_ID?: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
}

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({
        status: 'healthy',
        service: 'sajda-relay-v1',
        relayEnabled: false,
      });
    }

    if (url.pathname.startsWith('/api/')) {
      return json({
        error: 'Relay disabled until authentication is implemented',
      }, 503);
    }

    return json({ error: 'Not found' }, 404);
  },
};
