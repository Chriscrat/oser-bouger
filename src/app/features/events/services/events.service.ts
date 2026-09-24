import { inject, Injectable, signal } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, catchError, firstValueFrom, tap, throwError, timeout } from "rxjs";
import { CategoryListModel, EventListModel, EventView } from "../models/event";
import {
    Filter,
    FacetsRecord,
    ActiveFacetsRecord,
    PaginationParams,
    FilterName,
    TagsModel,
} from "../models/event-filters";
import { environment } from "../../../environments/environment";
import { EventsFallbackService } from "./events-fallback.service";

@Injectable({ providedIn: "root" })
export class EventsService {
    private fallback = inject(EventsFallbackService);

    // Sticky: once the API has failed, later calls skip it instead of waiting for another timeout.
    private fallbackModeState = signal(environment.useFallbackData);
    isFallbackMode = this.fallbackModeState.asReadonly();

    private datasetId = "que-faire-a-paris-";
    private timezone = "Europe/Paris";
    private language = "fr";
    private coordinates = [9, 48.73355, 2.45819];

    private http = inject(HttpClient);
    private eventListUrl = `${environment.catalogApi}`;
    private mapUrl = `${environment.mapApi}`;
    private facetsUrl = `${environment.facetsApi}`;
    private FILTERS_ENUM: FilterName[] = [
        "address_name",
        "address_zipcode",
        "address_city",
        "price_type",
        "deaf",
        "blind",
        "pmr",
    ];

    getEvents(
        filters: ActiveFacetsRecord,
        pagination: PaginationParams,
        tags: TagsModel
    ): Observable<EventListModel> {
        return this.withFallback(
            () =>
                this.http.get<EventListModel>(this.eventListUrl, {
                    params: this.buildFiltersParameters(filters, "list", pagination, tags),
                }),
            () => this.fallback.getEvents(filters, pagination, tags)
        );
    }

    getEvent(eventId: string): Observable<EventListModel> {
        const url = new URL(this.eventListUrl);
        url.searchParams.set("where", `id=${eventId}`);
        url.searchParams.set("timezone", "Europe/Paris");
        url.searchParams.set("lang", this.language);

        return this.withFallback(
            () => this.http.get<EventListModel>(url.toString()),
            () => this.fallback.getEvent(eventId)
        );
    }

    getCategoryList(): Observable<CategoryListModel> {
        const field = "qfap_tags";
        const url = new URL(this.eventListUrl);
        url.searchParams.set("select", field);
        url.searchParams.set("group_by", field);
        return this.withFallback(
            () => this.http.get<CategoryListModel>(url.toString()),
            () => this.fallback.getCategoryList()
        );
    }

    /**
     * Calls the opendata API and switches to the static dataset when it errors or times out.
     * If the fallback fails too, the original API error is rethrown.
     */
    private withFallback<T>(
        apiRequest: () => Observable<T>,
        fallbackRequest: () => Observable<T>
    ): Observable<T> {
        if (this.fallbackModeState()) {
            return fallbackRequest();
        }
        return apiRequest().pipe(
            timeout(environment.apiTimeout),
            catchError((apiError: unknown) => {
                console.warn("Opendata API unreachable, switching to fallback data", apiError);
                return fallbackRequest().pipe(
                    tap(() => this.fallbackModeState.set(true)),
                    catchError(() => throwError(() => apiError))
                );
            })
        );
    }

