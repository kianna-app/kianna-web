import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rotas autenticadas: CSR puro (sem SSR, sem pré-render — usuário precisa estar logado)
  { path: 'dashboard/**', renderMode: RenderMode.Client },
  { path: 'onboarding',   renderMode: RenderMode.Client },
  // Demais rotas (auth, 404, raiz): pré-renderizadas como HTML estático
  { path: '**',           renderMode: RenderMode.Prerender },
];
