import { http, HttpResponse } from 'msw';

// Add all your mocked endpoints here.
export const handlers = [
  http.get('https://api.example.com/me', () => {
    return HttpResponse.json({ id: 'u1', email: 'test@example.com' }, { status: 200 });
  }),
];
