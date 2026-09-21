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

    it("should create", () => {
        expect(store).toBeTruthy();
    });

    // goToPage/setFilters/resetFilters/filterByTag only write the URL now — they never
    // fetch directly. This is what fixes the double-fetch bug: EventListCards used to
    // react to its own store's navigate() calls and re-trigger goToPage() itself.
    describe("setFilters()", () => {
        afterEach(() => httpMock.verify());

        it("adds the given filter value and navigates with the page reset to 1", async () => {
            await store.setFilters("address_city", "Paris");

            expect(store.filters.address_city).toEqual(["Paris"]);
            expect(navigateSpy).toHaveBeenCalledWith(
                [],
                expect.objectContaining({
                    queryParams: { page: 1, address_city: ["Paris"] },
                    replaceUrl: true,
                })
            );
        });

        it("removes the filter value when it is already active (toggle)", async () => {
            store.filters.address_city = ["Paris"];

            await store.setFilters("address_city", "Paris");

            expect(store.filters.address_city).toEqual([]);
        });

        it("does not trigger a fetch by itself", async () => {
            await store.setFilters("address_city", "Paris");

            httpMock.expectNone(() => true);
        });
    });

    describe("goToPage()", () => {
        afterEach(() => httpMock.verify());

        it("does nothing when the requested page is below 1", async () => {
            await store.goToPage(0);

            expect(navigateSpy).not.toHaveBeenCalled();
        });

        it("navigates to the requested page, merging existing query params", async () => {
            await store.goToPage(2);

            expect(navigateSpy).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { page: 2 }, queryParamsHandling: "merge" })
            );
        });

        it("does not trigger a fetch by itself", async () => {
            await store.goToPage(2);

            httpMock.expectNone(() => true);
        });
    });

    describe("resetFilters()", () => {
        afterEach(() => httpMock.verify());

        it("resets every filter to an empty array and navigates to page 1", async () => {
            store.filters.address_city = ["Paris"];
            store.filters.pmr = ["1"];

            await store.resetFilters();

            expect(Object.values(store.filters).every(value => value.length === 0)).toBe(true);
            expect(navigateSpy).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { page: 1 }, queryParamsHandling: "" })
            );
        });
    });

    describe("filterByTag()", () => {
        afterEach(() => httpMock.verify());

        it("activates a tag value and navigates with the page reset to 1", async () => {
            await store.filterByTag("qfap_tags", "Sport");

            expect(store.currentTags().qfap_tags).toEqual(["Sport"]);
            expect(navigateSpy).toHaveBeenCalledWith(
                [],
                expect.objectContaining({ queryParams: { page: 1, qfap_tags: ["Sport"] } })
            );
        });

        it("deactivates the tag value when it is already active (toggle)", async () => {
            await store.filterByTag("qfap_tags", "Sport");
            await store.filterByTag("qfap_tags", "Sport");

            expect(store.currentTags().qfap_tags).toEqual([]);
        });
    });

    // The single place that actually fetches the event list: purely reactive to the
    // URL, started lazily via ensureListSync() (called once by EventListCards.ngOnInit).
    describe("ensureListSync()", () => {
        afterEach(() => httpMock.verify());

        it("fetches immediately using the current URL state", () => {
            store.ensureListSync();

            const req = httpMock.expectOne(() => true);
            req.flush({ total_count: 45, results: [buildMinimalEvent()] });

            expect(store.events()).toHaveLength(1);
            expect(store.total()).toBe(45);
            expect(store.listLoading()).toBe(false);
            expect(store.listError()).toBeNull();
        });

        it("is idempotent: calling it again does not start a second subscription", () => {
            store.ensureListSync();
            store.ensureListSync();

            httpMock.expectOne(() => true).flush({ total_count: 0, results: [] });
        });

        it("sets listError and stops loading when the HTTP request fails", () => {
            store.ensureListSync();

            httpMock
                .expectOne(() => true)
                .flush("Server error", { status: 500, statusText: "Internal Server Error" });

            expect(store.listLoading()).toBe(false);
            expect(store.listError()).toContain("Erreur de chargement");
        });

        it("refetches when the route's page query param changes", () => {
            store.ensureListSync();
            httpMock.expectOne(() => true).flush({ total_count: 0, results: [] });

            routeStub.setQueryParams({ page: "2" });
            TestBed.tick();

            httpMock.expectOne(() => true).flush({ total_count: 0, results: [] });
        });

        it("cancels a stale in-flight request when the query changes again before it resolves", () => {
            store.ensureListSync();

            routeStub.setQueryParams({ page: "2" });
            TestBed.tick();

            const requests = httpMock.match(() => true);
            expect(requests).toHaveLength(2);
            requests[requests.length - 1].flush({
                total_count: 1,
                results: [buildMinimalEvent({ title: "Latest page" })],
            });

            expect(store.events()).toHaveLength(1);
            expect(store.events()[0].title).toBe("Latest page");
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
