import { test, expect } from "@playwright/test";
import { mockEventsApi } from "./fixtures/mock-api";

test.describe("Navigation vers la fiche événement", () => {
    test.beforeEach(async ({ page }) => {
        await mockEventsApi(page);
    });

    test("cliquer sur une carte ouvre la fiche détail, puis le bouton retour ramène à la liste", async ({
        page,
    }) => {
        await page.goto("/");
        await expect(page.locator(".fr-card")).toHaveCount(5);

        await page
            .getByRole("link", { name: /Voir plus/ })
            .first()
            .click();

        await expect(page).toHaveURL(/\/event\/evt-001/);

        await page.goto("/event/abc123");
        await expect(page.locator("app-event-cover").getByText("Nuit des Musées")).toBeVisible();
        await expect(page.getByText("Musée Carnavalet").first()).toBeVisible();

        await page.getByRole("button", { name: "Retour" }).click();
        await expect(page).toHaveURL(/\/\?page=1$/);
        await expect(page.locator(".fr-card")).toHaveCount(5);
    });

    test("affiche un message si l'événement n'existe pas", async ({ page }) => {
        await mockEventsApi(page, { detail: { total_count: 0, results: [] } });
        await page.goto("/event/inconnu");
        await expect(page.getByText("Aucun évènement trouvé")).toBeVisible();
    });
});
