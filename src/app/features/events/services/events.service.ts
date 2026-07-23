import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { EventListModel } from "../models/event";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class EventsService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.catalogApi}`;

    getEvents(): Observable<EventListModel> {
        return this.http.get<EventListModel>(this.baseUrl);
    }
}
