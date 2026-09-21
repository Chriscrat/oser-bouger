import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { vi } from "vitest";

import { EventFilters } from "./event-filters";
import { EventsStore } from "../../../services/events.store";
import { provideHttpTesting } from "../../../../../../testing/http-stubs";
import { stubFetchJson } from "../../../../../../testing/fetch.stub";
import { environment } from "../../../../../environments/environment";

describe("EventFilters (integration)", () => {
    let httpMock: HttpTestingController;
    let router: Router;
    let store: EventsStore;

    beforeEach(() => {
        stubFetchJson({ facet_groups: [] });

        TestBed.configureTestingModule({
            providers: [
                provideRouter([{ path: "", component: EventFilters }]),
                provideHttpTesting(),
            ],
        });

        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
        store = TestBed.inject(EventsStore);
    });

    afterEach(() => {
        httpMock.verify();
        vi.unstubAllGlobals();
    });

    it("fetches events with the tag where-clause and updates the URL when a category tag is clicked", async () => {
        const harness = await RouterTestingHarness.create("/");

        store.fetchCategoryList();
        httpMock
            .expectOne(req => req.url.startsWith(environment.catalogApi))
            .flush({ total_count: 1, results: [{ qfap_tags: "Sport" }] });
        await harness.fixture.whenStable();

        const tagButton = await vi.waitFor(() => {
            const button = Array.from(
                harness.routeNativeElement?.querySelectorAll<HTMLButtonElement>("button.fr-tag") ??
                    []
            ).find(el => el.textContent?.includes("Sport"));
            if (!button) {
                throw new Error("category tag button not found yet");
            }
            return button;
        });
        tagButton.click();

        let sawTagRequest = false;
        await vi.waitFor(() => {
            httpMock
                .match(req => req.url.startsWith(environment.catalogApi))
                .forEach(req => {
                    if (req.request.params.get("where") === "(qfap_tags like 'Sport')") {
                        sawTagRequest = true;
                    }
                    req.flush({ total_count: 0, results: [] });
                });
            if (!sawTagRequest) {
                throw new Error("tag-filtered request not fired yet");
            }
        });
        await harness.fixture.whenStable();
        httpMock
            .match(req => req.url.startsWith(environment.catalogApi))
            .forEach(req => req.flush({ total_count: 0, results: [] }));

        expect(sawTagRequest).toBe(true);
        expect(router.url).toContain("qfap_tags=Sport");
    });
});
