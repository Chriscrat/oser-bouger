import { Injectable, signal } from "@angular/core";

/**
 * Controls the open/closed state of the filter sidebar and restores focus
 * to whichever element triggered it, since the trigger button (event-list)
 * and the sidebar (home-page) are siblings with no direct parent/child link.
 */
@Injectable({ providedIn: "root" })
export class SidemenuService {
    private isOpenSignal = signal(false);
    private triggerElement: HTMLElement | null = null;

    readonly isOpen = this.isOpenSignal.asReadonly();

    open(): void {
        this.triggerElement = document.activeElement as HTMLElement;
        this.isOpenSignal.set(true);
    }

    close(): void {
        this.isOpenSignal.set(false);
        this.triggerElement?.focus();
        this.triggerElement = null;
    }

    toggle(): void {
        if (this.isOpenSignal()) {
            this.close();
        } else {
            this.open();
        }
    }
}
