// Selección del método y simulación del pago.
import { CUSTOM_ELEMENTS_SCHEMA, Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CarritoService, MetodoPago } from '../../compartidos/servicios/carrito.service';
import { PaypalService } from '../../compartidos/servicios/paypal.service';
import { AfterViewInit } from '@angular/core';
import { Footer } from '../../compartidos/componentes/footer/footer/footer';
import { RouterLink } from '@angular/router';

@Component({
  imports: [Footer, RouterLink],
  selector: 'app-pago',
  styleUrl: './pago.css',
  templateUrl: './pago.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // permite usar <paypal-button>
})
export class Pago {
  private sesionPaypal: any = null;

  constructor(
    public carritoService: CarritoService,
    private router: Router,
    private paypalService: PaypalService,
  ) {
    if (!this.carritoService.ventaConfirmada) {
      this.router.navigateByUrl('/punto-venta');
      return;
    }
    this.prepararPaypal();
  }

  metodos: MetodoPago[] = [
    { id: 'efectivo', etiqueta: 'Efectivo' },
    { id: 'tarjeta', etiqueta: 'Tarjeta' },
  ];

  procesandoPago = signal(false);
  paypalListo = signal(false);
  mensajePago = signal('');
  aceptaTerminos = signal(false);

  // Actualiza el método de pago elegido.
  seleccionarMetodo(id: MetodoPago['id']): void {
    this.carritoService.metodoPago = id;
  }

  // Libera la reserva y vuelve al pedido.
  volverAlPedido(): void {
    this.carritoService.cancelarConfirmacion();
    this.router.navigateByUrl('/punto-venta');
  }

  // Inicia el SDK de PayPal y crea la sesión que cobra con tarjeta o cuenta PayPal.
  private async prepararPaypal(): Promise<void> {
    try {
      const sdk = await this.paypalService.crearInstanciaSdk();
      const metodos = await sdk.findEligibleMethods({ currencyCode: 'MXN' });

      if (!metodos.isEligible('paypal')) {
        this.mensajePago.set('PayPal no está disponible.');
        return;
      }

      this.sesionPaypal = sdk.createPayPalOneTimePaymentSession({
        // El cliente aprobó el pago: se captura en el backend y se registra la venta.
        onApprove: async (data: { orderId: string }) => {
          try {
            const resultado = await firstValueFrom(this.paypalService.capturarOrden(data.orderId));
            await firstValueFrom(this.carritoService.procesarPago(resultado.captureId));
            this.router.navigateByUrl('/ticket');
          } catch (e) {
            const mensaje = (e as { error?: { mensaje?: string } } | undefined)?.error?.mensaje;
            this.mensajePago.set(mensaje ?? 'El pago quedó pendiente de verificación. No se registró la venta.');
            this.procesandoPago.set(false);
          }
        },
        onCancel: () => {
          this.mensajePago.set('Pago cancelado.');
          this.procesandoPago.set(false);
        },
        onError: () => {
          this.mensajePago.set('Error al procesar el pago.');
          this.procesandoPago.set(false);
        },
      });

      this.paypalListo.set(true);
    } catch {
      this.mensajePago.set('No se pudo cargar PayPal.');
    }
  }

  // Abre PayPal: el backend crea la orden con los precios de la BD.
  async pagarConPaypal(): Promise<void> {
    if (!this.aceptaTerminos()) {
      this.mensajePago.set('Debes aceptar los términos y el aviso de privacidad para continuar.');
      return;
    }
    if (this.procesandoPago() || !this.sesionPaypal) return;
    this.procesandoPago.set(true);
    this.mensajePago.set('');

    const productos = this.carritoService.items.map((i) => ({ id: i.producto.id_producto, cantidad: i.cantidad }));
    try {
      await this.sesionPaypal.start(
        { presentationMode: 'auto' },
        firstValueFrom(this.paypalService.crearOrden(productos)).then((orden) => ({ orderId: orden.id })),
      );
    } catch {
      this.mensajePago.set('No se pudo iniciar el pago.');
      this.procesandoPago.set(false);
    }
  }

  // Pago en efectivo: registra la venta y continúa al comprobante.
  procesarPago(): void {
    if (!this.aceptaTerminos()) {
      this.mensajePago.set('Debes aceptar los términos y el aviso de privacidad para continuar.');
      return;
    }
    if (this.procesandoPago()) return;
    this.procesandoPago.set(true);

    this.carritoService.procesarPago().subscribe({
      next: () => {
        this.procesandoPago.set(false);
        this.router.navigateByUrl('/ticket');
      },
      error: (e) => {
        this.procesandoPago.set(false);
        this.mensajePago.set(e.error?.mensaje ?? 'No se pudo registrar la venta.');
      },
    });
  }
}
