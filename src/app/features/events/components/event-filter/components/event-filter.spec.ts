import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";

import { EventFilter } from "./event-filter";
import { EventFilters } from "../../../models/event-filters";
import { provideHttpTesting } from "../../../../../../testing/http-stubs";
import { activatedRouteStub, provideRouterTesting } from "../../../../../../testing/router-stubs";

describe("EventFilter", () => {
    let component: EventFilter;
    let fixture: ComponentFixture<EventFilter>;
    let routeStub: ReturnType<typeof activatedRouteStub>;

    const filter: EventFilters = {
        name: "address_city",
        label: "Ville",
        filters: [{ name: "Paris", active: true, count: 3 }],
        displayed: true,
    };

    beforeEach(async () => {
        routeStub = activatedRouteStub({});

        await TestBed.configureTestingModule({
            imports: [EventFilter],
            providers: [
                provideRouterTesting(),
                provideHttpTesting(),
                { provide: ActivatedRoute, useValue: routeStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EventFilter);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("filter", filter);
        component.onUpdate = () => {};
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it.each([
        ["0", "Non"],
        ["1", "Oui"],
        ["Paris", "Paris"],
    ])("translates %s to %s", (value, expected) => {
        expect(component.translateValue(value)).toBe(expected);
    });

    it("detects a scalar value present in the URL query params", () => {
        routeStub.setQueryParams({ address_city: "Paris" });

        expect(component.isExistInUrl("address_city", "Paris")).toBe(true);
        expect(component.isExistInUrl("address_city", "Lyon")).toBe(false);
    });

    it("detects a value present in an array query param", () => {
        routeStub.setQueryParams({ address_city: ["Paris", "Lyon"] });

        expect(component.isExistInUrl("address_city", "Lyon")).toBe(true);
        expect(component.isExistInUrl("address_city", "Marseille")).toBe(false);
    });

    it("returns false when the filter is absent from the URL", () => {
        expect(component.isExistInUrl("address_city", "Paris")).toBe(false);
    });
});
