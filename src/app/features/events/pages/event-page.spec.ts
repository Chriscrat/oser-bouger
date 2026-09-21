import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";

import { EventPage } from "./event-page";
import { provideHttpTesting } from "../../../../testing/http-stubs";
import { activatedRouteStub, provideRouterTesting } from "../../../../testing/router-stubs";

describe("EventPage", () => {
    let component: EventPage;
    let fixture: ComponentFixture<EventPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventPage],
            providers: [
                provideRouterTesting(),
                provideHttpTesting(),
                { provide: ActivatedRoute, useValue: activatedRouteStub({}) },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EventPage);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("shows the no-event-found alert when no event is loaded", () => {
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain("Aucun évènement trouvé");
    });
});
