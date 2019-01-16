import { inject, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../core.module';

import { MeshDialogsService } from './mesh-dialogs.service';

describe('MeshDialogsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CoreModule],
            providers: [MeshDialogsService]
        });
    });

    it(
        'should be created',
        inject([MeshDialogsService], (service: MeshDialogsService) => {
            expect(service).toBeTruthy();
        })
    );
});