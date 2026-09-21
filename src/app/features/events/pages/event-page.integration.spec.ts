import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { RouterTestingHarness } from "@angular/router/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import { routes } from "../../../app.routes";
import { provideHttpTesting } from "../../../../testing/http-stubs";
import { buildEvent as buildMinimalEvent } from "../../../../testing/event.factory";
import { environment } from "../../../environments/environment";

describe("EventPage (integration)", () => {
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
    });

    it("fetches the event by id from the route and renders its details", async () => {
        const harness = await RouterTestingHarness.create("/event/abc123");

        const req = httpMock.expectOne(
            req => req.url.startsWith(environment.catalogApi) && req.url.includes("id%3Dabc123")
        );
        req.flush({
            total_count: 1,
            results: [
                buildMinimalEvent({
                    title: "Concert plein air",
                    description: "Un bel évènement",
                    address_name: "Salle X",
                    address_street: "1 rue Test",
                    address_zipcode: "75001",
                    address_city: "Paris",
                }),
            ],
        });
        await harness.fixture.whenStable();

        const text = harness.routeNativeElement?.textContent ?? "";
        expect(text).toContain("Concert plein air");
        expect(text).toContain("Salle X");
    });

    it("shows the no-event-found alert when the event does not exist", async () => {
        const harness = await RouterTestingHarness.create("/event/unknown");

        const req = httpMock.expectOne(req => req.url.startsWith(environment.catalogApi));
        req.flush({ total_count: 0, results: [] });
        await harness.fixture.whenStable();

        expect(harness.routeNativeElement?.textContent).toContain("Aucun évènement trouvé");
    });

    it("navigates back to the home page when the back button is clicked", async () => {
        const harness = await RouterTestingHarness.create("/event/abc123");

        const req = httpMock.expectOne(req => req.url.startsWith(environment.catalogApi));
        req.flush({ total_count: 1, results: [buildMinimalEvent()] });
        await harness.fixture.whenStable();

        const backButton =
            harness.routeNativeElement?.querySelector<HTMLButtonElement>("button.fr-btn__back");
        expect(backButton).not.toBeNull();
        backButton?.click();
        await harness.fixture.whenStable();

        // Navigating back mounts HomePage for real, which triggers its own
        // initial events fetch — drain it so it doesn't leak into the next test.
        httpMock
            .match(req => req.url === environment.catalogApi)
            .forEach(req => req.flush({ total_count: 0, results: [] }));

        expect(router.url).toBe("/?page=1");
    });
});
