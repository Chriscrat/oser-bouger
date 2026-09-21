import { test, expect } from "@playwright/test";
import { mockEventsApi } from "./fixtures/mock-api";

test.describe("Home page — filtrage des événements", () => {
    test.beforeEach(async ({ page }) => {
        await mockEventsApi(page);
    });

    test("appliquer le filtre PMR met à jour l'URL, la requête réseau et la liste", async ({
        page,
    }) => {
        await page.goto("/");
        await expect(page.locator(".fr-card")).toHaveCount(5);

        await page.getByRole("button", { name: "Filtres", exact: true }).click();

        const pmrGroupButton = page.getByRole("button", { name: "Accès PMR" });
        await expect(pmrGroupButton).toBeVisible();
        await pmrGroupButton.click();

        const filteredRequest = page.waitForRequest(request =>
            request.url().includes("refine=pmr")
        );

        await page.locator("label.fr-label", { hasText: "Oui" }).click();

        await filteredRequest;

        await expect(page).toHaveURL(/pmr=1/);
        await expect(page.locator(".fr-card")).toHaveCount(1);
        await expect(page.getByText("Atelier Accessible PMR")).toBeVisible();
    });
});
