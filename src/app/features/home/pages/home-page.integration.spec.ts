import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { vi } from "vitest";

import { routes } from "../../../app.routes";
import { provideHttpTesting } from "../../../../testing/http-stubs";
import { stubFetchJson } from "../../../../testing/fetch.stub";
import { buildEvent as buildMinimalEvent } from "../../../../testing/event.factory";
import { environment } from "../../../environments/environment";

describe("HomePage (integration)", () => {
    let httpMock: HttpTestingController;
    let router: Router;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideRouter(routes), provideHttpTesting()],
        });

        httpMock = TestBed.inject(HttpTestingController);
        router = TestBed.inject(Router);
    });

    afterEach(() => {
        httpMock.verify();
        vi.unstubAllGlobals();
    });

    it("renders the fetched events as cards", async () => {
        stubFetchJson({ facet_groups: [] });
        const harness = await RouterTestingHarness.create("/");

        const payload = {
            total_count: 1,
            results: [buildMinimalEvent({ title: "Concert plein air" })],
        };
        // EventsStore.goToPage() calls router.navigate() after fetching, which re-triggers
        // EventListCards' queryParamMap subscription and fires a second, duplicate fetch —
        // drain every matching request rather than assuming exactly one.
        await vi.waitFor(() => {
            const pending = httpMock.match(req => req.url === environment.catalogApi);
            if (pending.length === 0) {
                throw new Error("initial events request not fired yet");
            }
            pending.forEach(req => req.flush(payload));
        });
        await harness.fixture.whenStable();
        httpMock
            .match(req => req.url === environment.catalogApi)
            .forEach(req => req.flush(payload));

        expect(harness.routeNativeElement?.textContent).toContain("Concert plein air");
    });

    it("refetches events and updates the URL when a filter checkbox is toggled", async () => {
        stubFetchJson({
            facet_groups: [
                { name: "address_city", facets: [{ name: "Paris", active: true, count: 3 }] },
            ],
        });
        const harness = await RouterTestingHarness.create("/");

        await vi.waitFor(() => {
            const pending = httpMock.match(req => req.url === environment.catalogApi);
            if (pending.length === 0) {
                throw new Error("initial events request not fired yet");
            }
            pending.forEach(req => req.flush({ total_count: 0, results: [] }));
        });
        await harness.fixture.whenStable();
        httpMock
            .match(req => req.url === environment.catalogApi)
            .forEach(req => req.flush({ total_count: 0, results: [] }));

        const checkbox = await vi.waitFor(() => {
            const input =
                harness.routeNativeElement?.querySelector<HTMLInputElement>(
                    'input[type="checkbox"]'
                );
            if (!input) {
                throw new Error("filter checkbox not found yet");
            }
            return input;
        });
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("change"));

        // Toggling a filter through the real router can trigger a fetch both from
        // EventsStore.setFilters() and from EventListCards' queryParamMap subscription
        // reacting to the resulting navigation — drain every matching request, not just one.
        let sawFilteredRequest = false;
        await vi.waitFor(() => {
            httpMock
                .match(req => req.url === environment.catalogApi)
                .forEach(req => {
                    if (req.request.params.getAll("refine")?.includes("address_city:Paris")) {
                        sawFilteredRequest = true;
                    }
                    req.flush({ total_count: 0, results: [] });
                });
            if (!sawFilteredRequest) {
                throw new Error("filtered request not fired yet");
            }
        });
        await harness.fixture.whenStable();
        httpMock
            .match(req => req.url === environment.catalogApi)
            .forEach(req => req.flush({ total_count: 0, results: [] }));

        expect(router.url).toContain("address_city=Paris");
    });
});
