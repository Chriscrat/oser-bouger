import { Component } from "@angular/core";
import { Header } from "./layout/components/header/header";
import { Footer } from "./layout/components/footer/footer";
import { RouterOutlet } from "@angular/router";
import { ThemeToggle } from "./ui/theme-toggle/components/theme-toggle";
import { ToastContainer } from "./ui/toast/components/toast-container";

@Component({
    selector: "app-root",
    imports: [Header, Footer, RouterOutlet, ThemeToggle, ToastContainer],
    templateUrl: "./app.html",
    styleUrl: "./app.scss",
})
export class App {}
