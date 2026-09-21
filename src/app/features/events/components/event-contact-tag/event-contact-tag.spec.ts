import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventContactTag } from "./event-contact-tag";
import { EventContactTag as EventContactTagModel } from "./models/event-contact-tag";

describe("EventContactTag", () => {
    let component: EventContactTag;
    let fixture: ComponentFixture<EventContactTag>;

    const baseEvent: EventContactTagModel = {
        id: "1",
        title: "Concert",
        address: {
            name: "Salle Pleyel",
            street: "252 rue du Faubourg Saint-Honoré",
            zipcode: "75008",
            city: "Paris",
        },
        tags: null,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventContactTag],
        }).compileComponents();

        fixture = TestBed.createComponent(EventContactTag);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("event", baseEvent);
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("builds the complete address when every address field is present", () => {
        const address = component.completeAddress();

        expect(address).toContain("Salle Pleyel");
        expect(address).toContain("252 rue du Faubourg Saint-Honoré");
        expect(address).toContain("75008");
        expect(address).toContain("Paris");
    });

    it("returns null when the address is absent", () => {
        fixture.componentRef.setInput("event", { ...baseEvent, address: undefined });

        expect(component.completeAddress()).toBeNull();
    });

    it("returns null when an address field is missing", () => {
        fixture.componentRef.setInput("event", {
            ...baseEvent,
            address: { ...baseEvent.address, street: null },
        });

        expect(component.completeAddress()).toBeNull();
    });
});
