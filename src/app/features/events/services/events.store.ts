import { Injectable, inject, signal, computed } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { EMPTY, catchError, finalize, tap } from "rxjs";
import { EventsService } from "./events.service";
import { Category, CategoryListModel, Event, EventListModel, EventView } from "../models/event";
import { FacetsRecord, FilterName, ActiveFacetsRecord } from "../models/event-filters";
import { queryParamsToFilters, filtersToQueryParams } from "../mappers/filter-url.mapper";
interface EventsListState {
    items: Event[];
    total: number;
    loading: boolean;
    error: string | null;
}

@Injectable({ providedIn: "root" })
export class EventsStore {
    private api = inject(EventsService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private initial = queryParamsToFilters(this.route.snapshot.queryParamMap);
    private initialPage = Number(this.route.snapshot.queryParamMap.get("page")) || 1;

    pageSize = 20;

    // --- Filtres ---
    private facetsState = signal<FacetsRecord>({});
    facets = this.facetsState.asReadonly();

    private readonly filterNames: FilterName[] = this.api.getFilters();

    filters: ActiveFacetsRecord = {
        ...Object.fromEntries(this.filterNames.map(filterName => [filterName, [] as string[]])),
        ...this.initial,
    };

    currentView: EventView = "list";

    // --- State liste ---
    private listState = signal<EventsListState>({
        items: [],
        total: 0,
        loading: false,
        error: null,
    });

    private currentPageState = signal(this.initialPage);
    currentPage = this.currentPageState;

    events = computed(() => this.listState().items);
    total = computed(() => this.listState().total);
    listLoading = computed(() => this.listState().loading);
    listError = computed(() => this.listState().error);

    mapUrl = this.getEventsMapUrl();

    private currentEventState = signal<Event | null>(null);
    currentEvent = this.currentEventState.asReadonly();

    private categoryListState = signal<Category[] | null>(null);
    categoryList = computed(() => this.tagCounts(this.categoryListState()));

    async setFilters(filterName: FilterName, filterValue: string): Promise<void> {
        if (this.filters[filterName]?.includes(filterValue)) {
            const valueIndex = this.filters[filterName].indexOf(filterValue);
            this.filters[filterName].splice(valueIndex, 1);
        } else {
            this.filters[filterName]?.push(filterValue);
        }

        const params = filtersToQueryParams(this.filters);
        const page = this.currentPage;
        await this.router.navigate([], {
            queryParams: { page, ...params },
            replaceUrl: true,
        });
        await this.goToPage(1);
        this.mapUrl = this.getEventsMapUrl();
    }

    async goToPage(page: number): Promise<void> {
        if (page < 1) return;

        this.currentPageState.set(page);
        this.listState.update(s => ({ ...s, loading: true, error: null }));

        const offset = (page - 1) * this.pageSize;
        this.api
            .getEvents(this.filters, { limit: this.pageSize, offset })
            .pipe(
                tap(response => {
                    const results = response.results ?? [];
                    const totalCount = response.total_count ?? 0;
                    this.listState.update(s => ({
                        ...s,
                        items: results,
                        total: totalCount,
                    }));
                }),
                catchError((err: unknown) => {
                    const message = err instanceof Error ? err.message : String(err);
                    this.listState.update(s => ({
                        ...s,
                        error: `Erreur de chargement: ${message}`,
                    }));
                    return EMPTY;
                }),
                finalize(() => this.listState.update(s => ({ ...s, loading: false })))
            )
            .subscribe();

        const params = filtersToQueryParams(this.filters);

        await this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page, ...params },
            queryParamsHandling: "merge",
        });
    }

    async resetFilters() {
        (Object.keys(this.filters) as FilterName[]).forEach((key: FilterName): void => {
            this.filters[key] = [];
        });
        await this.router.navigate([], {
            queryParams: { page: 1 },
            replaceUrl: true,
            queryParamsHandling: "",
        });
        await this.goToPage(1);
        this.mapUrl = this.getEventsMapUrl();
    }

    getEventsMapUrl(): string {
        return this.api.getEventsMap(this.filters);
    }

    async getFacets(): Promise<void> {
        try {
            const facets = await this.api.getFacetsList();
            this.facetsState.set(facets);
        } catch (error) {
            console.error("Error", error);
        }
    }

    updateView(view: EventView) {
        this.currentView = view;
    }

    fetchEvent(eventId: string): void {
        this.api.getEvent(eventId).subscribe({
            next: (data: EventListModel) => {
                this.currentEventState.set(data.results?.[0] ?? null);
            },
            error: err => console.error("Error fetching events:", err),
        });
    }

    fetchCategoryList(): void {
        this.api.getCategoryList().subscribe({
            next: (data: CategoryListModel) => {
                if (data.results !== null) {
                    this.categoryListState.set(data.results);
                }
            },
            error: err => console.error("Error fetching events:", err),
        });
    }

    private tagCounts(categoryData: Category[] | null): { name: string; count: number }[] {
        const counts = new Map<string, number>();
        if (categoryData) {
            for (const item of categoryData) {
                for (const tag of item.qfap_tags?.split(";") ?? []) {
                    const name = tag.trim();
                    if (name) {
                        counts.set(name, (counts.get(name) ?? 0) + 1);
                    }
                }
            }
        }
        const result = Array.from(counts.entries())
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([name, count]) => ({ name, count }));
        return result;
    }
}
