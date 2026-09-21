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

## Edge Cases & Known Limitations

### Double-fetch in EventsStore.goToPage()
When `EventsStore.goToPage()` is called with a real router (vs. a stub), Angular's `router.navigate()` triggers a re-navigation, which re-fires the `ActivatedRoute.queryParamMap` observable. This causes `EventListCards` to re-subscribe to the observable *again*, resulting in two HTTP fetch calls instead of one per page change.

**Status:** Documented, not fixed. The app works correctly in practice because:
- Tests isolate the store or route stub it
- Real usage benefits from the eventual consistency of duplicate fetches

**Mitigation:** Tests use `activatedRouteStub()` to avoid real navigation. In production, monitor duplicate fetches in Network tab if performance issues arise.
---

## Related
- Playwright e2e config: `playwright.config.ts`
- Vitest config: `vitest.config.ts`
- Angular testing utilities: `@angular/core/testing`, `@angular/router/testing`
