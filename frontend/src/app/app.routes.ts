import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ExpedientesComponent } from './expedientes/expedientes.component';
import { NuevoExpedienteComponent } from './nuevo-expediente/nuevo-expediente.component';
import { ExpedientesListaComponent } from './expedientes/lista/expedientes-lista.component';
import { AgendaComponent } from './agenda/agenda.component';
import { HomeHerramientasComponent } from './herramientas/home-herramientas/home-herramientas.component';
import { UsuariosComponent } from './herramientas/usuarios/usuarios.component';
import { AddUserComponent } from './herramientas/add-user/add-user.component';
import { DirectorioComponent } from './directorio/directorio.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { SoporteComponent } from './soporte/soporte.component';
import { ContactoComponent } from './contacto/contacto.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
    {path: 'login', component: LoginComponent, data: {title: 'Iniciar Sesión | LOF'}},
    {path: 'home', component: HomeComponent, canActivate: [authGuard], data: {title: 'Inicio | LOF'}},
    {path: 'expedientes', component: ExpedientesComponent, canActivate: [authGuard], data: {title: 'Expedientes | LOF'}},
    {path: 'expedientes/lista', component: ExpedientesListaComponent, canActivate: [authGuard], data: {title: 'Listado de Expedientes | LOF'}},
    {path: 'nuevoExpediente', component: NuevoExpedienteComponent, canActivate: [authGuard, roleGuard], data: {title: 'Nuevo Expediente | LOF', roles: ['ADMINISTRADOR', 'ABOGADO']}},
    {path: 'agenda', component: AgendaComponent, canActivate: [authGuard], data: {title: 'Agenda | LOF'}},
    {path: 'directorio', component: DirectorioComponent, canActivate: [authGuard], data: {title: 'Directorio | LOF'}},
    {path: 'herramientas', component: HomeHerramientasComponent, canActivate: [authGuard, roleGuard], data: {title: 'Herramientas | LOF', roles: ['ADMINISTRADOR']}},
    {path: 'herramientas/usuarios', component: UsuariosComponent, canActivate: [authGuard, roleGuard], data: {title: 'Herramientas - Usuarios | LOF', roles: ['ADMINISTRADOR']}},
    {path: 'herramientas/usuarios/nuevo', component: AddUserComponent, canActivate: [authGuard, roleGuard], data: {title: 'Herramientas - Nuevo Usuario | LOF', roles: ['ADMINISTRADOR']}},
    {path: 'configuracion', component: ConfiguracionComponent, canActivate: [authGuard, roleGuard], data: {title: 'Configuración | LOF', roles: ['ADMINISTRADOR'] }},
    {path: 'soporte', component: SoporteComponent, canActivate: [authGuard], data: {title: 'Soporte | LOF' }},
    {path: 'contacto', component: ContactoComponent, canActivate: [authGuard], data: {title: 'Contacto | LOF' }},
    {path:  '**', pathMatch:"full", redirectTo: 'login'}
];