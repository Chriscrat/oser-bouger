import { Component } from "@angular/core";
import { Header } from "./layout/components/header/header";
import { Footer } from "./layout/components/footer/footer";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: "app-root",
    imports: [Header, Footer, RouterOutlet],
    templateUrl: "./app.html",
    styleUrl: "./app.scss",
})
export class App {}
