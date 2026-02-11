import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Route } from './route';

describe('Route', () => {
  let component: Route;
  let fixture: ComponentFixture<Route>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Route]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Route);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
