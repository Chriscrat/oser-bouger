import { ActiveFacetsRecord } from "../models/event-filters";
import { Params, ParamMap } from "@angular/router";

export function filtersToQueryParams(filters: ActiveFacetsRecord): Params {
    const params: Params = {};

    for (const [key, value] of Object.entries(filters)) {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                params[key] = value;
            }
        } else if (value !== null && value !== "") {
            params[key] = value;
        }
    }

    return params;
}

export function queryParamsToFilters(paramMap: ParamMap): ActiveFacetsRecord {
    return {
        address_name: paramMap.getAll("address_name"),
        address_zipcode: paramMap.getAll("address_zipcode"),
        address_city: paramMap.getAll("address_city"),
        price_type: paramMap.getAll("price_type"),
        deaf: paramMap.getAll("deaf"),
        blind: paramMap.getAll("blind"),
        pmr: paramMap.getAll("pmr"),
    };
}
