import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Newcity } from './newcity';

describe('Newcity', () => {
  let component: Newcity;
  let fixture: ComponentFixture<Newcity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Newcity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Newcity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
