import { FormatedEvent } from "../../../models/event";
export type EventCover = Pick<FormatedEvent, "id" | "title" | "date_description" | "cover">;
