import { Injectable, inject, signal, computed } from "@angular/core";
import { EMPTY, catchError, finalize, tap } from "rxjs";
import { EventsService } from "./events.service";
import { EventModel } from "../models/event";
import { EventFilters } from "../models/event-filters";

interface EventsListState {
    items: EventModel[];
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
    private filtersState = signal<EventFilters>({});
    filters = this.filtersState.asReadonly();

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

    setFilters(filters: EventFilters): void {
        this.filtersState.set(filters);
        this.resetList();
        this.loadNextPage();
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
            .getEvents(this.filtersState(), { limit: current.limit })
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
}
