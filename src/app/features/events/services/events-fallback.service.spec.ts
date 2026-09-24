import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";

import { EventsFallbackService } from "./events-fallback.service";
import { provideHttpTesting } from "../../../../testing/http-stubs";
import { buildEvent } from "../../../../testing/event.factory";
import { environment } from "../../../environments/environment";
import { TagsModel } from "../models/event-filters";

describe("EventsFallbackService", () => {
    let service: EventsFallbackService;
    let httpMock: HttpTestingController;

    const emptyTags: TagsModel = { qfap_tags: [], price_type: [] };
    const dataset = [
        buildEvent({
            id: "1",
            address_city: "Paris",
            address_zipcode: "75019",
            price_type: "gratuit",
            qfap_tags: "Musique;Concert",
            pmr: 1,
        }),
        buildEvent({
            id: "2",
            address_city: "Paris",
            address_zipcode: "75011",
            price_type: "payant",
            qfap_tags: "Sport",
            pmr: 0,
        }),
        buildEvent({
            id: "3",
            address_city: "Montreuil",
            address_zipcode: "93100",
            price_type: "gratuit sous condition",
            qfap_tags: "Concert;Festival",
            pmr: null,
        }),
        buildEvent({
            id: "4",
            address_city: null,
            address_zipcode: null,
            price_type: "payant",
            qfap_tags: null,
            pmr: 1,
        }),
    ];

    function flushDataset(): void {
        httpMock
            .expectOne(environment.fallbackDataUrl)
            .flush({ total_count: dataset.length, results: dataset });
    }

    async function resolve<T>(request: Promise<T>): Promise<T> {
        flushDataset();
        return request;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpTesting()],
        });

        service = TestBed.inject(EventsFallbackService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    describe("getEvents()", () => {
        it("returns every event with the full total_count when nothing is filtered", async () => {
            const response = await resolve(
                firstValueFrom(service.getEvents({}, { limit: 20, offset: 0 }, emptyTags))
            );

            expect(response.total_count).toBe(4);
            expect(response.results?.map(event => event.id)).toEqual(["1", "2", "3", "4"]);
        });

        it("paginates with limit/offset while keeping the unpaginated total_count", async () => {
            const response = await resolve(
                firstValueFrom(service.getEvents({}, { limit: 2, offset: 2 }, emptyTags))
            );

            expect(response.total_count).toBe(4);
            expect(response.results?.map(event => event.id)).toEqual(["3", "4"]);
        });

        it("combines values of a same facet with OR", async () => {
            const response = await resolve(
                firstValueFrom(
                    service.getEvents(
                        { address_zipcode: ["75019", "93100"] },
                        { limit: 20, offset: 0 },
                        emptyTags
                    )
                )
            );

            expect(response.results?.map(event => event.id)).toEqual(["1", "3"]);
        });

        it("combines different facets with AND", async () => {
            const response = await resolve(
                firstValueFrom(
                    service.getEvents(
                        { address_city: ["Paris"], pmr: ["1"] },
                        { limit: 20, offset: 0 },
                        emptyTags
                    )
                )
            );

            expect(response.results?.map(event => event.id)).toEqual(["1"]);
        });

        it("ignores facets with an empty value list", async () => {
            const response = await resolve(
                firstValueFrom(
                    service.getEvents({ address_city: [] }, { limit: 20, offset: 0 }, emptyTags)
                )
            );

            expect(response.total_count).toBe(4);
        });

        it("matches qfap_tags case-insensitively inside multi-valued tags", async () => {
            const response = await resolve(
                firstValueFrom(
                    service.getEvents(
                        {},
                        { limit: 20, offset: 0 },
                        { qfap_tags: ["concert"], price_type: [] }
                    )
                )
            );

            expect(response.results?.map(event => event.id)).toEqual(["1", "3"]);
        });

        it("mimics ODSQL like: 'gratuit' also matches 'gratuit sous condition'", async () => {
            const response = await resolve(
                firstValueFrom(
                    service.getEvents(
                        {},
                        { limit: 20, offset: 0 },
                        { qfap_tags: [], price_type: ["Gratuit"] }
                    )
                )
            );

            expect(response.results?.map(event => event.id)).toEqual(["1", "3"]);
        });

        it("combines different tags with AND", async () => {
            const response = await resolve(
                firstValueFrom(
                    service.getEvents(
                        {},
                        { limit: 20, offset: 0 },
                        { qfap_tags: ["Concert"], price_type: ["gratuit sous condition"] }
                    )
                )
            );

            expect(response.results?.map(event => event.id)).toEqual(["3"]);
        });
    });

    describe("getEvent()", () => {
        it("returns the event matching the id", async () => {
            const response = await resolve(firstValueFrom(service.getEvent("2")));

            expect(response.total_count).toBe(1);
            expect(response.results?.[0].id).toBe("2");
        });

        it("returns an empty result for an unknown id", async () => {
            const response = await resolve(firstValueFrom(service.getEvent("unknown")));

            expect(response).toEqual({ total_count: 0, results: [] });
        });
    });

    describe("getCategoryList()", () => {
        it("returns one row per distinct non-null qfap_tags combination", async () => {
            const response = await resolve(firstValueFrom(service.getCategoryList()));

            expect(response.results).toEqual([
                { qfap_tags: "Musique;Concert" },
                { qfap_tags: "Sport" },
                { qfap_tags: "Concert;Festival" },
            ]);
        });
    });

    describe("getFacets()", () => {
        it("counts non-null values per filter, sorted alphanumerically", async () => {
            const facets = await resolve(
                firstValueFrom(service.getFacets(["address_city", "pmr", "price_type"]))
            );

            expect(facets.address_city).toEqual([
                { name: "Montreuil", active: true, count: 1 },
                { name: "Paris", active: true, count: 2 },
            ]);
            expect(facets.pmr).toEqual([
                { name: "0", active: true, count: 1 },
                { name: "1", active: true, count: 2 },
            ]);
            expect(facets.price_type?.map(facet => facet.name)).toEqual([
                "gratuit",
                "gratuit sous condition",
                "payant",
            ]);
        });
    });

    describe("dataset loading", () => {
        it("loads the static file only once across calls", async () => {
            const first = firstValueFrom(service.getEvent("1"));
            flushDataset();
            await first;

            const second = await firstValueFrom(service.getEvent("2"));

            expect(second.results?.[0].id).toBe("2");
            httpMock.expectNone(environment.fallbackDataUrl);
        });
    });
});
