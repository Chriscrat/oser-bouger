import { ComponentFixture, TestBed } from "@angular/core/testing";

import { Pagination, buildPaginationItems } from "./pagination";
import { PaginationItem } from "../models/pagination";

function simplify(items: PaginationItem[]): (number | "...")[] {
    return items.map(item => (item.type === "page" ? item.page : "..."));
}

describe("buildPaginationItems", () => {
    it("returns every page without ellipsis when they all fit", () => {
        expect(simplify(buildPaginationItems(1, 1, 2, 1))).toEqual([1]);
        expect(simplify(buildPaginationItems(1, 9, 2, 1))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("shows an ellipsis on the right when close to the first page", () => {
        expect(simplify(buildPaginationItems(1, 20, 2, 1))).toEqual([
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            "...",
            20,
        ]);
    });

    it("shows an ellipsis on the left when close to the last page", () => {
        expect(simplify(buildPaginationItems(20, 20, 2, 1))).toEqual([
            1,
            "...",
            14,
            15,
            16,
            17,
            18,
            19,
            20,
        ]);
    });

    it("shows an ellipsis on both sides when in the middle", () => {
        expect(simplify(buildPaginationItems(10, 20, 2, 1))).toEqual([
            1,
            "...",
            8,
            9,
            10,
            11,
            12,
            "...",
            20,
        ]);
    });

    it("never repeats a page number or goes out of range", () => {
        for (let totalPage = 1; totalPage <= 25; totalPage++) {
            for (let currentPage = 1; currentPage <= totalPage; currentPage++) {
                const pages = buildPaginationItems(currentPage, totalPage, 2, 1)
                    .filter(
                        (item): item is Extract<PaginationItem, { type: "page" }> =>
                            item.type === "page"
                    )
                    .map(item => item.page);

                expect(new Set(pages).size).toBe(pages.length);
                expect(pages.every(page => page >= 1 && page <= totalPage)).toBe(true);
                expect(pages).toEqual([...pages].sort((a, b) => a - b));
            }
        }
    });
});

describe("Pagination", () => {
    let component: Pagination;
    let fixture: ComponentFixture<Pagination>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Pagination],
        }).compileComponents();

        fixture = TestBed.createComponent(Pagination);
        component = fixture.componentInstance;
    });

    function setPagination(totalItems: number, itemsPerPage: number) {
        fixture.componentRef.setInput("totalItems", totalItems);
        fixture.componentRef.setInput("itemsPerPage", itemsPerPage);
        fixture.detectChanges();
    }

    it("should create", () => {
        setPagination(100, 10);
        expect(component).toBeTruthy();
    });

    it("computes the total number of pages", () => {
        setPagination(95, 10);
        expect(component.totalPage()).toBe(10);
    });

    it("starts on the first page", () => {
        setPagination(100, 10);
        expect(component.page()).toBe(1);
        expect(component.isFirstPage()).toBe(true);
        expect(component.hasPreviousPage()).toBe(false);
    });
});
