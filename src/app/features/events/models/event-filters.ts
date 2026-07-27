export interface EventFilters {
    name: FilterName;
    label?: string;
    filters?: Filter[];
}

export interface PaginationParams {
    limit: number;
}

export interface Filter {
    name: string;
    active: true;
    count: number;
}

export type FilterName = "address_name" | "address_zipcode" | "address_city";

export type FacetsRecord = Partial<Record<FilterName, Filter[]>>;

export type ActiveFacetsRecord = Partial<Record<FilterName, string[]>>;
