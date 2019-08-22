import { TestBed } from '@angular/core/testing';

import { ImagerecognitionService } from './imagerecognition.service';

describe('ImagerecognitionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ImagerecognitionService = TestBed.get(ImagerecognitionService);
    expect(service).toBeTruthy();
  });
});
