import { RenderMode, ServerRoute } from '@angular/ssr';

// Todas as rotas como CSR puro.
// Este app é 100% auth-protected: nenhuma rota tem valor de SEO para pré-render.
// Prerender da rota raiz (redirect → /dashboard) causava loop infinito no Vercel.
export const serverRoutes: ServerRoute[] = [
  { path: '**', renderMode: RenderMode.Client },
];
