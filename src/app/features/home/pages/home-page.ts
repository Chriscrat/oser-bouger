import { Component } from "@angular/core";
import { Alert } from "../../../ui/alert/components/alert";
import { Hero } from "../../home/components/hero/hero";
import { EventList } from "../../events/components/event-list/event-list";

@Component({
    selector: "app-home-page",
    standalone: true,
    imports: [Alert, Hero, EventList],
    templateUrl: "./home-page.html",
})
export class HomePage {
    alert = {
        title: "Ce service n'est pas un projet officiel",
        description:
            "Il a pour but d'implémenter le DSFR à des fins de test par un particulier et n'est aucunement associé aux équipes digitales des entités de l'État français.",
    };
}
