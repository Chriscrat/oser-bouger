import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventContactSocial } from "./event-contact-social";

describe("EventContactSocial", () => {
    let component: EventContactSocial;
    let fixture: ComponentFixture<EventContactSocial>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventContactSocial],
        }).compileComponents();

        fixture = TestBed.createComponent(EventContactSocial);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
