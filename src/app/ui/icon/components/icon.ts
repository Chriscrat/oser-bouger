import { Component, input, computed } from '@angular/core';
import { iconClass, iconStyle, iconSize } from '../models/icon';
import { buildIconClassSize  } from '../mappers/icon.mapper';

@Component({
    selector: 'app-icon',
    standalone: true,
    templateUrl: './icon.html',
})

export class Icon {
    prefix = 'fr-icon'
    icon = input.required<iconClass>();
    style = input<iconStyle>('line');
    size = input<iconSize>('md');
    sizeClass = computed(() => `${this.prefix}--${buildIconClassSize(this.size())}`);
    iconClass = computed(() => `${this.prefix}-${this.icon()}-${this.style()}`);
}