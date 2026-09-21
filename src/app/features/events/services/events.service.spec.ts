import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { vi } from "vitest";

import { EventsService } from "./events.service";
import { provideHttpTesting } from "../../../../testing/http-stubs";
import { stubFetchJson } from "../../../../testing/fetch.stub";
import { environment } from "../../../environments/environment";
import { ActiveFacetsRecord, TagsModel } from "../models/event-filters";
import { EventListModel } from "../models/event";

describe("EventsService", () => {
    let service: EventsService;
    let httpMock: HttpTestingController;

    const emptyFilters: ActiveFacetsRecord = {};
    const emptyTags: TagsModel = { qfap_tags: [], price_type: [] };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpTesting()],
        });

        service = TestBed.inject(EventsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it("should create", () => {
        expect(service).toBeTruthy();
    });

    describe("getEvents()", () => {
        it("requests the catalog API with pagination params and no filter", () => {
            service.getEvents(emptyFilters, { limit: 20, offset: 0 }, emptyTags).subscribe();

            const req = httpMock.expectOne(request => request.url === environment.catalogApi);
            expect(req.request.params.get("limit")).toBe("20");
            expect(req.request.params.get("offset")).toBe("0");
            expect(req.request.params.getAll("refine")).toBeNull();

            req.flush({ total_count: 0, results: [] });
        });

        it("serializes a single active filter as refine=filter:value", () => {
            const filters: ActiveFacetsRecord = { address_city: ["Paris"] };

            service.getEvents(filters, { limit: 20, offset: 0 }, emptyTags).subscribe();

            const req = httpMock.expectOne(() => true);
            expect(req.request.params.getAll("refine")).toEqual(["address_city:Paris"]);

            req.flush({ total_count: 1, results: [] });
        });

        it("removes the refine param when the same filter value appears twice", () => {
            const filters: ActiveFacetsRecord = { address_city: ["Paris", "Paris"] };

            service.getEvents(filters, { limit: 20, offset: 0 }, emptyTags).subscribe();

            const req = httpMock.expectOne(() => true);
            expect(req.request.params.getAll("refine")).toBeNull();

            req.flush({ total_count: 0, results: [] });
        });

        it("builds a where clause combining multiple active tags", () => {
            const tags: TagsModel = { qfap_tags: ["Sport"], price_type: ["Gratuit"] };

            service.getEvents(emptyFilters, { limit: 20, offset: 0 }, tags).subscribe();

            const req = httpMock.expectOne(() => true);
            expect(req.request.params.get("where")).toBe(
                "(qfap_tags like 'Sport') AND (price_type like 'Gratuit')"
            );

            req.flush({ total_count: 0, results: [] });
        });

        it("builds a where clause for a single active tag without a superfluous AND", () => {
            const tags: TagsModel = { qfap_tags: ["Sport"], price_type: [] };

            service.getEvents(emptyFilters, { limit: 20, offset: 0 }, tags).subscribe();

            const req = httpMock.expectOne(() => true);
            expect(req.request.params.get("where")).toBe("(qfap_tags like 'Sport')");

            req.flush({ total_count: 0, results: [] });
        });

        it("does not set a where clause when no tag is active", () => {
            service.getEvents(emptyFilters, { limit: 20, offset: 0 }, emptyTags).subscribe();

            const req = httpMock.expectOne(() => true);
            expect(req.request.params.has("where")).toBe(false);

            req.flush({ total_count: 0, results: [] });
        });

        it("resolves with the flushed response", () => {
            const payload: EventListModel = { total_count: 2, results: [] };
            let response: EventListModel | undefined;

            service
                .getEvents(emptyFilters, { limit: 20, offset: 0 }, emptyTags)
                .subscribe(res => (response = res));

            httpMock.expectOne(() => true).flush(payload);

            expect(response).toEqual(payload);
        });
    });

    describe("getEvent()", () => {
        it("requests a single event by id with the expected query params baked into the URL", () => {
            service.getEvent("abc123").subscribe();

            const req = httpMock.expectOne(request =>
                request.url.startsWith(environment.catalogApi)
            );
            expect(req.request.url).toBe(
                `${environment.catalogApi}?where=id%3Dabc123&timezone=Europe%2FParis&lang=fr`
            );

            req.flush({ total_count: 1, results: [] });
        });
    });

    describe("getCategoryList()", () => {
        it("requests the qfap_tags field grouped by itself", () => {
            service.getCategoryList().subscribe();

            const req = httpMock.expectOne(request =>
                request.url.startsWith(environment.catalogApi)
            );
            expect(req.request.url).toBe(
                `${environment.catalogApi}?select=qfap_tags&group_by=qfap_tags`
            );

            req.flush({ total_count: 0, results: [] });
        });
    });

    describe("getEventsMap()", () => {
        it("builds a map URL with a disjunctive facet for every filter and the map coordinates", () => {
            const url = service.getEventsMap({});

            expect(url.startsWith(environment.mapApi)).toBe(true);
            expect(url).toContain("disjunctive.address_name");
            expect(url).toContain("disjunctive.address_zipcode");
            expect(url).toContain("disjunctive.address_city");
            expect(url).toContain("disjunctive.price_type");
            expect(url).toContain("disjunctive.deaf");
            expect(url).toContain("disjunctive.blind");
            expect(url).toContain("disjunctive.pmr");
            expect(url).toContain("location=9%2C48.73355%2C2.45819");
        });

        it("appends active filters as additional query params", () => {
            const url = service.getEventsMap({ address_city: ["Paris"] });

            expect(url).toContain("refine.address_city=Paris");
        });
    });

    describe("getFacetsList()", () => {
        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it("requests the facets endpoint with disjunctive/facet/facetsort params for every filter", async () => {
            const fetchMock = stubFetchJson({
                facet_groups: [
                    { name: "address_city", facets: [] },
                    { name: "unrelated_group", facets: [] },
                ],
            });

            await service.getFacetsList();

            const calledUrl = fetchMock.mock.calls[0][0] as string;
            expect(calledUrl).toContain("dataset=que-faire-a-paris-");
            expect(calledUrl).toContain("disjunctive.address_name=true");
            expect(calledUrl).toContain("facet=address_name");
            expect(calledUrl).toContain("facetsort.address_name=alphanum");
        });

        it("keeps only the facet groups whose name is a known filter", async () => {
            stubFetchJson({
                facet_groups: [
                    { name: "address_city", facets: [{ name: "Paris", active: true, count: 3 }] },
                    { name: "unrelated_group", facets: [{ name: "x", active: true, count: 1 }] },
                ],
            });

            const facets = await service.getFacetsList();

            expect(Object.keys(facets)).toEqual(["address_city"]);
            expect(facets.address_city).toEqual([{ name: "Paris", active: true, count: 3 }]);
        });
    });

    describe("getFilters()", () => {
        it("returns the full list of supported filter names", () => {
            expect(service.getFilters()).toEqual([
                "address_name",
                "address_zipcode",
                "address_city",
                "price_type",
                "deaf",
                "blind",
                "pmr",
            ]);
        });
    });
});
