// Pruebas de: Proveedores, órdenes de compra y recepción de productos.
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompraProveedores } from './compra-proveedores';

describe('CompraProveedores', () => {
  let component: CompraProveedores;
  let fixture: ComponentFixture<CompraProveedores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [CompraProveedores],
    }).compileComponents();

    fixture = TestBed.createComponent(CompraProveedores);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
