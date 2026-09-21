import { convertToParamMap } from "@angular/router";

import {
    filtersToQueryParams,
    queryParamsToFilters,
    queryTagsToFilters,
} from "./filter-url.mapper";
import { ActiveFacetsRecord } from "../models/event-filters";

describe("filtersToQueryParams", () => {
    it("excludes filters whose value is an empty array", () => {
        const filters: ActiveFacetsRecord = { address_city: [], pmr: ["1"] };

        expect(filtersToQueryParams(filters)).toEqual({ pmr: ["1"] });
    });

    it("includes filters whose value is a non-empty array", () => {
        const filters: ActiveFacetsRecord = { address_city: ["Paris", "Lyon"] };

        expect(filtersToQueryParams(filters)).toEqual({ address_city: ["Paris", "Lyon"] });
    });

    it("returns an empty object when no filter is active", () => {
        const filters: ActiveFacetsRecord = { address_city: [], pmr: [] };

        expect(filtersToQueryParams(filters)).toEqual({});
    });
});

describe("queryParamsToFilters", () => {
    it("restores every supported filter as an array, including repeated values", () => {
        const paramMap = convertToParamMap({ address_city: ["Paris", "Lyon"], pmr: "1" });

        const result = queryParamsToFilters(paramMap);

        expect(result.address_city).toEqual(["Paris", "Lyon"]);
        expect(result.pmr).toEqual(["1"]);
    });

    it("returns an empty array for a supported filter absent from the URL", () => {
        const paramMap = convertToParamMap({});

        expect(queryParamsToFilters(paramMap).address_zipcode).toEqual([]);
    });

    it("does not restore price_type even though it is a valid FilterName", () => {
        const paramMap = convertToParamMap({ price_type: "Gratuit" });

        const result = queryParamsToFilters(paramMap);

        expect(result).not.toHaveProperty("price_type");
    });
});

describe("queryTagsToFilters", () => {
    it("restores qfap_tags and price_type as arrays", () => {
        const paramMap = convertToParamMap({
            qfap_tags: ["Sport", "Musique"],
            price_type: "Gratuit",
        });

        expect(queryTagsToFilters(paramMap)).toEqual({
            qfap_tags: ["Sport", "Musique"],
            price_type: ["Gratuit"],
        });
    });

    it("returns empty arrays when no tag is present in the URL", () => {
        const paramMap = convertToParamMap({});

        expect(queryTagsToFilters(paramMap)).toEqual({ qfap_tags: [], price_type: [] });
    });
});
