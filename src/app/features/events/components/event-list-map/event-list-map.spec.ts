import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { SecurityContext } from "@angular/core";

import { EventListMap } from "./event-list-map";
import { EventsStore } from "../../services/events.store";
import { provideHttpTesting } from "../../../../../testing/http-stubs";
import { activatedRouteStub, provideRouterTesting } from "../../../../../testing/router-stubs";

describe("EventListMap", () => {
    let component: EventListMap;
    let fixture: ComponentFixture<EventListMap>;
    let store: EventsStore;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventListMap],
            providers: [
                provideRouterTesting(),
                provideHttpTesting(),
                { provide: ActivatedRoute, useValue: activatedRouteStub({}) },
            ],
        }).compileComponents();

        store = TestBed.inject(EventsStore);
        fixture = TestBed.createComponent(EventListMap);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("reflects the store's mapUrl", () => {
        expect(component.mapUrl()).toBe(store.mapUrl);
    });

    it("returns a sanitized resource URL wrapping the store's mapUrl", () => {
        const sanitizer = TestBed.inject(DomSanitizer);

        const sanitized = sanitizer.sanitize(
            SecurityContext.RESOURCE_URL,
            component.trustedMapUrl()
        );

        expect(sanitized).toBe(store.mapUrl);
    });
});
