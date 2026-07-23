import { TestBed } from "@angular/core/testing";
import { vi } from "vitest";

import { ToastService } from "./toast.service";

describe("ToastService", () => {
    let service: ToastService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ToastService);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("should create", () => {
        expect(service).toBeTruthy();
    });

    describe("success()", () => {
        it("should add a toast with type success and the given message", () => {
            service.success("Opération réussie");

            const toasts = service.toasts();
            expect(toasts).toHaveLength(1);
            expect(toasts[0].type).toBe("success");
            expect(toasts[0].message).toBe("Opération réussie");
        });

        it("should assign the default icon checkbox-circle", () => {
            service.success("Test");

            expect(service.toasts()[0].icon).toBe("checkbox-circle");
        });

        it("should return the id of the created toast", () => {
            const id = service.success("Test");

            expect(typeof id).toBe("number");
        });
    });

    describe("error()", () => {
        it("should add a toast with type error and default icon error-warning", () => {
            service.error("Une erreur est survenue");

            const toast = service.toasts()[0];
            expect(toast.type).toBe("error");
            expect(toast.icon).toBe("error-warning");
        });
    });

    describe("warning()", () => {
        it("should add a toast with type warning and default icon alert", () => {
            service.warning("Attention");

            const toast = service.toasts()[0];
            expect(toast.type).toBe("warning");
            expect(toast.icon).toBe("alert");
        });
    });

    describe("info()", () => {
        it("should add a toast with type info and default icon information", () => {
            service.info("Pour votre information");

            const toast = service.toasts()[0];
            expect(toast.type).toBe("info");
            expect(toast.icon).toBe("information");
        });
    });

    describe("custom options", () => {
        it("should override the default icon when an icon option is provided", () => {
            service.success("Test", { icon: "information" });

            expect(service.toasts()[0].icon).toBe("information");
        });

        it("should apply a default duration of 5000ms when none is specified", () => {
            service.success("Test");

            expect(service.toasts()[0].duration).toBe(5000);
        });

        it("should apply a custom duration when provided", () => {
            service.success("Test", { duration: 3000 });

            expect(service.toasts()[0].duration).toBe(3000);
        });
    });

    describe("multiple toasts", () => {
        it("should accumulate multiple toasts", () => {
            service.success("Premier");
            service.error("Deuxième");
            service.info("Troisième");

            expect(service.toasts()).toHaveLength(3);
        });

        it("should assign a unique id to each toast", () => {
            service.success("A");
            service.error("B");

            const [first, second] = service.toasts();
            expect(first.id).not.toBe(second.id);
        });
    });

    describe("dismiss()", () => {
        it("should remove the toast with the given id", () => {
            const id = service.success("À supprimer");
            service.dismiss(id);

            expect(service.toasts()).toHaveLength(0);
        });

        it("should leave other toasts untouched", () => {
            const idKeep = service.success("Garder");
            const idRemove = service.error("Supprimer");

            service.dismiss(idRemove);

            const remaining = service.toasts();
            expect(remaining).toHaveLength(1);
            expect(remaining[0].id).toBe(idKeep);
        });

        it("should not throw when called with a non-existent id", () => {
            expect(() => service.dismiss(9999)).not.toThrow();
        });
    });

    describe("auto-dismiss", () => {
        it("should automatically remove the toast after the configured duration", () => {
            vi.useFakeTimers();

            service.success("Auto-dismiss", { duration: 3000 });
            expect(service.toasts()).toHaveLength(1);

            vi.advanceTimersByTime(3000);

            expect(service.toasts()).toHaveLength(0);
        });

        it("should not remove the toast before the duration has elapsed", () => {
            vi.useFakeTimers();

            service.success("Pas encore", { duration: 3000 });
            vi.advanceTimersByTime(2999);

            expect(service.toasts()).toHaveLength(1);
        });

        it("should cancel the auto-dismiss timer when dismiss() is called manually", () => {
            vi.useFakeTimers();

            const id = service.success("Manuel", { duration: 3000 });
            service.dismiss(id);

            vi.advanceTimersByTime(5000);

            expect(service.toasts()).toHaveLength(0);
        });

        it("should dismiss each toast independently at its own duration", () => {
            vi.useFakeTimers();

            service.success("Court", { duration: 1000 });
            service.error("Long", { duration: 5000 });

            vi.advanceTimersByTime(1000);
            expect(service.toasts()).toHaveLength(1);
            expect(service.toasts()[0].type).toBe("error");

            vi.advanceTimersByTime(4000);
            expect(service.toasts()).toHaveLength(0);
        });
    });
});
