import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { ActivatedRoute } from "@angular/router";
import { vi } from "vitest";

import { EventFilters } from "./event-filters";
import { EventsStore } from "../../../services/events.store";
import { provideHttpTesting } from "../../../../../../testing/http-stubs";
import { activatedRouteStub, provideRouterTesting } from "../../../../../../testing/router-stubs";
import { stubFetchJson } from "../../../../../../testing/fetch.stub";

describe("EventFilters", () => {
    let component: EventFilters;
    let fixture: ComponentFixture<EventFilters>;
    let store: EventsStore;
    let httpMock: HttpTestingController;
    let routeStub: ReturnType<typeof activatedRouteStub>;
    let fetchMock: ReturnType<typeof stubFetchJson>;

    beforeEach(async () => {
        routeStub = activatedRouteStub({});
        fetchMock = stubFetchJson({
            facet_groups: [
                { name: "address_city", facets: [{ name: "Paris", active: true, count: 3 }] },
                { name: "price_type", facets: [{ name: "gratuit", active: true, count: 5 }] },
            ],
        });

        await TestBed.configureTestingModule({
            imports: [EventFilters],
            providers: [
                provideRouterTesting(),
                provideHttpTesting(),
                { provide: ActivatedRoute, useValue: routeStub },
            ],
        }).compileComponents();

        store = TestBed.inject(EventsStore);
        httpMock = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(EventFilters);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("calls store.getFacets on init", () => {
        expect(fetchMock).toHaveBeenCalled();
    });

    it("only keeps filters marked as displayed", async () => {
        await store.getFacets();

        const names = component.filters().map(filter => filter.name);

        expect(names).toContain("address_city");
        expect(names).not.toContain("price_type");
    });

    it("truncates the category list to 15 entries", () => {
        store.fetchCategoryList();
        const request = httpMock.expectOne(() => true);
        request.flush({
            total_count: 20,
            results: Array.from({ length: 20 }, (_, i) => ({ qfap_tags: `cat-${i}` })),
        });

        expect(component.categories()).toHaveLength(15);
    });

    it("delegates updateFilter to store.setFilters when a filter name is provided", async () => {
        const setFiltersSpy = vi.spyOn(store, "setFilters").mockResolvedValue(undefined);

        await component.updateFilter("address_city", "Paris");

        expect(setFiltersSpy).toHaveBeenCalledWith("address_city", "Paris");
    });

    it("does nothing in updateFilter when no filter name is provided", async () => {
        const setFiltersSpy = vi.spyOn(store, "setFilters").mockResolvedValue(undefined);

        await component.updateFilter(undefined, "Paris");

        expect(setFiltersSpy).not.toHaveBeenCalled();
    });

    it("delegates filterByTag to the store", () => {
        const filterByTagSpy = vi.spyOn(store, "filterByTag").mockResolvedValue(undefined);

        component.filterByTag("qfap_tags", "Musique");

        expect(filterByTagSpy).toHaveBeenCalledWith("qfap_tags", "Musique");
    });

    it("delegates resetFilters to the store", () => {
        const resetFiltersSpy = vi.spyOn(store, "resetFilters").mockResolvedValue(undefined);

        component.resetFilters();

        expect(resetFiltersSpy).toHaveBeenCalled();
    });

    it("checks whether a category value is present in the URL", () => {
        routeStub.setQueryParams({ qfap_tags: "Musique" });

        expect(component.isChecked("qfap_tags", "Musique")).toBe(true);
        expect(component.isChecked("qfap_tags", "Sport")).toBe(false);
    });
});
