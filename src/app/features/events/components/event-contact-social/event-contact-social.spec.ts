import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventContactSocial } from "./event-contact-social";
import { EventContact as EventContactModel } from "./models/event-contact-social";

describe("EventContactSocial", () => {
    let component: EventContactSocial;
    let fixture: ComponentFixture<EventContactSocial>;

    const contacts: EventContactModel = {
        url: null,
        mail: "contact@example.com",
        facebook: "https://facebook.com/example",
        vimeo: null,
        twitter: "https://twitter.com/example",
        organisation_name: null,
        url_text: null,
        tiktok: null,
        twitch: null,
        youtube: null,
        linkedin: null,
        whatsapp: null,
        instagram: null,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventContactSocial],
        }).compileComponents();

        fixture = TestBed.createComponent(EventContactSocial);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("contacts", contacts);
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("keeps only the social networks that have a value", () => {
        const links = component.socialLinks();

        expect(links).toHaveLength(2);
        expect(links.map(link => link.label)).toEqual(
            expect.arrayContaining(["Twitter X", "Facebook"])
        );
    });

    it("returns an empty list when no contacts are provided", () => {
        fixture.componentRef.setInput("contacts", null);

        expect(component.socialLinks()).toEqual([]);
    });

    it("builds a mailto link from the mail contact", () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        const mailLink = compiled.querySelector("a");

        expect(mailLink?.getAttribute("href")).toBe("mailto:contact@example.com");
    });
});
