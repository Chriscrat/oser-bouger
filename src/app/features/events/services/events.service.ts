import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { EventListModel } from "../models/event";
import { EventFilters, PaginationParams } from "../models/event-filters";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class EventsService {
    private http = inject(HttpClient);
    private eventListUrl = `${environment.catalogApi}`;
    private mapUrl = `${environment.mapApi}`;

    getEvents(filters: EventFilters, pagination: PaginationParams): Observable<EventListModel> {
        return this.http.get<EventListModel>(this.eventListUrl, {
            params: this.buildParams(filters, pagination),
        });
    }

    private buildParams(filters: EventFilters, pagination?: PaginationParams): HttpParams {
        let params = new HttpParams();

        if (filters.category) params = params.set("category", filters.category);
        if (filters.dateFrom) params = params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params = params.set("dateTo", filters.dateTo);
        if (filters.bounds) {
            params = params
                .set("north", filters.bounds.north)
                .set("south", filters.bounds.south)
                .set("east", filters.bounds.east)
                .set("west", filters.bounds.west);
        }
        if (pagination) {
            params = params.set("limit", pagination.limit);
        }

        return params;
    }

    getEventsMap() {
        const disjunctiveList =
            "?disjunctive.tags&disjunctive.address_name&disjunctive.address_zipcode&disjunctive.address_city&disjunctive.pmr&disjunctive.blind&disjunctive.deaf&disjunctive.price_type&disjunctive.access_type&disjunctive.programs";
        const location = "&location=9,48.73355,2.45819";
        return encodeURI(`${this.mapUrl}/${disjunctiveList}${location}`);
    }
}
