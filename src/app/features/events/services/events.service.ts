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
    private http = inject(HttpClient);
    private eventListUrl = `${environment.catalogApi}`;
    private mapUrl = `${environment.mapApi}`;
    private facetsUrl = `${environment.facetsApi}`;
    private FILTERS_ENUM: FilterName[] = ["address_name", "address_zipcode", "address_city"];
    getEvents(
        filters: ActiveFacetsRecord,
        pagination: PaginationParams
    ): Observable<EventListModel> {
        return this.http.get<EventListModel>(this.eventListUrl, {
            params: this.buildParams(filters, "list", pagination),
        });
    }

    private buildParams(
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
        }
        return params;
    }

    getEventsMap(filters: ActiveFacetsRecord) {
        const additionalFilters = this.buildParams(filters, "map");
        const paramsQuery = additionalFilters.toString()
            ? `&${decodeURIComponent(additionalFilters.toString())}`
            : "";
        const disjunctiveList =
            "?disjunctive.tags&disjunctive.address_name&disjunctive.address_zipcode&disjunctive.address_city&disjunctive.pmr&disjunctive.blind&disjunctive.deaf&disjunctive.price_type&disjunctive.access_type&disjunctive.programs";
        const location = "&location=9,48.73355,2.45819";
        return encodeURI(`${this.mapUrl}/${disjunctiveList}${location}${paramsQuery}`);
    }

    private buildFacetsApiUrl(): string {
        const disjunctiveFilters = this.FILTERS_ENUM.map(
            (filter, index) => (index >= 1 ? "&" : "?") + `disjunctive.${filter}=true`
        ).join("");
        const facets = "&facet=tags&facet=address_name&facet=address_zipcode&facet=address_city";
        const facetsSort =
            "&facetsort.tags=alphanum&facetsort.address_name=alphanum&facetsort.address_zipcode=alphanum&facetsort.address_city=alphanum";
        const dataset = "&dataset=que-faire-a-paris-";
        const timezone = "&timezone=Europe%2FParis";
        const language = "&lang=fr";

        return `${this.facetsUrl}${disjunctiveFilters}${facets}${facetsSort}${dataset}${timezone}${language}`;
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
        const facetsApiUrl = this.buildFacetsApiUrl();
        const result = await fetch(facetsApiUrl);
        const facetsData = (await result.json()) as {
            facet_groups: Array<{ name: string; facets: Filter[] }>;
        };
        return this.buildFilterList(facetsData);
    }
}
