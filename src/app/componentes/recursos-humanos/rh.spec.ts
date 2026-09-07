import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RH } from './rh';

describe('RH', () => {
  let component: RH;
  let fixture: ComponentFixture<RH>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
      imports: [RH],
    }).compileComponents();

    fixture = TestBed.createComponent(RH);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
