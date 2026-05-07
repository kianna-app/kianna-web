import { Component } from '@angular/core';
import { HeaderPublicoComponent } from './sections/header-publico/header-publico.component';
import { HeroComponent } from './sections/hero/hero.component';
import { TrustBarComponent } from './sections/trust-bar/trust-bar.component';
import { CustoInvisivelComponent } from './sections/custo-invisivel/custo-invisivel.component';
import { FeaturesComponent } from './sections/features/features.component';
import { ComoFuncionaComponent } from './sections/como-funciona/como-funciona.component';
import { NichosComponent } from './sections/nichos/nichos.component';
import { PersonalizacaoComponent } from './sections/personalizacao/personalizacao.component';
import { DepoimentosComponent } from './sections/depoimentos/depoimentos.component';
import { PlanosComponent } from './sections/planos/planos.component';
import { FaqComponent } from './sections/faq/faq.component';
import { CtaFinalComponent } from './sections/cta-final/cta-final.component';
import { FooterPublicoComponent } from './sections/footer-publico/footer-publico.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderPublicoComponent, HeroComponent, TrustBarComponent,
    CustoInvisivelComponent, FeaturesComponent, ComoFuncionaComponent,
    NichosComponent, PersonalizacaoComponent, DepoimentosComponent,
    PlanosComponent, FaqComponent, CtaFinalComponent, FooterPublicoComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
