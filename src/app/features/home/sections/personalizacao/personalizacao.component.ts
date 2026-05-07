import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-personalizacao',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  templateUrl: './personalizacao.component.html',
  styleUrl: './personalizacao.component.scss',
})
export class PersonalizacaoComponent {
  readonly temas = [
    { cor: '#1D9E75', nome: 'Verde Kianna', fundo: '#E8F8F3' },
    { cor: '#7C3AED', nome: 'Roxo Elegante', fundo: '#F5F3FF' },
    { cor: '#0EA5E9', nome: 'Azul Moderno', fundo: '#E0F2FE' },
    { cor: '#F97316', nome: 'Laranja Vibrante', fundo: '#FFF7ED' },
    { cor: '#EC4899', nome: 'Rosa Feminino', fundo: '#FDF2F8' },
  ];
}
