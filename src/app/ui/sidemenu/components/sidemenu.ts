import { Component, HostListener, inject, input } from "@angular/core";
import { EventFilters2 } from "../../../features/events/models/event-filters";
import { EventFilter } from "../../../features/events/components/event-filter/components/event-filter";
import { SidemenuService } from "../services/sidemenu.service";

@Component({
    selector: "app-sidemenu",
    templateUrl: "./sidemenu.html",
    imports: [EventFilter],
    styleUrl: "./sidemenu.scss",
})
export class Sidemenu {
    filters = input.required<EventFilters2[]>();

    private sidemenuService = inject(SidemenuService);
    isOpen = this.sidemenuService.isOpen;

    close(): void {
        this.sidemenuService.close();
    }

    @HostListener("document:keydown.escape")
    onEscape(): void {
        if (this.isOpen()) {
            this.close();
        }
    }
}
