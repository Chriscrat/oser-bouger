import { Component, inject, OnInit } from "@angular/core";
import { Header } from "./layout/components/header/header";
import { Footer } from "./layout/components/footer/footer";
import { RouterOutlet } from "@angular/router";
import { ThemeToggle } from "./ui/theme-toggle/components/theme-toggle";

import { EventsStore } from "./features/events/services/events.store";
@Component({
    selector: "app-root",
    imports: [Header, Footer, RouterOutlet, ThemeToggle],
    templateUrl: "./app.html",
})
export class App implements OnInit {
    store = inject(EventsStore);
    ngOnInit(): void {
        void this.store.fetchCategoryList();
    }
}
