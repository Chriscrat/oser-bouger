import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventCover } from "./event-cover";
import { FormatedEvent } from "../../models/event";

describe("EventCover", () => {
    let component: EventCover;
    let fixture: ComponentFixture<EventCover>;

    const baseEvent: FormatedEvent = {
        id: "1",
        title: "Concert",
        description: "Un concert",
        url: "https://example.com",
        date_description: "Ce soir",
        date_start: "2026-01-01",
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventCover],
        }).compileComponents();

        fixture = TestBed.createComponent(EventCover);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("event", baseEvent);
        fixture.componentRef.setInput("titleId", "event-title-1");
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("falls back to empty strings when cover is absent", () => {
        expect(component.eventCover()).toEqual({
            id: "1",
            title: "Concert",
            date_description: "Ce soir",
            cover: { url: "", alt: "", credit: "" },
        });
    });

    it("falls back to empty strings for missing cover fields", () => {
        fixture.componentRef.setInput("event", {
            ...baseEvent,
            cover: { url: "https://img", alt: null, credit: null },
        });

        expect(component.eventCover().cover).toEqual({
            url: "https://img",
            alt: "",
            credit: "",
        });
    });

    it("reflects a fully provided cover", () => {
        fixture.componentRef.setInput("event", {
            ...baseEvent,
            cover: { url: "https://img", alt: "alt text", credit: "credit" },
        });

        expect(component.eventCover().cover).toEqual({
            url: "https://img",
            alt: "alt text",
            credit: "credit",
        });
    });
});
