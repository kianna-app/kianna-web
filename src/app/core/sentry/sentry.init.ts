import {
  ErrorHandler,
  EnvironmentProviders,
  Provider,
  inject,
  provideAppInitializer,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import * as Sentry from '@sentry/angular';
import { environment } from '@environments/environment';

let sentryEnabled = false;

export function initSentry(): void {
  if (!environment.sentryDsn) {
    console.warn('[Sentry] DSN vazio — Sentry desativado');
    return;
  }

  Sentry.init({
    dsn: environment.sentryDsn,
    environment: environment.production ? 'production' : 'development',
    tracesSampleRate: environment.production ? 0.1 : 0,
    integrations: [Sentry.browserTracingIntegration()],
    sendDefaultPii: false,
    beforeSend(event, hint) {
      const original = hint?.originalException;

      // Ignorar erros de validação de formulário (não são bugs).
      if (original instanceof Error && /validation|invalid form|form invalid/i.test(original.message)) {
        return null;
      }

      // Filtrar 401/403 (sessão expirada/sem permissão são fluxo esperado).
      if (original instanceof HttpErrorResponse) {
        if (original.status === 401 || original.status === 403) return null;
      }

      // Sanitização extra de payloads.
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['authorization'];
        delete event.request.headers['Cookie'];
        delete event.request.headers['cookie'];
      }

      return event;
    },
  });
  sentryEnabled = true;
}

export function isSentryEnabled(): boolean {
  return sentryEnabled;
}

/**
 * Providers a serem incluídos no bootstrap do app. Quando o DSN está vazio,
 * registramos apenas um inicializador no-op para manter o pipeline simétrico.
 */
export function provideSentry(): (Provider | EnvironmentProviders)[] {
  return [
    {
      provide: ErrorHandler,
      useValue: environment.sentryDsn
        ? Sentry.createErrorHandler({ showDialog: false })
        : new ErrorHandler(),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    provideAppInitializer(() => {
      if (environment.sentryDsn) {
        inject(Sentry.TraceService);
      }
    }),
  ];
}