    private buildFiltersParameters(
        filters: ActiveFacetsRecord,
        view: EventView,
        pagination?: PaginationParams,
        tags?: Record<string, string[]>
    ): HttpParams {
        let params = new HttpParams();

        (Object.keys(filters) as FilterName[]).forEach(filter => {
            const values = filters[filter];
            if (!values) {
                return;
            }
            values.forEach(value => {
                const key = view === "list" ? "refine" : `refine.${filter}`;
                const paramValue = view === "list" ? `${filter}:${value}` : value;
                const existing = params.getAll(key) || [];

                if (existing.includes(paramValue)) {
                    // remove the existing occurrence
                    params = params.delete(key);
                    existing
                        .filter(v => v !== paramValue)
                        .forEach(v => {
                            params = params.append(key, v);
                        });
                } else {
                    // allow multiple occurrences
                    params = params.append(key, paramValue);
                }
            });
        });

        if (tags) {
            const tagEntries = Object.entries(tags).filter(
                ([, values]: [string, string[]]) => values.length > 0
            );
            if (tagEntries.length) {
                const whereCategory = tagEntries.map(([key, values]: [string, string[]]) =>
                    values.map((value: string): string => `${key} like '${value}'`).join(" OR ")
                );

                if (whereCategory.length) {
                    params = params.set("where", `(${whereCategory.join(") AND (")})`);
                } else {
                    params = params.set("where", `(${whereCategory.join("")})`);
                }
            }
        }

        if (pagination) {
            params = params.set("limit", pagination.limit);
            params = params.set("offset", pagination.offset);
        }
        return params;
    }

    getEventsMap(filters: ActiveFacetsRecord) {
        const disjunctiveList = this.FILTERS_ENUM.map(
            (filter, index) => (index >= 1 ? "&" : "?") + `disjunctive.${filter}`
        ).join("");

        const url = new URL(this.mapUrl + `/${disjunctiveList}`);
        url.searchParams.set("location", this.coordinates.join(","));

        const additionalFilters = this.buildFiltersParameters(filters, "map");
        const paramsQuery = additionalFilters.toString()
            ? `&${decodeURIComponent(additionalFilters.toString())}`
            : "";
        return `${url.toString()}${encodeURI(paramsQuery)}`;
    }

    private buildFilterList(facetsData: {
        facet_groups: Array<{ name: string; facets: Filter[] }>;
    }): { [key: string]: Array<Filter> } {
        const filterList: { [key: string]: Array<Filter> } = {};
        this.FILTERS_ENUM.forEach(filter => {
            const filterGroup = facetsData.facet_groups.find(group => group.name === filter);
            if (filterGroup) {
                filterList[filterGroup.name] = filterGroup.facets;
            }
        });
        return filterList;
    }

    async getFacetsList(): Promise<FacetsRecord> {
        if (this.fallbackModeState()) {
            return firstValueFrom(this.fallback.getFacets(this.FILTERS_ENUM));
        }
        try {
            return await this.fetchFacetsFromApi();
        } catch (apiError) {
            console.warn("Opendata facets API unreachable, switching to fallback data", apiError);
            const facets = await firstValueFrom(this.fallback.getFacets(this.FILTERS_ENUM));
            this.fallbackModeState.set(true);
            return facets;
        }
    }

    private async fetchFacetsFromApi(): Promise<FacetsRecord> {
        const disjunctiveFilters = this.FILTERS_ENUM.map(
            (filter, index) => (index >= 1 ? "&" : "?") + `disjunctive.${filter}=true`
        ).join("");
        const facets = this.FILTERS_ENUM.map(filter => `&facet=${filter}`).join("");
        const facetsSort = this.FILTERS_ENUM.map(filter => `&facetsort.${filter}=alphanum`).join(
            ""
        );

        const url = new URL(this.facetsUrl + disjunctiveFilters + facets + facetsSort);
        url.searchParams.set("dataset", this.datasetId);
        url.searchParams.set("timezone", this.timezone);
        url.searchParams.set("lang", this.language);

        const facetsApiUrl = url.toString();
        const result = await fetch(facetsApiUrl, {
            signal: AbortSignal.timeout(environment.apiTimeout),
        });
        const facetsData = (await result.json()) as {
            facet_groups?: Array<{ name: string; facets: Filter[] }>;
        };
        // An error payload (e.g. 5xx) has no facet_groups: treat it as a failure.
        if (!Array.isArray(facetsData.facet_groups)) {
            throw new Error("Invalid facets response");
        }
        return this.buildFilterList({ facet_groups: facetsData.facet_groups });
    }

    getFilters(): FilterName[] {
        return this.FILTERS_ENUM;
    }
}
