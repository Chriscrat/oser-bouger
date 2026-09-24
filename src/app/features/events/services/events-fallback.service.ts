import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, map, shareReplay } from "rxjs";

import { CategoryListModel, Event, EventListModel } from "../models/event";
import {
    ActiveFacetsRecord,
    FacetsRecord,
    Filter,
    FilterName,
    PaginationParams,
    TagsModel,
} from "../models/event-filters";
import { environment } from "../../../environments/environment";

/**
 * Serves the static dataset (public/data/events-fallback.json) with the same contract
 * as the opendata API, so EventsService can switch to it transparently.
 */
@Injectable({ providedIn: "root" })
export class EventsFallbackService {
    private http = inject(HttpClient);

    // Loaded once, lazily; shareReplay resets on error so a failed load can be retried.
    private dataset$: Observable<Event[]> = this.http
        .get<EventListModel>(environment.fallbackDataUrl)
        .pipe(
            map(response => response.results ?? []),
            shareReplay(1)
        );

    getEvents(
        filters: ActiveFacetsRecord,
        pagination: PaginationParams,
        tags: TagsModel
    ): Observable<EventListModel> {
        return this.dataset$.pipe(
            map(events => {
                const matchingEvents = events.filter(
                    event => this.matchesFilters(event, filters) && this.matchesTags(event, tags)
                );
                return {
                    total_count: matchingEvents.length,
                    results: matchingEvents.slice(
                        pagination.offset,
                        pagination.offset + pagination.limit
                    ),
                };
            })
        );
    }

    getEvent(eventId: string): Observable<EventListModel> {
        return this.dataset$.pipe(
            map(events => {
                const results = events.filter(event => event.id === eventId);
                return { total_count: results.length, results };
            })
        );
    }

    /** Mirrors `select=qfap_tags&group_by=qfap_tags`: one row per distinct tag combination. */
    getCategoryList(): Observable<CategoryListModel> {
        return this.dataset$.pipe(
            map(events => {
                const distinctTags = [
                    ...new Set(
                        events
                            .map(event => event.qfap_tags)
                            .filter((tags): tags is string => !!tags)
                    ),
                ];
                return {
                    total_count: distinctTags.length,
                    results: distinctTags.map(qfapTags => ({ qfap_tags: qfapTags })),
                };
            })
        );
    }

    getFacets(filterNames: FilterName[]): Observable<FacetsRecord> {
        return this.dataset$.pipe(
            map(events =>
                Object.fromEntries(
                    filterNames.map(filterName => [filterName, this.countFacet(events, filterName)])
                )
            )
        );
    }

    /** AND between facets, OR between the values of a same facet. */
    private matchesFilters(event: Event, filters: ActiveFacetsRecord): boolean {
        return (Object.keys(filters) as FilterName[]).every(filterName => {
            const values = filters[filterName] ?? [];
            return values.length === 0 || values.includes(String(event[filterName] ?? ""));
        });
    }

    /** Mimics ODSQL `field like 'value'`: case-insensitive "contains", OR within a tag, AND across tags. */
    private matchesTags(event: Event, tags: TagsModel): boolean {
        return (Object.keys(tags) as (keyof TagsModel)[]).every(tagName => {
            const values = tags[tagName];
            const fieldValue = (event[tagName] ?? "").toLowerCase();
            return (
                values.length === 0 ||
                values.some(value => fieldValue.includes(value.toLowerCase()))
            );
        });
    }

    private countFacet(events: Event[], filterName: FilterName): Filter[] {
        const counts = events.reduce((facetCounts, event) => {
            const value = event[filterName];
            if (value === null || value === undefined || value === "") {
                return facetCounts;
            }
            const name = String(value);
            return facetCounts.set(name, (facetCounts.get(name) ?? 0) + 1);
        }, new Map<string, number>());

        return [...counts.entries()]
            .sort(([nameA], [nameB]) => nameA.localeCompare(nameB, "fr", { numeric: true }))
            .map(([name, count]) => ({ name, active: true, count }));
    }
}
