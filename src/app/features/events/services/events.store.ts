import { Injectable, inject, signal, computed } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { EMPTY, catchError, finalize, tap } from "rxjs";
import { EventsService } from "./events.service";
import { Event, EventView } from "../models/event";
import { FacetsRecord, FilterName, ActiveFacetsRecord } from "../models/event-filters";
// import { ToastService } from "../../../ui/toast/services/toast.service";
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

    // --- State liste (scroll infini) ---
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

    // private toastService = inject(ToastService);
    mapUrl = this.getEventsMapUrl();

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
            queryParamsHandling: "",
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
            // this.toastService.error("Erreur lors du chargement des filtres");
        }
    }

    updateView(view: EventView) {
        this.currentView = view;
    }
}
