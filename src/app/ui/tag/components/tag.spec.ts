import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Tag } from "./tag";

describe("Tag", () => {
    let component: Tag;
    let fixture: ComponentFixture<Tag>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Tag],
        }).compileComponents();

        fixture = TestBed.createComponent(Tag);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it("defaults icon/color/size/iconHidden", () => {
        expect(component.icon()).toBe("mail");
        expect(component.color()).toBe("grey");
        expect(component.size()).toBe("lg");
        expect(component.iconHidden()).toBe(false);
    });

    it("maps the red color to its DSFR class", () => {
        fixture.componentRef.setInput("color", "red");
        expect(component.colorIcon()).toBe("fr-text-action-high--red-marianne");
    });

    it("maps the grey color to its DSFR class", () => {
        fixture.componentRef.setInput("color", "grey");
        expect(component.colorIcon()).toBe("fr-text-default--grey");
    });
});
