import { test, expect } from "@playwright/test";
import { mockEventsApi } from "./fixtures/mock-api";

test.describe("Home page — bascule vue liste / carte", () => {
    test.beforeEach(async ({ page }) => {
        await mockEventsApi(page);
    });

    test("basculer sur la vue carte masque la liste, et revenir en liste ne recharge pas les données", async ({
        page,
    }) => {
        await page.goto("/");
        await expect(page.locator(".fr-card")).toHaveCount(5);

        let listRequestCount = 0;
        page.on("request", request => {
            if (
                request.url().includes("/records") &&
                !request.url().includes("where=") &&
                !request.url().includes("group_by")
            ) {
                listRequestCount += 1;
            }
        });

        await page.locator("label.fr-label", { hasText: "Carte" }).click();

        const iframe = page.locator("app-event-list-map iframe");
        await expect(iframe).toBeVisible();
        await expect(page.locator(".fr-card").first()).toBeHidden();

        const requestsAfterMapToggle = listRequestCount;

        await page.locator("label.fr-label", { hasText: "Liste" }).click();

        await expect(page.locator(".fr-card").first()).toBeVisible();
        await expect(iframe).toBeHidden();
        expect(listRequestCount).toBe(requestsAfterMapToggle);
    });
});
