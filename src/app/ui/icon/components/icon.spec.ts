import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Icon } from "./icon";

describe("Icon", () => {
    let component: Icon;
    let fixture: ComponentFixture<Icon>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Icon],
        }).compileComponents();

        fixture = TestBed.createComponent(Icon);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("icon", "mail");
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("builds the icon class from the icon and style inputs", () => {
        expect(component.iconClass()).toBe("fr-icon-mail-line");
    });

    it("reflects a custom style input", () => {
        fixture.componentRef.setInput("style", "fill");
        expect(component.iconClass()).toBe("fr-icon-mail-fill");
    });

    it.each([
        ["xs", "fr-icon--sm"],
        ["md", "fr-icon--md"],
        ["lg", "fr-icon--lg"],
    ] as const)("maps size %s to class %s", (size, expected) => {
        fixture.componentRef.setInput("size", size);
        expect(component.sizeClass()).toBe(expected);
    });

    it("defaults to size md and style line", () => {
        expect(component.sizeClass()).toBe("fr-icon--md");
        expect(component.iconClass()).toBe("fr-icon-mail-line");
    });
});
