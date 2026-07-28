export interface EventFilters {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    bounds?: { north: number; south: number; east: number; west: number };
}

export interface PaginationParams {
    limit: number;
}

export interface EventFilters2 {
    name: string;
    filters: Filter[];
}

export interface Filter {
    text: string;
    value: string;
}
