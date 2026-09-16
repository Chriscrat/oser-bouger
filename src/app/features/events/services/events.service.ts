import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { EventListModel, EventView } from "../models/event";
import {
    Filter,
    FacetsRecord,
    ActiveFacetsRecord,
    PaginationParams,
    FilterName,
} from "../models/event-filters";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class EventsService {
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
        pagination: PaginationParams
    ): Observable<EventListModel> {
        return this.http.get<EventListModel>(this.eventListUrl, {
            params: this.buildFiltersParameters(filters, "list", pagination),
        });
    }

    getEvent(eventId: string): Observable<EventListModel> {
        const url = new URL(this.eventListUrl);
        url.searchParams.set("where", `id=${eventId}`);
        url.searchParams.set("timezone", "Europe/Paris");
        url.searchParams.set("lang", this.language);

        return this.http.get<EventListModel>(url.toString());
    }

    getCategoryList(): Observable<EventListModel> {
        const field = "qfap_tags";
        const url = new URL(this.eventListUrl);
        url.searchParams.set("select", field);
        url.searchParams.set("group_by", field);
        return this.http.get<EventListModel>(url.toString());
    }

    private buildFiltersParameters(
        filters: ActiveFacetsRecord,
        view: EventView,
        pagination?: PaginationParams
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
        const result = await fetch(facetsApiUrl);
        const facetsData = (await result.json()) as {
            facet_groups: Array<{ name: string; facets: Filter[] }>;
        };
        return this.buildFilterList(facetsData);
    }

    getFilters(): FilterName[] {
        return this.FILTERS_ENUM;
    }
}
