import { Component, HostListener, computed, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";

import { PagePaginationItem, PaginationItem } from "../models/pagination";

@Component({
    selector: "app-pagination",
    standalone: true,
    imports: [RouterLink],
    templateUrl: "./pagination.html",
})
export class Pagination {
    totalItems = input.required<number>();
    itemsPerPage = input.required<number>();
    page = input<number>(1);

    private viewportWidth = signal(typeof window === "undefined" ? 0 : window.innerWidth);

    isSmallScreen = computed(() => {
        const width = this.viewportWidth();
        return width > 0 && width <= 640;
    });

    isMediumScreen = computed(() => {
        const width = this.viewportWidth();
        return width > 640 && width <= 1024;
    });

    private siblingCount = computed(() => {
        return this.isSmallScreen() ? 1 : this.isMediumScreen() ? 1 : 3;
    });

    private boundaryCount = computed(() => (!this.isSmallScreen() ? 2 : 0));

    totalPage = computed<number>(() => {
        if (this.totalItems() && this.itemsPerPage()) {
            return Math.ceil(this.totalItems() / this.itemsPerPage());
        } else {
            return 1;
        }
    });
    isFirstPage = computed<boolean>(() => this.page() === 1);
    isLastPage = computed<boolean>(() => this.page() === this.totalPage());

    hasPreviousPage = computed<boolean>(() => this.page() - 1 > 0);
    hasNextPage = computed<boolean>(() => this.page() < this.totalPage());

    paginationItems = computed<PaginationItem[]>(() =>
        buildPaginationItems(
            this.page(),
            this.totalPage(),
            this.siblingCount(),
            this.boundaryCount(),
            this.isSmallScreen()
        )
    );

    @HostListener("window:resize")
    onWindowResize(): void {
        this.viewportWidth.set(window.innerWidth);
    }
}

export function buildPaginationItems(
    currentPage: number,
    totalPage: number,
    siblingCount: number,
    boundaryCount: number,
    isSmallScreen?: boolean
): PaginationItem[] {
    const totalPageCountWithoutEllipsis = boundaryCount * 2 + siblingCount * 2 + 3;
    if (totalPage <= totalPageCountWithoutEllipsis) {
        return toPageItems(1, totalPage);
    }

    const startPages = toPageItems(1, boundaryCount);
    const endPages = toPageItems(totalPage - boundaryCount + 1, totalPage);

    const siblingsStart = Math.max(
        Math.min(currentPage - siblingCount, totalPage - boundaryCount - siblingCount * 2 - 1),
        boundaryCount + 1
    );
    const siblingsEnd = Math.min(
        Math.max(currentPage + siblingCount, boundaryCount + siblingCount * 2 + 2),
        totalPage - boundaryCount - 1
    );

    const leftGapItem: PaginationItem[] =
        siblingsStart > boundaryCount + 2 && !isSmallScreen
            ? [{ type: "ellipsis" }]
            : boundaryCount + 1 < siblingsStart
              ? [{ type: "page", page: boundaryCount + 1 }]
              : [];

    const rightGapItem: PaginationItem[] =
        siblingsEnd < totalPage - boundaryCount - 1 && !isSmallScreen
            ? [{ type: "ellipsis" }]
            : totalPage - boundaryCount > siblingsEnd
              ? [{ type: "page", page: totalPage - boundaryCount }]
              : [];

    return [
        ...startPages,
        ...leftGapItem,
        ...toPageItems(siblingsStart, siblingsEnd),
        ...rightGapItem,
        ...endPages,
    ];
}

function toPageItems(start: number, stop: number): PagePaginationItem[] {
    return range(start, stop).map(page => ({ type: "page", page }));
}

function range(start: number, stop: number): number[] {
    if (stop < start) {
        return [];
    }
    return Array.from({ length: stop - start + 1 }, (_, i) => start + i);
}
