import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'available-languages-list',
    templateUrl: 'available-languages-list.component.html',
    styleUrls: ['available-languages-list.scss']
})

export class AvailableLanguagesListComponent implements OnChanges {
    @Input() available: string[];
    @Input() current: string;

    private sortedLanguages: string[];

    ngOnChanges(changes: SimpleChanges): void {
        // Sort languages alphabetically but put the current language first.
        this.sortedLanguages = this.available.slice()
            .sort().reverse()
            .sort((a, b) => a === this.current ? -1 : 1);
    }
}