import { Component, signal } from "@angular/core";
import { Header } from "./layout/components/header/header";
import { Footer } from "./layout/components/footer/footer";
import { Hero } from "./features/home/components/hero/hero";
import { Alert } from "./ui/alert/components/alert";
import { EventList } from "./features/events/components/event-list/event-list";
@Component({
    selector: "app-root",
    imports: [EventList, Header, Footer, Hero, Alert],
    templateUrl: "./app.html",
    styleUrl: "./app.scss",
})
export class App {
    protected readonly title = signal("oser-bouger");
    alert = {
        title: "Ce service n'est pas un projet officiel",
        description:
            "Il a pour but d'implémenter le DSFR à des fins de test par un particulier et n'est aucunement associé aux équipes digitales des entités de l'État français.",
    };
}
