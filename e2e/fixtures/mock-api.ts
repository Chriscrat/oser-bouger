import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Page, Route } from "@playwright/test";

const fixturesPath = join(__dirname, "events.fixtures.json");
const fixtures = JSON.parse(readFileSync(fixturesPath, "utf-8")) as Record<string, unknown>;

export interface MockEventsApiOverrides {
    page1?: unknown;
    page2?: unknown;
    filtered?: unknown;
    detail?: unknown;
}

export async function mockEventsApi(
    page: Page,
    overrides: MockEventsApiOverrides = {}
): Promise<void> {
    const page1 = overrides.page1 ?? fixtures.eventsPage1;
    const page2 = overrides.page2 ?? fixtures.eventsPage2;
    const filtered = overrides.filtered ?? fixtures.eventsFiltered;
    const detail = overrides.detail ?? fixtures.eventDetail;

    await page.route(
        "**/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records**",
        async (route: Route) => {
            const url = new URL(route.request().url());
            const where = url.searchParams.get("where") ?? "";
            const groupBy = url.searchParams.get("group_by");
            const offset = Number(url.searchParams.get("offset") ?? "0");
            const hasRefine = url.searchParams.getAll("refine").length > 0;

            if (where.startsWith("id=")) {
                await route.fulfill({ json: detail });
                return;
            }
            if (groupBy === "qfap_tags") {
                await route.fulfill({ json: fixtures.categoryList });
                return;
            }
            if (hasRefine) {
                await route.fulfill({ json: filtered });
                return;
            }
            if (offset > 0) {
                await route.fulfill({ json: page2 });
                return;
            }
            await route.fulfill({ json: page1 });
        }
    );

    await page.route("**/api/records/1.0/search**", async (route: Route) => {
        await route.fulfill({ json: fixtures.facets });
    });

    await page.route("**/explore/embed/dataset/que-faire-a-paris-/map**", async (route: Route) => {
        await route.fulfill({
            contentType: "text/html",
            body: "<html><body>Carte (mock)</body></html>",
        });
    });
}
