import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'projectDespacho';
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd), // Solo escucha el final de la navegación
        map(() => this.activatedRoute), // Obtén la ruta activa
        map(route => {
          while (route.firstChild) {
            route = route.firstChild; // Navega hasta el último hijo
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'), // Asegúrate de que sea la ruta principal
        mergeMap(route => route.data) // Obtén los datos de la ruta activa
      )
      .subscribe(data => {
        const title = data['title'] || 'LOF | Juridico Agrario'; // Título por defecto si no hay uno definido
        this.titleService.setTitle(title); // Establece el título
      });
  }
}
