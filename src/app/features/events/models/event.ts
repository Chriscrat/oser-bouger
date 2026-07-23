export interface EventModel {
    id: string;
    title: string;
    url: string;
    cover_url: string;
}

export interface EventListModel {
    total_count: number;
    results: EventModel[] | null;
}
