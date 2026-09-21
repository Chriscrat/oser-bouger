import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";
import { ActivatedRoute } from "@angular/router";
import { vi } from "vitest";

import { EventListCards } from "./event-list-cards";
import { EventsStore } from "../../services/events.store";
import { EventListModel } from "../../models/event";
import { provideHttpTesting } from "../../../../../testing/http-stubs";
import { activatedRouteStub, provideRouterTesting } from "../../../../../testing/router-stubs";
import { buildEvent } from "../../../../../testing/event.factory";

describe("EventListCards", () => {
    let component: EventListCards;
    let fixture: ComponentFixture<EventListCards>;
    let httpMock: HttpTestingController;
    let store: EventsStore;
    let goToPageSpy: ReturnType<typeof vi.spyOn>;
    let routeStub: ReturnType<typeof activatedRouteStub>;

    beforeEach(async () => {
        routeStub = activatedRouteStub({});

        await TestBed.configureTestingModule({
            imports: [EventListCards],
            providers: [
                provideRouterTesting(),
                provideHttpTesting(),
                { provide: ActivatedRoute, useValue: routeStub },
            ],
        }).compileComponents();

        store = TestBed.inject(EventsStore);
        httpMock = TestBed.inject(HttpTestingController);
        goToPageSpy = vi.spyOn(store, "goToPage");

        fixture = TestBed.createComponent(EventListCards);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        httpMock.match(() => true).forEach(req => req.flush({ total_count: 0, results: [] }));
        httpMock.verify();
    });

    it("should create", async () => {
        await fixture.whenStable();
        expect(component).toBeTruthy();
    });

    it("defaults to page 1 when no page query param is present", async () => {
        await fixture.whenStable();
        expect(goToPageSpy).toHaveBeenCalledWith(1);
    });

    it("reads the page number from the URL query params", async () => {
        routeStub.setQueryParams({ page: "3" });
        await fixture.whenStable();
        expect(goToPageSpy).toHaveBeenCalledWith(3);
    });

    it("maps store events through mapEventToCardDetails", async () => {
        await fixture.whenStable();

        const request = httpMock.expectOne(() => true);
        request.flush({
            total_count: 1,
            results: [buildEvent({ title: "Concert exceptionnel" })],
        } satisfies EventListModel);

        expect(component.events()).toHaveLength(1);
        expect(component.events()[0].title).toBe("Concert exceptionnel");
        expect(component.events()[0].address?.city).toBe("Paris");
    });

    it("shows the no-event-found alert when the store has no events", async () => {
        await fixture.whenStable();
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain("Aucun évènement trouvé");
    });
});
