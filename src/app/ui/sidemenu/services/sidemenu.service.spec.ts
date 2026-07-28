import { TestBed } from "@angular/core/testing";

import { SidemenuService } from "./sidemenu.service";

describe("SidemenuService", () => {
    let service: SidemenuService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SidemenuService);
    });

    it("should create", () => {
        expect(service).toBeTruthy();
    });

    it("should be closed by default", () => {
        expect(service.isOpen()).toBe(false);
    });

    describe("open()", () => {
        it("should set isOpen to true", () => {
            service.open();

            expect(service.isOpen()).toBe(true);
        });
    });

    describe("close()", () => {
        it("should set isOpen to false", () => {
            service.open();
            service.close();

            expect(service.isOpen()).toBe(false);
        });

        it("should return focus to the element that triggered open()", () => {
            const trigger = document.createElement("button");
            document.body.appendChild(trigger);
            trigger.focus();

            service.open();
            service.close();

            expect(document.activeElement).toBe(trigger);

            trigger.remove();
        });
    });

    describe("toggle()", () => {
        it("should open when closed", () => {
            service.toggle();

            expect(service.isOpen()).toBe(true);
        });

        it("should close when open", () => {
            service.open();
            service.toggle();

            expect(service.isOpen()).toBe(false);
        });
    });
});
