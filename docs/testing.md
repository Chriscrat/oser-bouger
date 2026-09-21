# Testing Strategy

## Overview

Oser-Bouger's test suite uses a three-level approach to ensure code stability and reduce regression risk:

1. **Unit tests** — isolated component and service logic via Vitest
2. **Integration tests** — cross-component and store/router interactions via Vitest + Angular TestBed
3. **End-to-end tests** — full user workflows via Playwright

All tests are colocated with source files as `*.spec.ts` (unit/integration) or `*.integration.spec.ts` (integration), or in `e2e/` for Playwright.

---

## Commands

| Task | Command |
|---|---|
| Run all unit + integration tests | `npm test` |
| Run all tests in watch mode | `npm test -- --watch` |
| Run e2e tests (headless) | `npm run e2e` |
| Run e2e tests with UI browser | `npm run e2e:ui` |

---

## Testing Helpers

### Location
All reusable stubs and factories live in `src/testing/`:
- `fetch.stub.ts` — stubs the global fetch API
- `intersection-observer.stub.ts` — mocks IntersectionObserver
- `router-stubs.ts` — mocks ActivatedRoute and router providers
- `event.factory.ts` — builds Event objects with defaults
- `http-stubs.ts` — provides Angular HTTP testing module

### Usage

#### Fetch stubbing (e.g., API responses)
```ts
import { stubFetchJson } from '@/testing/fetch.stub';

describe('my feature', () => {
    it('fetches data', async () => {
        stubFetchJson({ success: true });
        // test code that calls fetch()
    });
});
```

#### Event factory (fixture data)
```ts
import { buildEvent } from '@/testing/event.factory';

describe('EventCard', () => {
    it('displays title', () => {
        const event = buildEvent({ title: 'Custom Title' });
        // test with event
    });
});
```

#### Router stub (query params)
```ts
import { activatedRouteStub } from '@/testing/router-stubs';

describe('EventListCards', () => {
    it('reads initial query params', () => {
        const route = activatedRouteStub({ category: 'music' });
        // inject route into component/composable
    });
});
```

#### HTTP testing (HttpClient)
```ts
import { provideHttpTesting } from '@/testing/http-stubs';

describe('EventsService', () => {
    it('fetches events', () => {
        TestBed.configureTestingModule({
            providers: [provideHttpTesting()]
        });
        // test code with HttpClient
    });
});
```

---

## Architecture note: how the event list fetches

`EventsStore` used to have two places that could trigger an event-list fetch:
`goToPage()`/`setFilters()`/etc. fetched directly *and* wrote the URL via
`router.navigate()`, while `EventListCards` separately re-subscribed to
`ActivatedRoute.queryParamMap` and called `goToPage()` again whenever the URL
changed — including the URL change *caused by* `goToPage()` itself. With a
real router this produced a double (sometimes triple, on filter changes)
HTTP fetch per user action, and occasionally a stale/late response
overwriting a newer one (no request cancellation).

**Fixed:** the URL is now the single source of truth for what to fetch.
`goToPage()`/`setFilters()`/`resetFilters()`/`filterByTag()` only call
`router.navigate()` — they never fetch. The only fetch trigger is
`EventsStore.ensureListSync()`, a lazily-started, URL-reactive pipeline
(`toObservable(requestedQuery).pipe(switchMap(...))`) that a consuming
component starts once (`EventListCards.ngOnInit()`) and that cancels any
stale in-flight request via `switchMap`. See `events.store.spec.ts`'s
`ensureListSync()` describe block for the regression tests covering this.
---

## Related
- Playwright e2e config: `playwright.config.ts`
- Vitest runs via the Angular CLI's native builder (`architect.test` in `angular.json`), no separate `vitest.config.ts`
- Angular testing utilities: `@angular/core/testing`, `@angular/router/testing`
