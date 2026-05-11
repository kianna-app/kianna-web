# TASK — Bugs UI/UX (Grupo A)
> Repositório: `kianna-web`
> Pré-requisitos: Módulos 1 e 2 implementados, rebranding concluído
> Objetivo: corrigir 3 bugs/melhorias de UI identificados em revisão de produto
> Prioridade: alta (qualidade percebida do produto)
> Estimativa total: 2-3 horas

---

## ⚠️ LEIA ANTES DE COMEÇAR

### Princípios

1. **Crie uma branch separada:** `git checkout -b fix/grupo-a-ui`
2. **Commits pequenos por TAREFA** — facilita reverter se algo quebrar
3. **Rode `npm start` após cada TAREFA** pra validar visualmente
4. **Não toque em lógica de negócio** — apenas UI/CSS e validações

### Convenções Angular Material já estabelecidas

- Cor primária: `$kianna-green-500` (#1D9E75)
- Tipografia: Inter
- Border radius padrão de botões: 8px
- Altura padrão de botões grandes: 48px

---

## TAREFA 1 — Componente reutilizável `<app-loading-button>`

> 🎯 **Objetivo:** eliminar inconsistência de loading nos botões (Login, Cadastro, Onboarding, Salvar Serviço, Salvar Horários, etc).
> 🐛 **Bug que resolve:** spinner desalinhado com texto, botão "pulando" de tamanho entre estados.

### 1.1 Criar o componente

Crie `src/app/shared/components/loading-button/loading-button.component.ts`:

```typescript
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

export type LoadingButtonVariant = 'flat' | 'stroked' | 'raised';
export type LoadingButtonColor = 'primary' | 'accent' | 'warn' | undefined;

@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './loading-button.component.html',
  styleUrl: './loading-button.component.scss',
})
export class LoadingButtonComponent {
  @Input() variant: LoadingButtonVariant = 'flat';
  @Input() color: LoadingButtonColor = 'primary';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() loadingText = '';
  @Input() icon: string | null = null;
  @Input() iconPosition: 'start' | 'end' = 'end';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() ariaLabel = '';

  @Output() clicked = new EventEmitter<MouseEvent>();

  get isDisabled(): boolean {
    return this.disabled || this.loading;
  }

  onClick(event: MouseEvent): void {
    if (this.isDisabled) return;
    this.clicked.emit(event);
  }
}
```

### 1.2 Template `loading-button.component.html`

```html
@switch (variant) {
  @case ('flat') {
    <button mat-flat-button [color]="color" [type]="type"
            [disabled]="isDisabled" [attr.aria-label]="ariaLabel"
            (click)="onClick($event)" class="lb">
      <ng-container *ngTemplateOutlet="content"></ng-container>
    </button>
  }
  @case ('stroked') {
    <button mat-stroked-button [color]="color" [type]="type"
            [disabled]="isDisabled" [attr.aria-label]="ariaLabel"
            (click)="onClick($event)" class="lb">
      <ng-container *ngTemplateOutlet="content"></ng-container>
    </button>
  }
  @case ('raised') {
    <button mat-raised-button [color]="color" [type]="type"
            [disabled]="isDisabled" [attr.aria-label]="ariaLabel"
            (click)="onClick($event)" class="lb">
      <ng-container *ngTemplateOutlet="content"></ng-container>
    </button>
  }
}

<ng-template #content>
  <span class="lb-content" [class.is-loading]="loading">
    @if (loading) {
      <mat-spinner diameter="18" class="lb-spinner"></mat-spinner>
      <span class="lb-text">{{ loadingText || 'Carregando...' }}</span>
    } @else {
      @if (icon && iconPosition === 'start') {
        <mat-icon class="lb-icon">{{ icon }}</mat-icon>
      }
      <span class="lb-text"><ng-content></ng-content></span>
      @if (icon && iconPosition === 'end') {
        <mat-icon class="lb-icon">{{ icon }}</mat-icon>
      }
    }
  </span>
</ng-template>
```

### 1.3 Estilo `loading-button.component.scss`

```scss
@use 'styles/variables' as v;

:host {
  display: inline-block;
}

.lb {
  height: 48px !important;
  min-width: 120px;
  border-radius: 8px !important;
  font-weight: 600 !important;
  letter-spacing: 0.01em;
  padding: 0 20px !important;
}

.lb-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  line-height: 1;
}

.lb-icon {
  font-size: 18px;
  width: 18px;
  height: 18px;
  line-height: 18px;
}

.lb-spinner {
  // Override do material pra centralizar perfeitamente
  ::ng-deep circle {
    stroke: currentColor;
  }
}

.lb-text {
  white-space: nowrap;
}

// Quando está em loading, garante que o spinner não "pule" o layout
.is-loading {
  opacity: 0.85;
}
```

### 1.4 Substituir o botão do Onboarding

Edite `src/app/features/onboarding/onboarding.component.ts` — adicione o import:

```typescript
import { LoadingButtonComponent } from '@shared/components/loading-button/loading-button.component';

// No @Component, adicione no imports:
imports: [
  // ... existing imports
  LoadingButtonComponent,
],
```

Edite `src/app/features/onboarding/onboarding.component.html` — substitua o botão final do passo 3:

```html
<!-- ── ANTES (remover) ──
<button mat-raised-button color="primary" type="button"
        (click)="concluirOnboarding()" [disabled]="isLoading() || diasAtivos().size === 0">
  @if (isLoading()) {
    <mat-spinner diameter="20"></mat-spinner> Salvando...
  } @else {
    Concluir e ir ao dashboard <mat-icon>check</mat-icon>
  }
</button>
-->

<!-- ── DEPOIS ── -->
<app-loading-button
  variant="flat"
  color="primary"
  [loading]="isLoading()"
  [disabled]="diasAtivos().size === 0"
  loadingText="Salvando..."
  icon="check"
  iconPosition="end"
  (clicked)="concluirOnboarding()">
  Concluir e ir ao dashboard
</app-loading-button>
```

### 1.5 Substituir nos demais lugares (refactor)

> ⚠️ **Importante:** depois que o componente estiver funcionando no Onboarding, substitua nos outros lugares onde aparece o mesmo padrão antigo. Pra cada arquivo:
>
> 1. Adicionar `LoadingButtonComponent` nos imports do `@Component`
> 2. Trocar `<button mat-...>` com spinner condicional por `<app-loading-button>`

**Arquivos a atualizar:**
- `src/app/features/auth/login/login.component.html` — botão "Entrar"
- `src/app/features/auth/cadastro/cadastro.component.html` — botão "Criar conta grátis"
- `src/app/features/dashboard/pages/horarios/horarios.component.html` — botão "Salvar horários"

> 💡 **Atenção:** mantenha o **mesmo texto** e a **mesma lógica de signals** (`isLoading()`, etc). Está só trocando a "casca visual" do botão.

### 1.6 Validar no navegador

- [ ] Onboarding: clica em "Concluir" → spinner aparece sem o botão mudar de tamanho
- [ ] Spinner está alinhado verticalmente com o texto
- [ ] Botão fica com altura fixa (48px) durante todo o ciclo de loading
- [ ] Mesmo comportamento em Login, Cadastro, Salvar Horários

---

## TAREFA 2 — Header público: ajustar botão "Entrar"

> 🎯 **Objetivo:** garantir que "Entrar" tenha **acessibilidade adequada** (WCAG AA + estados hover/focus) sem competir visualmente com o CTA primário "Criar conta grátis".
> 🐛 **Bug que resolve:** botão "Entrar" sem feedback visual de hover, sem outline de focus, contraste no limite.

### 2.1 Edite `src/app/features/home/sections/header-publico/header-publico.component.scss`

Substitua o bloco `.btn-entrar` por:

```scss
.btn-entrar {
  font-size: 14px;
  font-weight: 500;
  color: v.$kianna-slate-700;        // Contraste 7:1 com fundo branco — passa WCAG AAA
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 6px;
  transition: background .15s, color .15s;
  border: 1px solid transparent;     // Reserva espaço pro focus, não "pula" no foco

  &:hover {
    background: v.$kianna-slate-100;
    color: v.$kianna-green-700;
  }

  &:focus-visible {
    outline: 2px solid v.$kianna-green-500;
    outline-offset: 2px;
  }

  @media (max-width: 600px) {
    display: none;
  }
}
```

### 2.2 Edite o template `header-publico.component.html`

Substitua o trecho do menu mobile pra incluir "Entrar" antes do hamburguer fechar:

```html
<!-- ── ANTES (remover) ──
@if (menuAberto()) {
  <div class="nav-mobile">
    @for (s of secoes; track s.id) {
      <button class="nav-link-mobile" (click)="scrollPara(s.id)">{{ s.label }}</button>
    }
    <a routerLink="/auth/login" class="nav-link-mobile">Entrar</a>
  </div>
}
-->

<!-- ── DEPOIS ── -->
@if (menuAberto()) {
  <div class="nav-mobile">
    @for (s of secoes; track s.id) {
      <button class="nav-link-mobile" (click)="scrollPara(s.id)">{{ s.label }}</button>
    }
    <a routerLink="/auth/login" class="nav-link-mobile entrar-mobile">
      <mat-icon>login</mat-icon> Entrar na minha conta
    </a>
    <a routerLink="/auth/cadastro" class="nav-link-mobile cadastrar-mobile">
      <mat-icon>add</mat-icon> Criar conta grátis
    </a>
  </div>
}
```

### 2.3 Adicionar estilos do menu mobile

No mesmo arquivo `.scss`, **substitua** o bloco `.nav-link-mobile` por:

```scss
.nav-link-mobile {
  background: transparent;
  border: none;
  text-align: left;
  padding: 14px 8px;
  font-size: 15px;
  color: v.$kianna-slate-700;
  text-decoration: none;
  cursor: pointer;
  border-bottom: 1px solid v.$kianna-slate-100;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;

  mat-icon {
    font-size: 18px;
    width: 18px;
    height: 18px;
    color: v.$kianna-slate-500;
  }

  &:last-child {
    border-bottom: none;
  }

  &.entrar-mobile {
    color: v.$kianna-slate-800;
    font-weight: 600;
    margin-top: 8px;
    border-top: 1px solid v.$kianna-slate-200;

    mat-icon { color: v.$kianna-green-600; }
  }

  &.cadastrar-mobile {
    background: v.$kianna-green-500;
    color: #fff;
    font-weight: 600;
    border-radius: 8px;
    margin-top: 4px;
    border: none;
    justify-content: center;

    mat-icon { color: #fff; }

    &:hover { background: v.$kianna-green-600; }
  }
}
```

### 2.4 Validar

- [ ] Desktop ≥600px: "Entrar" como link de texto discreto + "Criar conta" como botão verde sólido
- [ ] Hover no "Entrar": fundo cinza claro + texto verde escuro
- [ ] `Tab` no teclado: outline verde de 2px aparece ao focar
- [ ] Mobile <600px: "Entrar" some do header, mas aparece no menu hambúrguer
- [ ] Menu mobile aberto: "Entrar na minha conta" e "Criar conta grátis" visíveis com ícones

---

## TAREFA 3 — Onboarding: ajustar espaçamento entre campos

> 🎯 **Objetivo:** dar respiro visual aos formulários, eliminar sobreposição entre labels/hints/erros.
> 🐛 **Bug que resolve:** campos colados, texto explicativo perto demais dos inputs.

### 3.1 Edite `src/app/features/dashboard/pages/horarios/horarios.component.scss`

Não, espera — esse arquivo NÃO tem onboarding. O arquivo correto é o do onboarding em si.

### 3.1 Edite `src/styles.scss`

Localize a seção `// ── Onboarding ──` (que foi adicionada no Módulo 1) e substitua o bloco `.step-form` por:

```scss
.step-form {
  padding: 16px 0 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;                    // ← antes era 12px

  h2 {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 4px;            // ← garante margem inferior pequena
  }
}
```

### 3.2 Ajustar espaçamento da descrição

No mesmo arquivo, **substitua** `.step-desc` por:

```scss
.step-desc {
  color: vars.$kianna-slate-500;
  font-size: 14px;
  margin: 0 0 12px;            // ← garante 12px de respiro antes do próximo campo
  line-height: 1.5;
}
```

### 3.3 Garantir respiro no row de 2 colunas

Localize `.row-2col` e ajuste:

```scss
.row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;                    // ← antes era 12px
  margin-top: 4px;              // ← respiro do campo anterior

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

### 3.4 Espaçamento das ações do step

```scss
.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;             // ← antes era 16px
  padding-top: 16px;
  border-top: 1px solid vars.$kianna-slate-100;
}
```

### 3.5 Validar visualmente

- [ ] Passo 1 (Perfil): foto, nome, especialidade, WhatsApp, bio — todos com respiro
- [ ] Texto "Vamos configurar seu perfil" não cola com primeiro campo
- [ ] Mensagens de erro aparecem sem empurrar layout
- [ ] Passo 2 (Serviços): nome do serviço, duração e preço com respiro adequado
- [ ] Passo 3 (Horários): início, fim e intervalo com respiro adequado

---

## TAREFA 4 — Onboarding: validação WhatsApp aceitando múltiplos formatos

> 🎯 **Objetivo:** aceitar entrada flexível do WhatsApp, validar só pela quantidade de dígitos.
> 🐛 **Bug que resolve:** usuário digita `44999998888` e sistema rejeita com erro de formato.

### 4.1 Adicionar utilitário de WhatsApp

Crie `src/app/core/utils/whatsapp.util.ts`:

```typescript
/**
 * Remove todos os caracteres não numéricos de um WhatsApp.
 * "(44) 99999-8888" → "44999998888"
 */
