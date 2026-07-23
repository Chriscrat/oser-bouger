import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ToastInstance } from "../models/toast";
import { Toast } from "./toast";

const createMockToast = (overrides: Partial<ToastInstance> = {}): ToastInstance => ({
    id: 1,
    type: "success",
    message: "Opération réussie",
    icon: "checkbox-circle",
    duration: 5000,
    ...overrides,
});

describe("Toast", () => {
    let component: Toast;
    let fixture: ComponentFixture<Toast>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Toast],
        }).compileComponents();

        fixture = TestBed.createComponent(Toast);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("toast", createMockToast());
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("classType", () => {
        it("should return fr-toast--success for a success toast", () => {
            fixture.componentRef.setInput("toast", createMockToast({ type: "success" }));

            expect(component.classType()).toBe("fr-toast--success");
        });

        it("should return fr-toast--error for an error toast", () => {
            fixture.componentRef.setInput(
                "toast",
                createMockToast({ type: "error", icon: "error-warning" })
            );

            expect(component.classType()).toBe("fr-toast--error");
        });

        it("should return fr-toast--warning for a warning toast", () => {
            fixture.componentRef.setInput(
                "toast",
                createMockToast({ type: "warning", icon: "alert" })
            );

            expect(component.classType()).toBe("fr-toast--warning");
        });

        it("should return fr-toast--info for an info toast", () => {
            fixture.componentRef.setInput(
                "toast",
                createMockToast({ type: "info", icon: "information" })
            );

            expect(component.classType()).toBe("fr-toast--info");
        });
    });

    describe("close output", () => {
        it("should emit close when the close button is clicked", async () => {
            let closeEmitted = false;
            component.closed.subscribe(() => {
                closeEmitted = true;
            });

            const button: HTMLButtonElement | null = (
                fixture.nativeElement as HTMLElement
            ).querySelector(".fr-toast__close");
            button?.click();
            await fixture.whenStable();

            expect(closeEmitted).toBe(true);
        });
    });

    describe("template rendering", () => {
        it("should render the toast message", async () => {
            fixture.componentRef.setInput(
                "toast",
                createMockToast({ message: "Mon message de test" })
            );
            fixture.detectChanges();
            await fixture.whenStable();

            const content: HTMLElement | null = (
                fixture.nativeElement as HTMLElement
            ).querySelector(".fr-toast__content");
            expect(content?.textContent?.trim()).toBe("Mon message de test");
        });

        it("should render the icon container when an icon is present", async () => {
            fixture.componentRef.setInput("toast", createMockToast({ icon: "checkbox-circle" }));
            fixture.detectChanges();
            await fixture.whenStable();

            const iconContainer: HTMLElement | null = (
                fixture.nativeElement as HTMLElement
            ).querySelector(".fr-toast__prepend");
            expect(iconContainer).not.toBeNull();
        });

        it("should not render the icon container when icon is absent", async () => {
            fixture.componentRef.setInput("toast", createMockToast({ icon: undefined }));
            fixture.detectChanges();
            await fixture.whenStable();

            const iconContainer: HTMLElement | null = (
                fixture.nativeElement as HTMLElement
            ).querySelector(".fr-toast__prepend");
            expect(iconContainer).toBeNull();
        });
    });
});
