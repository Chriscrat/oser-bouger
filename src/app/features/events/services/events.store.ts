import { Injectable, inject, signal, computed } from "@angular/core";
import { EMPTY, catchError, finalize, tap } from "rxjs";
import { EventsService } from "./events.service";
import { Event, EventView } from "../models/event";
import { FacetsRecord, FilterName, ActiveFacetsRecord } from "../models/event-filters";
import { ToastService } from "../../../ui/toast/services/toast.service";

interface EventsListState {
    items: Event[];
    total: number;
    limit: number;
    hasMore: boolean;
    loading: boolean;
    error: string | null;
}

const PAGE_SIZE = 20;

@Injectable({ providedIn: "root" })
export class EventsStore {
    private api = inject(EventsService);

    // --- Filtres ---
    private facetsState = signal<FacetsRecord>({});
    facets = this.facetsState.asReadonly();

    filters: ActiveFacetsRecord = {
        address_city: [],
        address_name: [],
        address_zipcode: [],
    };

    currentView: EventView = "list";

    // --- State liste (scroll infini) ---
    private listState = signal<EventsListState>({
        items: [],
        total: 0,
        limit: PAGE_SIZE,
        hasMore: true,
        loading: false,
        error: null,
    });

    events = computed(() => this.listState().items);
    total = computed(() => this.listState().total);
    listLoading = computed(() => this.listState().loading);
    hasMore = computed(() => this.listState().hasMore);
    listError = computed(() => this.listState().error);

    private toastService = inject(ToastService);
    mapUrl = this.getEventsMapUrl();

    setFilters(filterName: FilterName, filterValue: string): void {
        if (this.filters[filterName]?.includes(filterValue)) {
            const valueIndex = this.filters[filterName].indexOf(filterValue);
            this.filters[filterName].splice(valueIndex, 1);
        } else {
            this.filters[filterName]?.push(filterValue);
        }

        this.resetList();
        this.loadNextPage();
        this.mapUrl = this.getEventsMapUrl();
    }

    loadNextPage(): void {
        const current = this.listState();
        if (current.loading || !current.hasMore) return;

        this.listState.update(s => ({
            ...s,
            loading: true,
            error: null,
        }));

        this.api
            .getEvents(this.filters, { limit: current.limit })
            .pipe(
                tap(response => {
                    const results = response.results ?? [];
                    const totalCount = response.total_count ?? 0;
                    this.listState.update(s => ({
                        ...s,
                        items: [...results],
                        total: totalCount,
                        limit: s.limit + PAGE_SIZE,
                        hasMore: (results.length ?? 0) === s.limit,
                    }));
                }),
                catchError(err => {
                    this.listState.update(s => ({ ...s, error: `Erreur de chargement: ${err}` }));
                    return EMPTY;
                }),
                finalize(() => this.listState.update(s => ({ ...s, loading: false })))
            )
            .subscribe();
    }

    resetList(): void {
        this.listState.set({
            items: [],
            total: 0,
            limit: PAGE_SIZE,
            hasMore: true,
            loading: false,
            error: null,
        });
    }

    getEventsMapUrl(): string {
        return this.api.getEventsMap(this.filters);
    }

    async getFacets(): Promise<void> {
        try {
            const facets = await this.api.getFacetsList();
            this.facetsState.set(facets);
        } catch {
            this.toastService.error("Erreur lors du chargement des filtres");
        }
    }

    updateView(view: EventView) {
        this.currentView = view;
    }
}
