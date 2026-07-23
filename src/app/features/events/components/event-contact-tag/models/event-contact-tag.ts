import { FormatedEvent } from "../../../models/event";
export type EventContactTag = Pick<FormatedEvent, "id" | "title" | "address" | "tags">;
