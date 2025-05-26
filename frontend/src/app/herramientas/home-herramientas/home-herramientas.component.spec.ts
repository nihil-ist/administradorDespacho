import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeHerramientasComponent } from './home-herramientas.component';

describe('HomeHerramientasComponent', () => {
  let component: HomeHerramientasComponent;
  let fixture: ComponentFixture<HomeHerramientasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeHerramientasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeHerramientasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
