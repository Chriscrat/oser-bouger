import { ComponentFixture, TestBed } from "@angular/core/testing";
import { vi } from "vitest";
import { ButtonGroup } from "./button-group";
import { ButtonGroupModel } from "../models/button-group";

describe("ButtonGroup", () => {
    let component: ButtonGroup;
    let fixture: ComponentFixture<ButtonGroup>;
    let clickAction: (value: string) => void;

    const buildButtonGroup = (): ButtonGroupModel => ({
        title: "Affichage",
        clickAction,
        buttons: [
            { text: "Liste", value: "list", checked: true },
            { text: "Carte", value: "map" },
        ],
    });

    beforeEach(async () => {
        clickAction = vi.fn<(value: string) => void>();

        await TestBed.configureTestingModule({
            imports: [ButtonGroup],
        }).compileComponents();

        fixture = TestBed.createComponent(ButtonGroup);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("buttonGroup", buildButtonGroup());
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("renders the legend and one radio input per button", () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector("legend")?.textContent).toContain("Affichage");
        expect(compiled.querySelectorAll('input[type="radio"]').length).toBe(2);
    });

    it("does not render a legend when no title is provided", () => {
        fixture.componentRef.setInput("buttonGroup", { ...buildButtonGroup(), title: null });
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;

        expect(compiled.querySelector("legend")).toBeNull();
    });

    it("calls clickAction with the button value when a radio is clicked", () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        const secondRadio = compiled.querySelectorAll('input[type="radio"]')[1] as HTMLElement;

        secondRadio.click();

        expect(clickAction).toHaveBeenCalledWith("map");
    });
});
