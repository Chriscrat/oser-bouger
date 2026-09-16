import { Component, input, inject, Input } from "@angular/core";
import { EventFilters, FilterName } from "../../../models/event-filters";
import { Checkbox } from "../../../../../ui/checkbox/components/checkbox";
import { EventsStore } from "../../../services/events.store";
import { ActivatedRoute } from "@angular/router";
@Component({
    selector: "app-event-filter",
    imports: [Checkbox],
    templateUrl: "./event-filter.html",
})
export class EventFilter {
    filter = input.required<EventFilters>();
    store = inject(EventsStore);
    route = inject(ActivatedRoute);

    @Input() onUpdate!: (filter: FilterName, value: string) => void;

    translateValue(name: string): string {
        const labels: Record<string, string> = {
            "0": "Non",
            "1": "Oui",
        };

        return labels[name] ? labels[name] : name;
    }

    isExistInUrl(filter: string, value: string): boolean {
        const urlParameters = this.route.snapshot.queryParams;
        const parameter = urlParameters[filter] as string | string[] | undefined;
        return parameter?.includes(value) ?? false;
    }
}
