import { Component, HostListener, inject } from "@angular/core";
import { SidemenuService } from "../services/sidemenu.service";

@Component({
    selector: "app-sidemenu",
    templateUrl: "./sidemenu.html",
    styleUrl: "./sidemenu.scss",
})
export class Sidemenu {
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
