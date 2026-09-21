import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventDetails } from "./event-details";
import { FormatedEvent } from "../../models/event";

describe("EventDetails", () => {
    let component: EventDetails;
    let fixture: ComponentFixture<EventDetails>;

    const event: FormatedEvent = {
        id: "1",
        title: "Concert",
        description: "Un concert exceptionnel",
        url: "https://example.com",
        date_description: "Ce soir",
        date_start: "2026-01-01",
        address: { name: "Salle Pleyel", street: "rue", zipcode: "75008", city: "Paris" },
        contacts: {
            url: null,
            mail: "contact@example.com",
            facebook: null,
            vimeo: null,
            twitter: null,
            organisation_name: null,
            url_text: null,
            tiktok: null,
            twitch: null,
            youtube: null,
            linkedin: null,
            whatsapp: null,
            instagram: null,
        },
        tags: {
            audience: "Tout public",
            accessibility: [],
            priceType: "Gratuit",
            priceDetail: null,
            category: "Musique",
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventDetails],
        }).compileComponents();

        fixture = TestBed.createComponent(EventDetails);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("event", event);
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("derives eventDescription from the event input", () => {
        expect(component.eventDescription()).toBe("Un concert exceptionnel");
    });

    it("derives eventTag with the same identity/address/tags as the event", () => {
        expect(component.eventTag()).toEqual({
            id: "1",
            title: "Concert",
            address: event.address,
            tags: event.tags,
        });
    });

    it("derives contacts from the event input", () => {
        expect(component.contacts()).toEqual(event.contacts);
    });

    it("stays consistent when the event input changes", () => {
        fixture.componentRef.setInput("event", { ...event, id: "2", title: "Autre évènement" });

        expect(component.eventTag().id).toBe("2");
        expect(component.eventTag().title).toBe("Autre évènement");
    });
});
