import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { EventListModel } from "../models/event";
import { EventFilters, PaginationParams } from "../models/event-filters";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class EventsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.catalogApi}`;

    getEvents(filters: EventFilters, pagination: PaginationParams): Observable<EventListModel> {
        return this.http.get<EventListModel>(this.baseUrl, {
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
}
