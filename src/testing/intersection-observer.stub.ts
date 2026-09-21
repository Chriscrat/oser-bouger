import { vi } from "vitest";

/** Mock implementation of IntersectionObserver for testing; call trigger(isIntersecting) to fire the callback. */
export class IntersectionObserverMock implements IntersectionObserver {
    readonly root: Element | Document | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];

    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn().mockReturnValue([]);

    constructor(
        public callback: IntersectionObserverCallback,
        public options?: IntersectionObserverInit
    ) {}

    trigger(isIntersecting: boolean): void {
        const entry = { isIntersecting } as IntersectionObserverEntry;
        this.callback([entry], this);
    }
}

/** Stubs the global IntersectionObserver API and returns a ref to control the mock instance. */
export function stubIntersectionObserver(): { current: IntersectionObserverMock | null } {
    const ref: { current: IntersectionObserverMock | null } = { current: null };

    vi.stubGlobal(
        "IntersectionObserver",
        vi.fn().mockImplementation(function (
            this: unknown,
            callback: IntersectionObserverCallback,
            options?: IntersectionObserverInit
        ) {
            ref.current = new IntersectionObserverMock(callback, options);
            return ref.current;
        })
    );

    return ref;
}
