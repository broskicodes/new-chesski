import { NextResponse } from 'next/server';

export function middleware(request) {
  const response = NextResponse.next();
  const origin = request.headers.get('origin');

  if (origin && origin.endsWith('.chesski.lol')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_POSTHOG_PROXY_HOST);
  }

  response.headers.set('Vary', 'Origin');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

  return response;
}