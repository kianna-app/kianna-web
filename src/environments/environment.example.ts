// Copie este arquivo para environment.ts e environment.prod.ts
// e preencha as credenciais reais. Esses dois arquivos estão no .gitignore.
export const environment = {
  production: false,
  supabaseUrl:    'COLE_AQUI_SUPABASE_URL',
  supabaseAnonKey:'COLE_AQUI_SUPABASE_ANON_KEY',
  apiUrl:         'http://localhost:3333',
  // Deixe vazio em dev local para desativar o Sentry.
  sentryDsn:      '',
};
