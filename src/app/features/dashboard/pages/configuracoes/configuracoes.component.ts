import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { EmpresaComponent } from './empresa/empresa.component';
import { EnderecoComponent } from './endereco/endereco.component';
import { RedesSociaisComponent } from './redes-sociais/redes-sociais.component';
import { PerfilComponent } from './perfil/perfil.component';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, MatTabsModule, EmpresaComponent, EnderecoComponent, RedesSociaisComponent, PerfilComponent],
  template: `
    <div class="cfg-page">
      <h1>Configurações</h1>
      <p class="cfg-sub">Personalize seu perfil, empresa e canais de contato.</p>

      <mat-tab-group animationDuration="200ms" class="cfg-tabs">
        <mat-tab label="Empresa">    <app-cfg-empresa />        </mat-tab>
        <mat-tab label="Endereço">   <app-cfg-endereco />       </mat-tab>
        <mat-tab label="Redes">      <app-cfg-redes-sociais />  </mat-tab>
        <mat-tab label="Perfil">     <app-cfg-perfil />         </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .cfg-page { display: flex; flex-direction: column; gap: 16px; }
    h1 { font-size: 24px; font-weight: 700; margin: 0; color: #0F172A; }
    .cfg-sub { font-size: 13px; color: #64748B; margin: 0 0 16px; }
    .cfg-tabs { background: #fff; border-radius: 12px; padding: 8px; }
    ::ng-deep .mat-mdc-tab-body-content { padding: 24px 16px; }
  `],
})
export class ConfiguracoesComponent {}
