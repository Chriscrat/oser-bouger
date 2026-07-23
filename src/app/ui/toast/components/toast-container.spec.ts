import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal, WritableSignal } from "@angular/core";
import { vi } from "vitest";

import { ToastInstance } from "../models/toast";
import { ToastService } from "../services/toast.service";
import { ToastContainer } from "./toast-container";

const createMockToast = (overrides: Partial<ToastInstance> = {}): ToastInstance => ({
    id: 1,
    type: "success",
    message: "Test",
    icon: "checkbox-circle",
    duration: 5000,
    ...overrides,
});

describe("ToastContainer", () => {
    let component: ToastContainer;
    let fixture: ComponentFixture<ToastContainer>;
    let mockToastsWritable: WritableSignal<ToastInstance[]>;
    let dismissMock: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        mockToastsWritable = signal<ToastInstance[]>([]);
        dismissMock = vi.fn();

        await TestBed.configureTestingModule({
            imports: [ToastContainer],
            providers: [
                {
                    provide: ToastService,
                    useValue: {
                        toasts: mockToastsWritable.asReadonly(),
                        dismiss: dismissMock,
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ToastContainer);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("toasts", () => {
        it("should expose the service toasts signal", () => {
            const toast = createMockToast();
            mockToastsWritable.set([toast]);

            expect(component.toasts()).toHaveLength(1);
            expect(component.toasts()[0]).toEqual(toast);
        });

        it("should reflect an empty list when there are no toasts", () => {
            expect(component.toasts()).toHaveLength(0);
        });
    });

    describe("ariaLive", () => {
        it("should return polite when the toast list is empty", () => {
            expect(component.ariaLive()).toBe("polite");
        });

        it("should return polite when no toast has type error", () => {
            mockToastsWritable.set([
                createMockToast({ type: "success" }),
                createMockToast({ id: 2, type: "info", icon: "information" }),
            ]);

            expect(component.ariaLive()).toBe("polite");
        });

        it("should return assertive when at least one toast has type error", () => {
            mockToastsWritable.set([
                createMockToast({ type: "success" }),
                createMockToast({ id: 2, type: "error", icon: "error-warning" }),
            ]);

            expect(component.ariaLive()).toBe("assertive");
        });

        it("should switch back to polite once the error toast is removed", () => {
            mockToastsWritable.set([createMockToast({ type: "error", icon: "error-warning" })]);
            expect(component.ariaLive()).toBe("assertive");

            mockToastsWritable.set([]);
            expect(component.ariaLive()).toBe("polite");
        });
    });

    describe("dismiss()", () => {
        it("should delegate to the toast service with the given id", () => {
            component.dismiss(42);

            expect(dismissMock).toHaveBeenCalledWith(42);
            expect(dismissMock).toHaveBeenCalledTimes(1);
        });

        it("should pass the correct id for each dismiss call", () => {
            component.dismiss(1);
            component.dismiss(2);

            expect(dismissMock).toHaveBeenNthCalledWith(1, 1);
            expect(dismissMock).toHaveBeenNthCalledWith(2, 2);
        });
    });
});
