export interface EventFilters {
    name: FilterName;
    label?: string;
    filters?: Filter[];
    displayed: boolean;
}

export interface PaginationParams {
    limit: number;
    offset: number;
}

export interface Filter {
    name: string;
    active: true;
    count: number;
}

export type FilterName =
    "address_name" | "address_zipcode" | "address_city" | "price_type" | "deaf" | "pmr" | "blind";

export type FacetsRecord = Partial<Record<FilterName, Filter[]>>;

export type ActiveFacetsRecord = Partial<Record<FilterName, string[]>>;

export type TagName = "qfap_tags" | "price_type";

export type TagsModel = Record<TagName, string[]>;
