import { FormatedEvent } from "../../../models/event";
export type EventDetails = Pick<
    FormatedEvent,
    "id" | "title" | "description" | "contacts" | "address" | "tags"
>;

export type EventContacts = Pick<EventDetails, "contacts">;
