import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { vi } from "vitest";

import { App } from "./app";
import { provideHttpTesting } from "../testing/http-stubs";
import { activatedRouteStub, provideRouterTesting } from "../testing/router-stubs";

describe("App", () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [App],
            providers: [
                provideRouterTesting(),
                provideHttpTesting(),
                { provide: ActivatedRoute, useValue: activatedRouteStub({}) },
            ],
        }).compileComponents();
    });

    it("should create the app", () => {
        const fixture = TestBed.createComponent(App);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it("fetches the category list on init", () => {
        const fixture = TestBed.createComponent(App);
        const fetchCategoryListSpy = vi.spyOn(fixture.componentInstance.store, "fetchCategoryList");

        fixture.detectChanges();

        expect(fetchCategoryListSpy).toHaveBeenCalled();
    });
});
