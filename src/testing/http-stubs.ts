import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

/** Provides Angular HTTP client and testing module for use in test setup. */
export function provideHttpTesting() {
    return [provideHttpClient(), provideHttpClientTesting()];
}
