import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-mensajes-gerente',
  templateUrl: './mensajes-gerente.component.html',
  styleUrls: ['./mensajes-gerente.component.scss'],
  standalone: true,
  imports: [CommonModule, HeaderComponent],
})
export class MensajesGerenteComponent implements OnInit {
  mensajes: any[] = [];
  cargando = true;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:3000/mensajes').subscribe({
      next: (data) => {
        this.mensajes = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }
} 