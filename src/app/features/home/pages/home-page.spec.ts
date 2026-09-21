import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { vi } from "vitest";

import { HomePage } from "./home-page";
import { provideHttpTesting } from "../../../../testing/http-stubs";
import { activatedRouteStub, provideRouterTesting } from "../../../../testing/router-stubs";
import { stubFetchJson } from "../../../../testing/fetch.stub";

describe("HomePage", () => {
    let component: HomePage;
    let fixture: ComponentFixture<HomePage>;

    beforeEach(async () => {
        stubFetchJson({ facet_groups: [] });

        await TestBed.configureTestingModule({
            imports: [HomePage],
            providers: [
                provideRouterTesting(),
                provideHttpTesting(),
                { provide: ActivatedRoute, useValue: activatedRouteStub({}) },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(HomePage);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("exposes the disclaimer alert content", () => {
        expect(component.alert.description).toContain("DSFR");
    });
});
