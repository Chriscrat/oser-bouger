import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EventListMap } from "./event-list-map";

describe("EventListMap", () => {
    let component: EventListMap;
    let fixture: ComponentFixture<EventListMap>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EventListMap],
        }).compileComponents();

        fixture = TestBed.createComponent(EventListMap);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
