# ROTEIRO CLAUDE CODE — 09: Fixes de Perfil e Segurança

**Herda:** `ROTEIRO_CLAUDE_CODE_00_base_comum.md`.
**Origem:** falhas 1.4, 1.5, 5.4, 5.5 do teste de 24/05. Agrupados por serem telas de conta do profissional.

---

## A. Campo de WhatsApp no Perfil (falhas 1.4, 1.5)

**Problema:** o teste não encontrou onde editar o número de WhatsApp no perfil. Como o WhatsApp é o canal central do produto, o profissional precisa poder definir/editar o número em local óbvio.

- Verificar se o campo existe em algum lugar (ex.: config Z-API do admin) e por que não está no perfil do profissional. **Não duplicar** a fonte de verdade do número — se já existe no modelo, expor no perfil; não criar um segundo campo.
- Adicionar o campo **WhatsApp** na tela de perfil do profissional, editável e salvável.
- **Validação de número (formato brasileiro):** DDI/DDD + número válido. Número inválido bloqueia o salvar com mensagem clara (atende 1.4). Número válido salva com toast de sucesso (atende 1.5).
- Considerar a relação com a conexão da instância: o número aqui é o que o profissional usa no WhatsApp. Se mudar o número muda algo na conexão Z-API, sinalizar ao usuário (sem quebrar a conexão existente).**** Se houver dúvida sobre esse acoplamento, **perguntar** antes de alterar comportamento de conexão.

## B. Troca de senha (falhas 5.4, 5.5)

**Problemas observados:**
- 5.4: erro "senhas não coincidem" não aparece; o botão só habilita quando coincidem, mas sem feedback — o usuário não entende por que o botão está inativo.
- 5.5: mensagem de erro vaza em inglês ("New password should be different from the old password."); campos não limpam após sucesso.

Correções:
- **Feedback de não-coincidência:** exibir mensagem clara quando as senhas diferem, em vez de só manter o botão desabilitado em silêncio. O usuário deve entender o que falta.
- **Mensagens em português:** traduzir/tratar as mensagens de erro do provedor de auth (Supabase) para português, com texto amigável. Mapear ao menos os casos comuns: senha igual à anterior, senha fraca, senha curta, sessão expirada. Não exibir a string crua do provedor.
- **Limpar campos após sucesso** e exibir toast de sucesso (atende 5.5).
- Manter a validação de tamanho mínimo que já funciona (5.3 passou).
- Acessibilidade: mensagens de erro associadas aos campos (`aria-describedby`), foco adequado.

## Critérios de aceite

Perfil / WhatsApp
- [ ] Campo WhatsApp visível e editável no perfil, fonte de verdade única (sem duplicar).
- [ ] Número inválido bloqueia salvar com mensagem (1.4).
- [ ] Número válido salva com toast (1.5).
- [ ] Impacto na conexão Z-API tratado/sinalizado, sem quebrar conexão existente.

Senha
- [ ] Mensagem visível quando senhas não coincidem (5.4).
- [ ] Mensagens de erro de auth em português e amigáveis (5.5).
- [ ] Campos limpam + toast após sucesso (5.5).
- [ ] Erros associados aos campos (acessibilidade).

Geral
- [ ] Build verde; nada quebrado nos fluxos que já passavam.
