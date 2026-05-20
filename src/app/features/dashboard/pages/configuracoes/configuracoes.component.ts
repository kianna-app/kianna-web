import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmpresaComponent } from './empresa/empresa.component';
import { EnderecoComponent } from './endereco/endereco.component';
import { RedesSociaisComponent } from './redes-sociais/redes-sociais.component';
import { PerfilComponent } from './perfil/perfil.component';
import { WhatsappComponent } from './whatsapp/whatsapp.component';

const ABAS = ['empresa', 'endereco', 'redes', 'whatsapp', 'perfil'] as const;
type Aba = typeof ABAS[number];

const TABS_CONFIG = [
  { id: 'empresa',  label: 'Empresa',  icon: 'storefront'      },
  { id: 'endereco', label: 'Endereço', icon: 'location_on'     },
  { id: 'redes',    label: 'Redes',    icon: 'share'           },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat'            },
  { id: 'perfil',   label: 'Perfil',   icon: 'manage_accounts' },
] as const;

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule, MatIconModule,
    EmpresaComponent, EnderecoComponent, RedesSociaisComponent, WhatsappComponent, PerfilComponent,
  ],
  template: `
    <div class="cfg-page">
      <div class="cfg-header">
        <h1>Configurações</h1>
        <p class="cfg-sub">Gerencie as configurações da sua organização</p>
      </div>

      <nav class="cfg-tabs-nav" role="tablist" aria-label="Seções de configuração">
        @for (tab of tabs; track tab.id; let i = $index) {
          <button
            class="cfg-tab-btn"
            [class.active]="abaIndex() === i"
            (click)="onTabChange(i)"
            role="tab"
            [attr.aria-selected]="abaIndex() === i">
            <mat-icon>{{ tab.icon }}</mat-icon>
            <span>{{ tab.label }}</span>
          </button>
        }
      </nav>

      <div class="cfg-content" role="tabpanel">
        @switch (abaIndex()) {
          @case (0) { <app-cfg-empresa /> }
          @case (1) { <app-cfg-endereco /> }
          @case (2) { <app-cfg-redes-sociais /> }
          @case (3) { <app-cfg-whatsapp /> }
          @case (4) { <app-cfg-perfil /> }
        }
      </div>
    </div>
  `,
  styles: [`
    .cfg-page {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    h1 {
      font-size: 22px;
      font-weight: 700;
      margin: 0;
      color: #0F172A;
      letter-spacing: -0.3px;
    }

    .cfg-sub {
      font-size: 14px;
      color: #64748B;
      margin: 4px 0 0;
    }

    .cfg-tabs-nav {
      display: flex;
      gap: 4px;
      background: #fff;
      border-radius: 12px;
      padding: 6px;
      border: 1px solid #E2E8F0;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      flex-shrink: 0;
    }

    .cfg-tabs-nav::-webkit-scrollbar { display: none; }

    .cfg-tab-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 9px 16px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      font-family: 'Inter', sans-serif;
      color: #64748B;
      white-space: nowrap;
      transition: background 0.15s ease, color 0.15s ease;
      line-height: 1;
      flex-shrink: 0;
    }

    .cfg-tab-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      line-height: 18px;
    }

    .cfg-tab-btn:hover:not(.active) {
      background: #F1F5F9;
      color: #334155;
    }

    .cfg-tab-btn.active {
      background: #1D9E75;
      color: #fff;
      font-weight: 600;
    }

    @media (max-width: 480px) {
      .cfg-tab-btn {
        padding: 8px 12px;
        font-size: 13px;
        gap: 5px;
      }
      .cfg-tab-btn mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
  `],
})
export class ConfiguracoesComponent {
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  readonly tabs = TABS_CONFIG;

  readonly params   = toSignal(this.route.queryParamMap);
  readonly abaIndex = computed(() => {
    const aba = (this.params()?.get('aba') ?? 'empresa') as Aba;
    const idx = ABAS.indexOf(aba);
    return idx >= 0 ? idx : 0;
  });

  onTabChange(idx: number): void {
    this.router.navigate([], {
      queryParams: { aba: ABAS[idx] },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}
