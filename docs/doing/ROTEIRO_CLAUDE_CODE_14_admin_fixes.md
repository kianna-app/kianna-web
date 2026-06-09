# ROTEIRO CLAUDE CODE — 14: Admin — Criar Profissional, Reset de Senha, Logout

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Contexto:** três lacunas identificadas nos testes do painel `/admin`. Agrupadas porque todas são features do admin que faltaram na implementação original (roteiro 08).

---

## A. Criar profissional (corrigir bloqueio por `user_id`)

**Problema:** ao tentar criar um profissional pelo `/admin`, erro: "O schema atual exige user_id. Implemente o fluxo de convite do profissional antes (ver TODO em admin.service)."

- Inspecionar o TODO em `admin.service` e o schema de `profissionais` para entender o que falta.
- O `user_id` é o ID do usuário Supabase Auth — não existe até o profissional fazer cadastro. O fluxo correto para criação pelo admin é:
  1. Admin preenche nome + e-mail (+ plano, slug).
  2. Backend chama `supabase.auth.admin.inviteUserByEmail()` — isso cria o usuário no Auth, envia o e-mail de convite ao profissional, e retorna o `user_id`.
  3. Backend cria o registro em `profissionais` com o `user_id` recebido.
  4. Profissional recebe o e-mail, clica no link, define a senha e acessa normalmente.
- Se `inviteUserByEmail` não estiver disponível no plano/config do Supabase do projeto, usar `createUser` (sem e-mail automático) e registrar o `user_id` — nesse caso deixar TODO claro sobre o envio manual do acesso.
- Logar a criação no `AuditoriaService` (roteiro 12).

## B. Reset de senha pelo admin

**Comportamento esperado:** admin clica em "Resetar senha" no profissional → profissional recebe e-mail com link para redefinir → no próximo login é obrigado a definir nova senha.

- Usar a abordagem que o Supabase suporta: inspecionar se `supabase.auth.admin.generateLink({ type: 'recovery' })` ou `resetPasswordForEmail()` está disponível com as permissões do service role key no projeto.
- Se disponível: backend dispara o e-mail de recuperação para o e-mail do profissional. Admin vê confirmação "E-mail de redefinição enviado para profissional@email.com".
- Se não disponível com as permissões atuais: implementar com o que for possível e deixar TODO claro.
- **Não** expor nem definir senha diretamente — o Supabase não permite por design e não deve ser contornado.
- Logar no `AuditoriaService`: `acao: 'reset_senha_admin'`.

## C. Botão de logout no `/admin`

- Adicionar botão de **logout** visível no painel admin (ex.: canto superior direito ou rodapé do sidebar).
- Reusar o mesmo serviço/método de logout já usado no dashboard do profissional — não duplicar lógica.
- Após logout: redirecionar para `/auth/login`.

## Critérios de aceite

- [OK] Criar profissional pelo admin funciona: dispara convite por e-mail (ou `createUser` com TODO), cria registro com `user_id`, profissional consegue acessar após aceitar o convite.
- [OK] Criação logada no `AuditoriaService`.
- [OK] "Resetar senha" no admin dispara e-mail de redefinição ao profissional; admin recebe confirmação.
- [OK] Reset logado no `AuditoriaService`.
- [OK] Botão de logout no `/admin` funcional, redirecionando para login.
- [OK] Build verde.
