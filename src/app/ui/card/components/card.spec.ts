import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Card } from "./card";

describe("Card", () => {
    let component: Card;
    let fixture: ComponentFixture<Card>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Card],
        }).compileComponents();

        fixture = TestBed.createComponent(Card);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("defaults to the vertical orientation class when no orientation is provided", () => {
        expect(component.orientationTypeClass()).toBe("fr-card--vertical");
    });

    it("reflects a custom orientation input", () => {
        fixture.componentRef.setInput("orientation", "horizontal");
        expect(component.orientationTypeClass()).toBe("fr-card--horizontal");
    });
});
