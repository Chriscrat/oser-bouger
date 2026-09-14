export interface PagePaginationItem {
    type: "page";
    page: number;
}

export interface EllipsisPaginationItem {
    type: "ellipsis";
}

export type PaginationItem = PagePaginationItem | EllipsisPaginationItem;
