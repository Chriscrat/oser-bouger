import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventCover } from "./event-cover";

describe("EventCover", () => {
    let component: EventCover;
    let fixture: ComponentFixture<EventCover>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventCover],
        }).compileComponents();

        fixture = TestBed.createComponent(EventCover);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
