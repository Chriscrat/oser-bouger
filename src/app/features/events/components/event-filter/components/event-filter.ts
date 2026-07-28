import { Component, input } from "@angular/core";
import { EventFilters2 } from "../../../models/event-filters";
import { Checkbox } from "../../../../../ui/checkbox/components/checkbox";

@Component({
    selector: "app-event-filter",
    imports: [Checkbox],
    templateUrl: "./event-filter.html",
})
export class EventFilter {
    filter = input.required<EventFilters2>();
}
