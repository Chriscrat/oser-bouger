import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventContactTag } from "./event-contact-tag";

describe("EventContactTag", () => {
    let component: EventContactTag;
    let fixture: ComponentFixture<EventContactTag>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventContactTag],
        }).compileComponents();

        fixture = TestBed.createComponent(EventContactTag);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
