import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoExpedienteComponent } from './nuevo-expediente.component';

describe('NuevoExpedienteComponent', () => {
  let component: NuevoExpedienteComponent;
  let fixture: ComponentFixture<NuevoExpedienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoExpedienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoExpedienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
