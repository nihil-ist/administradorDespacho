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

export const routes: Routes = [
    {path: 'login', component: LoginComponent, data: {title: 'Iniciar Sesión | LOF'}},
    {path: 'home', component: HomeComponent, data: {title: 'Inicio | LOF'}},
    {path: 'expedientes', component: ExpedientesComponent, data: {title: 'Expedientes | LOF'}},
    {path: 'expedientes/lista', component: ExpedientesListaComponent, data: {title: 'Listado de Expedientes | LOF'}},
    {path: 'nuevoExpediente', component: NuevoExpedienteComponent, data: {title: 'Nuevo Expediente | LOF'}},
    {path: 'agenda', component: AgendaComponent, data: {title: 'Agenda | LOF'}},
    {path: 'directorio', component: DirectorioComponent, data: {title: 'Directorio | LOF'}},
    {path: 'herramientas', component: HomeHerramientasComponent, data: {title: 'Herramientas | LOF'}},
    {path: 'herramientas/usuarios', component: UsuariosComponent, data: {title: 'Herramientas - Usuarios | LOF'}},
    {path: 'herramientas/usuarios/nuevo', component: AddUserComponent, data: {title: 'Herramientas - Nuevo Usuario | LOF'}},
    {path:  '**', pathMatch:"full", redirectTo: 'login'}
];