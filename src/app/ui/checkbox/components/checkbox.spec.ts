import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
    let component: Checkbox;
    let fixture: ComponentFixture<Checkbox>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Checkbox],
        }).compileComponents();

        fixture = TestBed.createComponent(Checkbox);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("title", "Accès PMR");
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("emits checkedChange with true when the checkbox becomes checked", () => {
        const emitted: boolean[] = [];
        component.checkedChange.subscribe(value => emitted.push(value));

        component.onChange({ target: { checked: true } } as unknown as Event);

        expect(emitted).toEqual([true]);
    });

    it("emits checkedChange with false when the checkbox becomes unchecked", () => {
        const emitted: boolean[] = [];
        component.checkedChange.subscribe(value => emitted.push(value));

        component.onChange({ target: { checked: false } } as unknown as Event);

        expect(emitted).toEqual([false]);
    });

    it("renders an input bound to the title as id/label", () => {
        const compiled = fixture.nativeElement as HTMLElement;
        const input = compiled.querySelector("input");
        const label = compiled.querySelector("label");

        expect(input?.id).toBe("Accès PMR");
        expect(label?.getAttribute("for")).toBe("Accès PMR");
    });
});
