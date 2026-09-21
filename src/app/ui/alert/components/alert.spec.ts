import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Alert } from "./alert";
import { AlertModel, alertTypes } from "../models/alert";

describe("Alert", () => {
    let component: Alert;
    let fixture: ComponentFixture<Alert>;

    const alert: AlertModel = { title: "Titre", description: "Description" };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Alert],
        }).compileComponents();

        fixture = TestBed.createComponent(Alert);
        component = fixture.componentInstance;
        fixture.componentRef.setInput("alert", alert);
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    it.each(["success", "error", "info", "warning"] as alertTypes[])(
        "builds the fr-alert--%s class from the type input",
        type => {
            fixture.componentRef.setInput("type", type);
            expect(component.classType()).toBe(`fr-alert--${type}`);
        }
    );

    it("builds an undefined-suffixed class when type is not provided", () => {
        expect(component.classType()).toBe("fr-alert--undefined");
    });
});
