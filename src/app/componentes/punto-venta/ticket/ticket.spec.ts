import { vi } from 'vitest';
import { By } from '@angular/platform-browser';
import { FormularioCliente } from '../../compartidos/modales/formulario-cliente/formulario-cliente';
import { VentasService } from '../../compartidos/servicios/ventas.service';
import { Router, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { Ticket } from './ticket';

describe('Ticket', () => {
  it('should render the ticket preview', async () => {
    await TestBed.configureTestingModule({
      imports: [Ticket],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Ticket);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('TICKET DE MUESTRA');
  });
  it('opens and cancels without navigating, then returns to POS after saving', async () => {
    await TestBed.configureTestingModule({
      imports: [Ticket],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(Ticket);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const ventas = TestBed.inject(VentasService);
    const venta = ventas.registrarVenta(1, 116, 'Tarjeta', true);
    fixture.componentInstance.carritoService.ultimoFolio = venta.folio;
    await fixture.whenStable();
    const open = () => {
      const buttons = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
      buttons.find(button => button.textContent?.includes('Generar factura'))!.click();
      fixture.detectChanges();
    };
    open();
    expect(fixture.nativeElement.querySelector('app-formulario-cliente')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
    fixture.nativeElement.querySelector('.modal-close').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-formulario-cliente')).toBeNull();
    expect(fixture.componentInstance.carritoService.ultimoFolio).toBe(venta.folio);
    expect(navigate).not.toHaveBeenCalled();
    open();
    const modal = fixture.debugElement.query(By.directive(FormularioCliente)).componentInstance as FormularioCliente;
    modal.datos = { nombre: 'Cliente', rfc: 'XAXX010101000', codigoPostal: '31000', regimenFiscal: modal.regimenes[0], correo: '' };
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(venta.factura).toBe('emitida');
    expect(fixture.nativeElement.querySelector('app-formulario-cliente')).toBeNull();
    expect(fixture.componentInstance.carritoService.ultimoFolio).toBe('');
    expect(navigate).toHaveBeenCalledWith(['/punto-venta']);
  });
});
