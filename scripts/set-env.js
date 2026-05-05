// Gerado automaticamente durante o build no Vercel.
// Lê as variáveis de ambiente e escreve src/environments/environment.prod.ts.
// Para rodar localmente: SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/set-env.js

const fs   = require('fs');
const path = require('path');

const url    = process.env['SUPABASE_URL'];
const anonKey = process.env['SUPABASE_ANON_KEY'];
const apiUrl  = process.env['API_URL'] || 'https://api.agendazap.tech';

if (!url || !anonKey) {
  console.error('ERRO: SUPABASE_URL e SUPABASE_ANON_KEY sao obrigatorias.');
  console.error('Configure essas variaveis no painel do Vercel (Settings > Environment Variables).');
  process.exit(1);
}

const content = `export const environment = {
  production: true,
  supabaseUrl: '${url}',
  supabaseAnonKey: '${anonKey}',
  apiUrl: '${apiUrl}',
};
`;

const target = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(target, content, { encoding: 'utf8' });
console.log('environment.prod.ts gerado com sucesso em', target);
