import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AgendaComponent } from './agenda.component';
import { AgendaService } from '../../services/agenda.service';
import { AuthService } from '../../services/auth.service';
import { ExpedientesService } from '../../services/expedientes.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('AgendaComponent', () => {
  let component: AgendaComponent;
  let fixture: ComponentFixture<AgendaComponent>;

  const agendaServiceMock = {
    getEvents: jasmine.createSpy('getEvents').and.returnValue(of([])),
    getUpcomingEvents: jasmine.createSpy('getUpcomingEvents').and.returnValue(of([])),
    createEvent: jasmine.createSpy('createEvent').and.returnValue(of({})),
    updateEvent: jasmine.createSpy('updateEvent').and.returnValue(of({})),
    deleteEvent: jasmine.createSpy('deleteEvent').and.returnValue(of({})),
    getEventTypes: jasmine
      .createSpy('getEventTypes')
      .and.returnValue(['AUDIENCIA', 'CITA', 'REUNION', 'TAREA', 'OTRO']),
  };

  const authServiceMock = {
    isAuthenticated: jasmine.createSpy('isAuthenticated').and.returnValue(true),
    getCurrentUser: jasmine.createSpy('getCurrentUser').and.returnValue({
      _id: 'user-1',
      nombre: 'Usuario Demo',
      usuario: 'demo',
      tipo: 'ABOGADO',
      correo: 'demo@example.com',
      activo: true,
    }),
    isAdmin: jasmine.createSpy('isAdmin').and.returnValue(false),
    getAssignmentIdentifier: jasmine.createSpy('getAssignmentIdentifier').and.returnValue('Usuario Demo'),
    getUsers: jasmine.createSpy('getUsers').and.returnValue(of([])),
  };

  const expedientesServiceMock = {
    getExpedientes: jasmine.createSpy('getExpedientes').and.returnValue(of([])),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaComponent, RouterTestingModule],
      providers: [
        { provide: AgendaService, useValue: agendaServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ExpedientesService, useValue: expedientesServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
