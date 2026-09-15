import { Routes } from "@angular/router";

import { HomePage } from "../app/features/home/pages/home-page";
import { EventPage } from "./features/events/pages/event-page";

export const routes: Routes = [
    {
        path: "",
        component: HomePage,
    },
    {
        path: "event/:id",
        component: EventPage,
    },
];
