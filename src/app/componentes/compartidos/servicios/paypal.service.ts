import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL, PAYPAL_CLIENT_ID } from './api.config';
import { OrdenPaypal, ProductoCarrito, ResultadoPago } from '../models/paypal.models';

@Injectable({
  providedIn: 'root',
})
export class PaypalService {
  private readonly http = inject(HttpClient);
  private readonly api = `${API_URL}/paypal`;

  // El script del SDK va con async en index.html, así que puede tardar en estar disponible.
  private esperarSdk(): Promise<any> {
    return new Promise((resolve, reject) => {
      let intentos = 0;
      const revisar = () => {
        const sdk = (window as any).paypal;
        if (sdk) return resolve(sdk);
        if (++intentos > 100) return reject(new Error('No cargó el SDK de PayPal'));
        setTimeout(revisar, 100);
      };
      revisar();
    });
  }

  // Crea la instancia del SDK v6 con el Client ID de sandbox.
  async crearInstanciaSdk(): Promise<any> {
    const paypal = await this.esperarSdk();
    return paypal.createInstance({
      clientId: PAYPAL_CLIENT_ID,
      components: ['paypal-payments'],
      pageType: 'checkout',
    });
  }

  // Envía los productos al backend para crear la orden.
  crearOrden(productos: ProductoCarrito[]) {
    return this.http.post<OrdenPaypal>(`${this.api}/orden`, { productos });
  }

  capturarOrden(orderID: string) {
    return this.http.post<ResultadoPago>(`${this.api}/capturar/${encodeURIComponent(orderID)}`, {});
  }
}
