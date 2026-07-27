import { Component, input, inject, Input } from "@angular/core";
import { EventFilters, FilterName } from "../../../models/event-filters";
import { Checkbox } from "../../../../../ui/checkbox/components/checkbox";
import { EventsStore } from "../../../services/events.store";
@Component({
    selector: "app-event-filter",
    imports: [Checkbox],
    templateUrl: "./event-filter.html",
})
export class EventFilter {
    filter = input.required<EventFilters>();
    store = inject(EventsStore);
    @Input() onUpdate!: (filter: FilterName, value: string) => void;
}
