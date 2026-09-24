import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer } from "@angular/platform-browser";
import { SecurityContext } from "@angular/core";
import { HttpTestingController } from "@angular/common/http/testing";
import { vi } from "vitest";

import { EventListMap } from "./event-list-map";
import { EventsStore } from "../../services/events.store";
import { EventsService } from "../../services/events.service";
import { environment } from "../../../../environments/environment";
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

    it("renders the map iframe when the API is available", () => {
        const element = fixture.nativeElement as HTMLElement;

        expect(element.querySelector("iframe")).not.toBeNull();
        expect(element.querySelector(".fr-alert")).toBeNull();
    });

    it("replaces the iframe with an info alert in fallback mode", async () => {
        const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
        const httpMock = TestBed.inject(HttpTestingController);

        TestBed.inject(EventsService).getCategoryList().subscribe();
        httpMock
            .expectOne(request => request.url.startsWith(environment.catalogApi))
            .flush("error", { status: 503, statusText: "Service Unavailable" });
        httpMock.expectOne(environment.fallbackDataUrl).flush({ total_count: 0, results: [] });
        await fixture.whenStable();
        consoleWarnSpy.mockRestore();

        const element = fixture.nativeElement as HTMLElement;
        expect(element.querySelector("iframe")).toBeNull();
        expect(element.querySelector(".fr-alert--info")?.textContent).toContain(
            "Carte indisponible"
        );
    });
});
