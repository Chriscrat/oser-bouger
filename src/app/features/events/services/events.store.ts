import { Injectable, inject, signal, computed, effect } from "@angular/core";
import { toSignal, toObservable } from "@angular/core/rxjs-interop";
import { Router, ActivatedRoute } from "@angular/router";
import { EMPTY, catchError, finalize, switchMap, tap } from "rxjs";
import { EventsService } from "./events.service";
import {
    Category,
    CategoryListModel,
    Event,
    EventListModel,
    EventView,
    QfapTags,
} from "../models/event";
import {
    FacetsRecord,
    FilterName,
    ActiveFacetsRecord,
    TagsModel,
    TagName,
} from "../models/event-filters";
import {
    queryParamsToFilters,
    queryTagsToFilters,
    filtersToQueryParams,
} from "../mappers/filter-url.mapper";
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
    private queryParams = toSignal(this.route.queryParamMap, {
        initialValue: this.route.snapshot.queryParamMap,
    });
    private initialFilters = computed(() => queryParamsToFilters(this.queryParams()));
    private initialPage = computed(() => Number(this.queryParams().get("page")) || 1);
    private initialTags = computed(() => queryTagsToFilters(this.queryParams()));

    // Single source of truth for "what to fetch": derived straight from the URL so
    // it re-triggers on every navigation, even when the resulting page/filters/tags
    // values are unchanged (e.g. resetting to page 1 while already on page 1).
    private requestedQuery = computed(() => ({
        page: this.initialPage(),
        filters: {
            ...Object.fromEntries(this.filterNames.map(filterName => [filterName, [] as string[]])),
            ...this.initialFilters(),
        },
        tags: this.initialTags(),
    }));

    pageSize = 20;

    // --- Filtres ---
    private facetsState = signal<FacetsRecord>({});
    facets = this.facetsState.asReadonly();

    private readonly filterNames: FilterName[] = this.api.getFilters();

    filters: ActiveFacetsRecord = {
        ...Object.fromEntries(this.filterNames.map(filterName => [filterName, [] as string[]])),
        ...this.initialFilters(),
    };

    currentView: EventView = "list";

    // --- State liste ---
    private listState = signal<EventsListState>({
        items: [],
        total: 0,
        loading: false,
        error: null,
    });

    FILTER_LIST = {
        address_name: { name: "Nom du lieu", displayed: true },
        address_zipcode: { name: "Code postal", displayed: true },
        address_city: { name: "Ville", displayed: true },
        price_type: { name: "Type de prix", displayed: false },
        deaf: { name: "Accès malentendant", displayed: true },
        blind: { name: "Nom mal voyant", displayed: true },
        pmr: { name: "Accès PMR", displayed: true },
        qfap_tags: { name: "Catégorie", displayed: false },
    };

    private currentPageState = signal(this.initialPage());
    currentPage = this.currentPageState;

    events = computed(() => this.listState().items);
    total = computed(() => this.listState().total);
    listLoading = computed(() => this.listState().loading);
    listError = computed(() => this.listState().error);

    mapUrl = this.getEventsMapUrl();

    private currentEventState = signal<Event | null>(null);
    currentEvent = this.currentEventState.asReadonly();

    private categoryListState = signal<QfapTags[] | null>(null);
    categoryList = computed(() => this.tagCounts(this.categoryListState()));

    private currentTagsState = signal<TagsModel>({
        qfap_tags: [],
        price_type: [],
    });
    currentTags = this.currentTagsState.asReadonly();

    // Sole source of event-list fetches: reacts to URL changes only, so navigation
    // writers (goToPage/setFilters/...) never fetch directly themselves, and
    // switchMap cancels any in-flight request when a newer one lands.
    private listSync$ = toObservable(this.requestedQuery).pipe(
        switchMap(({ page, filters, tags }) => {
            this.listState.update(s => ({ ...s, loading: true, error: null }));
            const offset = (page - 1) * this.pageSize;
            return this.api.getEvents(filters, { limit: this.pageSize, offset }, tags).pipe(
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
            );
        })
    );
    private listSyncStarted = false;

    constructor() {
        effect(() => {
            this.filters = {
                ...Object.fromEntries(
                    this.filterNames.map(filterName => [filterName, [] as string[]])
                ),
                ...this.initialFilters(),
            };
            this.currentPageState.set(this.initialPage());
            this.currentTagsState.set(this.initialTags());
        });
    }

    /** Starts the URL-reactive list fetch pipeline; no-op if already running (idempotent). */
    ensureListSync(): void {
        if (this.listSyncStarted) return;
        this.listSyncStarted = true;
        this.listSync$.subscribe();
    }

    async setFilters(filterName: FilterName, filterValue: string): Promise<void> {
        if (this.filters[filterName]?.includes(filterValue)) {
            const valueIndex = this.filters[filterName].indexOf(filterValue);
            this.filters[filterName].splice(valueIndex, 1);
        } else {
            this.filters[filterName]?.push(filterValue);
        }

        const params = filtersToQueryParams(this.filters);
        Object.entries(this.currentTags()).forEach(([key, value]) => {
            if (value.length > 0) {
                params[key as TagName] = value;
            } else {
                delete params[key as TagName];
            }
        });

        await this.router.navigate([], {
            queryParams: { page: 1, ...params },
            replaceUrl: true,
        });
        this.mapUrl = this.getEventsMapUrl();
    }

    async goToPage(page: number): Promise<void> {
        if (page < 1) return;

        await this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { page },
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

    private tagCounts(categoryData: QfapTags[] | null): Category[] {
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

    async filterByTag(tag: TagName, value: string): Promise<void> {
        const params = filtersToQueryParams(this.filters);
        this.currentTagsState.update(tags => ({
            ...tags,
            [tag]: tags[tag].includes(value)
                ? tags[tag].filter(tagValue => tagValue !== value)
                : [...tags[tag], value],
        }));
        Object.entries(this.currentTags()).forEach(([key, value]) => {
            if (value.length > 0) {
                params[key as TagName] = value;
            } else {
                delete params[key as TagName];
            }
        });
        await this.router.navigate([], {
            queryParams: { page: 1, ...params },
            replaceUrl: true,
        });
    }
}
