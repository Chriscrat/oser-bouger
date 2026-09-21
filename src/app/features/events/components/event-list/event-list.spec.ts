import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { ActivatedRoute } from "@angular/router";
import { vi } from "vitest";

import { EventList } from "./event-list";
import { provideHttpTesting } from "../../../../../testing/http-stubs";
import { activatedRouteStub, provideRouterTesting } from "../../../../../testing/router-stubs";

describe("EventList", () => {
    let component: EventList;
    let fixture: ComponentFixture<EventList>;
    let httpMock: HttpTestingController;
    let routeStub: ReturnType<typeof activatedRouteStub>;

    beforeEach(async () => {
        routeStub = activatedRouteStub({});

        await TestBed.configureTestingModule({
            imports: [EventList],
            providers: [
                provideRouterTesting(),
                provideHttpTesting(),
                { provide: ActivatedRoute, useValue: routeStub },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EventList);
        component = fixture.componentInstance;
        httpMock = TestBed.inject(HttpTestingController);
        await fixture.whenStable();
    });

    afterEach(() => {
        httpMock
            .match(() => true)
            .forEach(req => {
                if (!req.cancelled) req.flush({ total_count: 0, results: [] });
            });
        httpMock.verify();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("toggles the current view and mounts the map on demand", () => {
        expect(component.currentView()).toBe("list");
        expect(component.mapMounted).toBe(false);

        component.toggleEventView("map");

        expect(component.currentView()).toBe("map");
        expect(component.mapMounted).toBe(true);
    });

    it("builds activeFilters from the URL query params, excluding page", async () => {
        routeStub.setQueryParams({ address_city: "Paris", page: "2" });
        await fixture.whenStable();

        const filters = component.activeFilters();

        expect(Object.keys(filters)).not.toContain("page");
        expect(filters.address_city).toEqual({
            name: component.store.FILTER_LIST.address_city.name,
            values: ["Paris"],
        });
    });

    it("delegates removeFilter to setFilters for a displayed filter", async () => {
        const setFiltersSpy = vi.spyOn(component.store, "setFilters").mockResolvedValue(undefined);

        await component.removeFilter("address_city", "Paris");

        expect(setFiltersSpy).toHaveBeenCalledWith("address_city", "Paris");
    });

    it("delegates removeFilter to filterByTag for a non-displayed tag category", async () => {
        const filterByTagSpy = vi
            .spyOn(component.store, "filterByTag")
            .mockResolvedValue(undefined);

        await component.removeFilter("qfap_tags", "Musique");

        expect(filterByTagSpy).toHaveBeenCalledWith("qfap_tags", "Musique");
    });

    it("shows the total record text only in map view", () => {
        expect(component.totalRecordText()).toBe("");

        component.toggleEventView("map");

        expect(component.totalRecordText()).toContain("évènement(s)");
    });
});
