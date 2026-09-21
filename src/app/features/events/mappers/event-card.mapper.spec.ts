import { mapEventToCardDetails } from "./event-card.mapper";
import { buildEvent } from "../../../../testing/event.factory";

describe("mapEventToCardDetails", () => {
    it("maps identity, cover, address and contacts fields", () => {
        const event = buildEvent();

        const result = mapEventToCardDetails(event);

        expect(result.id).toBe(event.id);
        expect(result.title).toBe(event.title);
        expect(result.cover).toEqual({
            url: event.cover_url,
            alt: event.cover_alt,
            credit: event.cover_credit,
        });
        expect(result.address).toEqual({
            name: event.address_name,
            street: event.address_street,
            zipcode: event.address_zipcode,
            city: event.address_city,
        });
        expect(result.contacts?.organisation_name).toBe(event.contact_organisation_name);
    });

    describe("accessibility tags", () => {
        it("keeps only tags whose flag is exactly 1, in the declared order", () => {
            const event = buildEvent({
                pmr: 1,
                blind: 0,
                deaf: null,
                sign_language: 1,
                mental: null,
            });

            const result = mapEventToCardDetails(event);

            expect(result.tags?.accessibility.map(tag => tag.key)).toEqual([
                "pmr",
                "sign_language",
            ]);
        });

        it("returns no accessibility tags when every flag is absent", () => {
            const event = buildEvent();

            expect(mapEventToCardDetails(event).tags?.accessibility).toEqual([]);
        });
    });

    describe("price type capitalization", () => {
        it("capitalizes the first letter of the price type", () => {
            const event = buildEvent({ price_type: "gratuit" });

            expect(mapEventToCardDetails(event).tags?.priceType).toBe("Gratuit");
        });

        it("keeps an already-capitalized price type unchanged", () => {
            const event = buildEvent({ price_type: "Payant" });

            expect(mapEventToCardDetails(event).tags?.priceType).toBe("Payant");
        });

        it("keeps an empty price type as an empty string", () => {
            const event = buildEvent({ price_type: "" });

            expect(mapEventToCardDetails(event).tags?.priceType).toBe("");
        });
    });

    it("passes through the raw category string", () => {
        const event = buildEvent({ qfap_tags: "Sport;Loisirs" });

        expect(mapEventToCardDetails(event).tags?.category).toBe("Sport;Loisirs");
    });
});
