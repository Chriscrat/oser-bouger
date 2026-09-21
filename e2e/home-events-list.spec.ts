import { test, expect } from "@playwright/test";
import { mockEventsApi } from "./fixtures/mock-api";

test.describe("Home page — liste des événements", () => {
    test.beforeEach(async ({ page }) => {
        await mockEventsApi(page);
    });

    test("affiche les événements de la première page avec leur contenu", async ({ page }) => {
        await page.goto("/");

        const cards = page.locator(".fr-card");
        await expect(cards).toHaveCount(5);

        await expect(page.getByText("Concert Jazz au Parc")).toBeVisible();
        await expect(page.getByText("Exposition Photo Urbaine")).toBeVisible();
        await expect(page.getByText("Atelier Poterie en Famille")).toBeVisible();
        await expect(page.getByText("Marché Bio de Quartier")).toBeVisible();
        await expect(page.getByText("Visite Guidée du Louvre")).toBeVisible();

        const firstCard = cards.first();
        await expect(firstCard.getByText("Parc de la Villette")).toBeVisible();
        await expect(firstCard.getByText("Paris")).toBeVisible();
    });
});
