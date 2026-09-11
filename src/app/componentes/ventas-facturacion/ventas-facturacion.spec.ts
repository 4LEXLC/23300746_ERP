// Pruebas de: Historial de ventas y gestión de facturas.
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentasFacturacion } from './ventas-facturacion';

describe('VentasFacturacion', () => {
  let component: VentasFacturacion;
  let fixture: ComponentFixture<VentasFacturacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [VentasFacturacion],
    }).compileComponents();

    fixture = TestBed.createComponent(VentasFacturacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
