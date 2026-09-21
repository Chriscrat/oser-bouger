import { test, expect } from "@playwright/test";
import { mockEventsApi } from "./fixtures/mock-api";

test.describe("Home page — pagination", () => {
    test.beforeEach(async ({ page }) => {
        await mockEventsApi(page);
    });

    test("naviguer vers la page suivante charge de nouveaux événements", async ({ page }) => {
        await page.goto("/");
        await expect(page.locator(".fr-card")).toHaveCount(5);
        await expect(page.getByText("Concert Jazz au Parc")).toBeVisible();

        const nextPageRequest = page.waitForRequest(request => request.url().includes("offset=20"));

        await page.getByRole("link", { name: "Suivant", exact: true }).click();

        await nextPageRequest;

        await expect(page).toHaveURL(/page=2/);
        await expect(page.getByText("Cinéma Plein Air")).toBeVisible();
        await expect(page.getByText("Spectacle de Rue")).toBeVisible();
        await expect(page.getByText("Course Solidaire")).toBeVisible();
        await expect(page.locator(".fr-card")).toHaveCount(3);
    });
});
