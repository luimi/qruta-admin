import { TestBed } from '@angular/core/testing';

import { LeafletCtrl } from './leaflet-ctrl';

describe('LeafletCtrl', () => {
  let service: LeafletCtrl;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeafletCtrl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
