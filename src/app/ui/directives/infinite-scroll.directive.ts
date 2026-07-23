import {
    Directive,
    ElementRef,
    inject,
    output,
    input,
    OnDestroy,
    afterNextRender,
} from "@angular/core";

@Directive({
    selector: "[appInfiniteScroll]",
    standalone: true,
})
export class InfiniteScrollDirective implements OnDestroy {
    private elementRef = inject(ElementRef<HTMLElement>);
    private observer?: IntersectionObserver;

    rootMargin = input("200px");
    disabled = input(false);

    scrolledToEnd = output<void>();

    constructor() {
        afterNextRender(() => this.setupObserver());
    }

    private setupObserver(): void {
        this.observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];
                if (entry.isIntersecting && !this.disabled()) {
                    this.scrolledToEnd.emit();
                }
            },
            {
                rootMargin: this.rootMargin(),
                threshold: 0.1,
            }
        );

        this.observer.observe(this.elementRef.nativeElement as Element);
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }
}
