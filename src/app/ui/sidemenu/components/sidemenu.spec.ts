import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Sidemenu } from "./sidemenu";
import { SidemenuService } from "../services/sidemenu.service";

describe("Sidemenu", () => {
    let component: Sidemenu;
    let fixture: ComponentFixture<Sidemenu>;
    let sidemenuService: SidemenuService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Sidemenu],
        }).compileComponents();

        fixture = TestBed.createComponent(Sidemenu);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("filters", []);
        sidemenuService = TestBed.inject(SidemenuService);
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("should reflect the service's isOpen state", () => {
        expect(component.isOpen()).toBe(false);

        sidemenuService.open();

        expect(component.isOpen()).toBe(true);
    });

    it("should close the sidebar via the service on close()", () => {
        sidemenuService.open();

        component.close();

        expect(sidemenuService.isOpen()).toBe(false);
    });

    it("should close on Escape only when open", () => {
        component.onEscape();
        expect(sidemenuService.isOpen()).toBe(false);

        sidemenuService.open();
        component.onEscape();

        expect(sidemenuService.isOpen()).toBe(false);
    });
});
