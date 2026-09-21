import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { vi } from "vitest";

import { EventsStore } from "./events.store";
import { provideHttpTesting } from "../../../../testing/http-stubs";
import { activatedRouteStub, ActivatedRouteStub } from "../../../../testing/router-stubs";
import { buildEvent as buildMinimalEvent } from "../../../../testing/event.factory";
import { CategoryListModel, EventListModel } from "../models/event";

describe("EventsStore", () => {
    let store: EventsStore;
    let httpMock: HttpTestingController;
    let navigateSpy: ReturnType<typeof vi.fn>;
    let routeStub: ActivatedRouteStub;

    async function flushPendingEvents(payload: EventListModel = { total_count: 0, results: [] }) {
        const req = await vi.waitFor(() => httpMock.expectOne(() => true));
        req.flush(payload);
    }

    beforeEach(() => {
        navigateSpy = vi.fn().mockResolvedValue(true);
        routeStub = activatedRouteStub({});

        TestBed.configureTestingModule({
            providers: [
                provideHttpTesting(),
                { provide: Router, useValue: { navigate: navigateSpy } },
                { provide: ActivatedRoute, useValue: routeStub },
            ],
        });

        store = TestBed.inject(EventsStore);
        httpMock = TestBed.inject(HttpTestingController);
        TestBed.tick();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create", () => {
        expect(store).toBeTruthy();
    });

    describe("setFilters()", () => {
        it("adds the given filter value, navigates and refetches page 1", async () => {
            const promise = store.setFilters("address_city", "Paris");
            await flushPendingEvents({ total_count: 1, results: [] });
            await promise;

            expect(store.filters.address_city).toEqual(["Paris"]);
            expect(navigateSpy).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ replaceUrl: true })
            );
        });

        it("removes the filter value when it is already active (toggle)", async () => {
            store.filters.address_city = ["Paris"];

            const promise = store.setFilters("address_city", "Paris");
            await flushPendingEvents();
            await promise;

            expect(store.filters.address_city).toEqual([]);
        });
    });

    describe("goToPage()", () => {
        it("does nothing when the requested page is below 1", async () => {
            await store.goToPage(0);

            expect(navigateSpy).not.toHaveBeenCalled();
            expect(store.listLoading()).toBe(false);
        });

        it("loads events and updates total/events on success", async () => {
            const promise = store.goToPage(2);
            await flushPendingEvents({ total_count: 45, results: [buildMinimalEvent()] });
            await promise;

            expect(store.events()).toHaveLength(1);
            expect(store.total()).toBe(45);
            expect(store.listLoading()).toBe(false);
            expect(store.listError()).toBeNull();
            expect(navigateSpy).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { page: 2 }, queryParamsHandling: "merge" })
            );
        });

        it("sets listError and stops loading when the HTTP request fails", async () => {
            const promise = store.goToPage(1);
            const req = await vi.waitFor(() => httpMock.expectOne(() => true));
            req.flush("Server error", { status: 500, statusText: "Internal Server Error" });
            await promise;

            expect(store.listLoading()).toBe(false);
            expect(store.listError()).toContain("Erreur de chargement");
        });
    });

    describe("resetFilters()", () => {
        it("resets every filter to an empty array and refetches page 1", async () => {
            store.filters.address_city = ["Paris"];
            store.filters.pmr = ["1"];

            const promise = store.resetFilters();
            await flushPendingEvents();
            await promise;

            expect(Object.values(store.filters).every(value => value.length === 0)).toBe(true);
            expect(navigateSpy).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParamsHandling: "" })
            );
        });
    });

    describe("fetchCategoryList() / categoryList", () => {
        it("counts each tag, trims whitespace and sorts by descending count", () => {
            const payload: CategoryListModel = {
                total_count: 2,
                results: [{ qfap_tags: "Musique; Sport ;Musique" }, { qfap_tags: "Sport" }],
            };

            store.fetchCategoryList();
            httpMock.expectOne(() => true).flush(payload);

            expect(store.categoryList()).toEqual([
                { name: "Musique", count: 2 },
                { name: "Sport", count: 2 },
            ]);
        });

        it("ignores empty tag segments", () => {
            const payload: CategoryListModel = {
                total_count: 1,
                results: [{ qfap_tags: ";;Sport;" }],
            };

            store.fetchCategoryList();
            httpMock.expectOne(() => true).flush(payload);

            expect(store.categoryList()).toEqual([{ name: "Sport", count: 1 }]);
        });

        it("ignores the response when results is null", () => {
            store.fetchCategoryList();
            httpMock.expectOne(() => true).flush({ total_count: 0, results: null });

            expect(store.categoryList()).toEqual([]);
        });
    });

    describe("filterByTag()", () => {
        it("activates a tag value and refetches page 1", async () => {
            const promise = store.filterByTag("qfap_tags", "Sport");
            await flushPendingEvents();
            await promise;

            expect(store.currentTags().qfap_tags).toEqual(["Sport"]);
        });

        it("deactivates the tag value when it is already active (toggle)", async () => {
            const first = store.filterByTag("qfap_tags", "Sport");
            await flushPendingEvents();
            await first;

            const promise = store.filterByTag("qfap_tags", "Sport");
            await flushPendingEvents();
            await promise;

            expect(store.currentTags().qfap_tags).toEqual([]);
        });
    });

    describe("getEventsMapUrl()", () => {
        it("returns a non-empty map URL built from the current filters", () => {
            const url = store.getEventsMapUrl();

            expect(typeof url).toBe("string");
            expect(url.length).toBeGreaterThan(0);
        });
    });

    describe("fetchEvent()", () => {
        it("sets currentEvent from the first result", () => {
            const payload: EventListModel = {
                total_count: 1,
                results: [buildMinimalEvent({ id: "abc123" })],
            };

            store.fetchEvent("abc123");
            httpMock.expectOne(() => true).flush(payload);

            expect(store.currentEvent()?.id).toBe("abc123");
        });

        it("sets currentEvent to null when there is no result", () => {
            store.fetchEvent("missing");
            httpMock.expectOne(() => true).flush({ total_count: 0, results: [] });

            expect(store.currentEvent()).toBeNull();
        });

        it("logs the error and leaves currentEvent unset when the request fails", () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

            store.fetchEvent("abc123");
            httpMock
                .expectOne(() => true)
                .flush("error", { status: 500, statusText: "Server Error" });

            expect(consoleErrorSpy).toHaveBeenCalled();
            expect(store.currentEvent()).toBeNull();

            consoleErrorSpy.mockRestore();
        });
    });

    describe("query params resynchronization", () => {
        it("resyncs filters, currentPage and currentTags when the route query params change", () => {
            routeStub.setQueryParams({ address_city: "Paris", page: "3", qfap_tags: "Sport" });
            TestBed.tick();

            expect(store.filters.address_city).toEqual(["Paris"]);
            expect(store.currentPage()).toBe(3);
            expect(store.currentTags().qfap_tags).toEqual(["Sport"]);
        });
    });
});
