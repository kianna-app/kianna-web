import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { supabase } from '@core/supabase/supabase.client';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private async headers(): Promise<HttpHeaders> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  async get<T>(path: string): Promise<T> {
    const headers = await this.headers();
    return firstValueFrom(this.http.get<T>(`${this.baseUrl}${path}`, { headers }));
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const headers = await this.headers();
    return firstValueFrom(this.http.post<T>(`${this.baseUrl}${path}`, body, { headers }));
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const headers = await this.headers();
    return firstValueFrom(this.http.patch<T>(`${this.baseUrl}${path}`, body, { headers }));
  }

  async delete<T>(path: string): Promise<T> {
    const headers = await this.headers();
    return firstValueFrom(this.http.delete<T>(`${this.baseUrl}${path}`, { headers }));
  }

  async getPublic<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.baseUrl}${path}`));
  }

  async postPublic<T>(path: string, body: unknown): Promise<T> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return firstValueFrom(this.http.post<T>(`${this.baseUrl}${path}`, body, { headers }));
  }
}
