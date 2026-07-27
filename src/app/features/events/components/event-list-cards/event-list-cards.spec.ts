import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventListCards } from "./event-list-cards";

describe("EventListCards", () => {
    let component: EventListCards;
    let fixture: ComponentFixture<EventListCards>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventListCards],
        }).compileComponents();

        fixture = TestBed.createComponent(EventListCards);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