export function limparWhatsApp(valor: string): string {
  return (valor ?? '').replace(/\D/g, '');
}

/**
 * Valida se um WhatsApp tem 10 ou 11 dígitos (BR).
 * 10 = fixo (raro), 11 = celular com 9
 */
export function whatsAppValido(valor: string): boolean {
  const digitos = limparWhatsApp(valor);
  return digitos.length === 10 || digitos.length === 11;
}

/**
 * Formata WhatsApp pra display: "44999998888" → "(44) 99999-8888"
 */
export function formatarWhatsApp(valor: string): string {
  const d = limparWhatsApp(valor);
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return valor;
}

/**
 * Validator do Angular Reactive Forms.
 * Use: Validators.required junto com whatsAppValidator()
 */
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function whatsAppValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (!valor) return null; // null = sem erro (required cuida disso)
  return whatsAppValido(valor) ? null : { whatsappInvalido: true };
}
```

### 4.2 Atualizar o componente Onboarding

Em `src/app/features/onboarding/onboarding.component.ts`, **substitua** o validator do WhatsApp:

```typescript
// ── ANTES (remover) ──
// whatsapp: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/)]],

// ── DEPOIS ──
import { whatsAppValidator, limparWhatsApp } from '@core/utils/whatsapp.util';

// No construtor do form:
whatsapp: ['', [Validators.required, whatsAppValidator]],
```

E **antes de salvar**, normalize o valor pra armazenar só dígitos no banco:

```typescript
async concluirOnboarding(): Promise<void> {
  // ... início do método

  const { data: profissional, error: profErr } = await supabase
    .from('profissionais')
    .insert({
      user_id:       user.id,
      nome,
      slug,
      foto_url,
      whatsapp:      limparWhatsApp(this.perfilForm.value.whatsapp!),  // ← AQUI
      especialidade: this.perfilForm.value.especialidade!,
      // ... resto igual
    })
```

### 4.3 Atualizar mensagem de erro no template

Em `src/app/features/onboarding/onboarding.component.html`, **substitua**:

```html
<!-- ── ANTES (remover) ──
@if (perfilForm.get('whatsapp')?.hasError('pattern')) {
  <mat-error>Formato: (44) 99999-9999</mat-error>
}
-->

<!-- ── DEPOIS ── -->
<mat-hint align="start">Pode digitar com ou sem parênteses</mat-hint>
@if (perfilForm.get('whatsapp')?.hasError('whatsappInvalido')) {
  <mat-error>Digite um WhatsApp válido (10 ou 11 dígitos)</mat-error>
}
```

### 4.4 Aplicar o mesmo nos outros lugares (refactor)

> Quando você implementar o Módulo 3 (página pública), o cliente final vai informar o WhatsApp dele. Use o mesmo `whatsAppValidator` lá. **Princípio:** validação de WhatsApp existe em **um só lugar** (`whatsapp.util.ts`).

### 4.5 Validar

- [ ] Digitando `44999998888` (sem máscara) → aceita
- [ ] Digitando `(44) 99999-8888` → aceita
- [ ] Digitando `44 99999 8888` → aceita
- [ ] Digitando `99998888` (8 dígitos) → mostra erro
- [ ] Digitando `123456789012` (12 dígitos) → mostra erro
- [ ] Após salvar, conferir no Supabase: campo `whatsapp` está só com dígitos

---

## TAREFA 5 — Verificação final

### 5.1 Rodar build de produção

```bash
npm run build -- --configuration=production
```

> Confirma que não há erros de TypeScript ou referências quebradas.

### 5.2 Checklist visual completo

**Login (`/auth/login`):**
- [ ] Botão "Entrar" usa `<app-loading-button>` consistente
- [ ] Spinner não distorce o botão durante loading

**Cadastro (`/auth/cadastro`):**
- [ ] Botão "Criar conta grátis" usa `<app-loading-button>` consistente
- [ ] Spinner não distorce o botão durante loading

**Onboarding (`/onboarding`):**
- [ ] Espaçamento entre campos generoso (sem sobreposições)
- [ ] WhatsApp aceita formato livre (44999998888 ou (44) 99999-8888)
- [ ] Botão "Concluir" usa `<app-loading-button>` consistente

**Dashboard → Horários (`/dashboard/horarios`):**
- [ ] Botão "Salvar horários" usa `<app-loading-button>` consistente

**Homepage (`/`):**
- [ ] Botão "Entrar" no header desktop tem hover visível e focus outline
- [ ] Em mobile (<600px), "Entrar" some do header
- [ ] Menu hambúrguer mobile mostra "Entrar na minha conta" e "Criar conta grátis"

**Acessibilidade geral:**
- [ ] Navegação por teclado (Tab) mostra outline em todos os elementos focáveis
- [ ] Contraste de texto passa WCAG AA (use a extensão WAVE ou axe DevTools pra checar)

### 5.3 Commit final

```bash
git add .
git commit -m "fix(ui): grupo A — loading-button reutilizável, espaçamento onboarding, validação WhatsApp flexível, botão Entrar acessível"
git push origin fix/grupo-a-ui
```

Abrir Pull Request → merge na main.

---

## ⚠️ Erros comuns e como resolver

### Build falha com "Cannot find module '@shared/components/loading-button'"
Verifique que o `tsconfig.json` tem o alias `@shared/*` configurado (do Módulo 1). Se não tiver, adicione:
```json
"paths": {
  "@shared/*": ["src/app/shared/*"]
}
```

### Spinner do `<app-loading-button>` não aparece colorido corretamente
O CSS `stroke: currentColor` no spinner depende da cor do texto do botão. Em botões `mat-flat-button color="primary"`, o texto é branco, então spinner fica branco. Funciona automaticamente.

### `mat-icon` não aparece no menu mobile
Confirmar que `MatIconModule` está nos `imports` do `HeaderPublicoComponent`. Se já estava, ok; se não, adicionar.

### WhatsApp aceita números aleatórios após mudança
Confirmar que `whatsAppValidator` está sendo passado **sem invocar** (`whatsAppValidator`, não `whatsAppValidator()`). É uma referência de função, não chamada.

---

## ✅ Checklist final do Grupo A

- [ ] Componente `<app-loading-button>` criado e funcionando
- [ ] Onboarding usa o componente novo (botão "Concluir")
- [ ] Login, Cadastro, Salvar Horários migrados pro componente novo
- [ ] Botão "Entrar" do header com hover/focus acessíveis
- [ ] Mobile menu inclui "Entrar" e "Criar conta"
- [ ] Espaçamento do Onboarding aumentado (gap 20px)
- [ ] Texto descritivo do step não cola com inputs
- [ ] WhatsApp aceita formato livre
- [ ] Utilitário `whatsapp.util.ts` criado
- [ ] WhatsApp salvo no banco apenas com dígitos
- [ ] Build de produção sem erros
- [ ] Sem warnings no console do browser
- [ ] Branch mergeada na main

---

> Documento gerado para uso com Claude Code no VS Code.
> Projeto: Kianna · kianna.com.br · Grupo A de melhorias UI/UX
