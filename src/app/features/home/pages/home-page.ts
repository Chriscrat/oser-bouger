import { Component } from "@angular/core";
import { Alert } from "../../../ui/alert/components/alert";
import { Hero } from "../../home/components/hero/hero";
import { EventList } from "../../events/components/event-list/event-list";
import { EventFilters2 } from "../../events/models/event-filters";
import { Sidemenu } from "../../../ui/sidemenu/components/sidemenu";
@Component({
    selector: "app-home-page",
    standalone: true,
    imports: [Alert, Hero, EventList, Sidemenu],
    templateUrl: "./home-page.html",
    styleUrl: "./home.scss",
})
export class HomePage {
    alert = {
        title: "Ce service n'est pas un projet officiel",
        description:
            "Il a pour but d'implémenter le DSFR à des fins de test par un particulier et n'est aucunement associé aux équipes digitales des entités de l'État français.",
    };

    filters: EventFilters2[] = [
        {
            name: "Test 1",
            filters: [
                {
                    text: "val1",
                    value: "val1",
                },
            ],
        },
        {
            name: "Test 2",
            filters: [
                {
                    text: "val1",
                    value: "val1",
                },
            ],
        },
        {
            name: "Test 3",
            filters: [
                {
                    text: "val1",
                    value: "val1",
                },
            ],
        },
    ];
}
