import { vi } from "vitest";

/** Stubs the global fetch API to resolve with a JSON response. */
export function stubFetchJson(payload: unknown) {
    const fetchMock = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(payload),
    });

    vi.stubGlobal("fetch", fetchMock);

    return fetchMock;
}
