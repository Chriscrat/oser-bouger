import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonGroup } from './button-group';

describe('ButtonGroup', () => {
    let component: ButtonGroup;
    let fixture: ComponentFixture<ButtonGroup>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ButtonGroup],
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonGroup);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
