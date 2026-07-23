import { accessibilityIcons } from "../../../ui/icon/models/icon";

export interface Event {
    id: string;
    title: string;
    url: string;
    description: string;
    cover_url: string;
    cover_alt: string;
    cover_credit: string;
    date_description: string;
    audience: string;
    price_type: string;
    pmr: number | null;
    blind: number | null;
    deaf: number | null;
    sign_language: number | null;
    mental: number | null;
    address_name: string | null;
    address_street: string | null;
    address_zipcode: string | null;
    address_city: string | null;
    contact_url: string | null;
    contact_mail: string | null;
    contact_facebook: string | null;
    contact_vimeo: string | null;
    contact_twitter: string | null;
    contact_organisation_name: string | null;
    contact_url_text: string | null;
    contact_tiktok: string | null;
    contact_twitch: string | null;
    contact_youtube: string | null;
    contact_linkedin: string | null;
    contact_whatsapp: string | null;
    contact_instagram: string | null;
}

export interface EventListModel {
    total_count: number;
    results: Event[] | null;
}

export interface AccessibilityTagConfig {
    key: keyof Pick<Event, "pmr" | "blind" | "deaf" | "sign_language" | "mental">;
    label: string;
    icon: accessibilityIcons;
}

export type FormatedEvent = Pick<
    Event,
    "id" | "title" | "description" | "url" | "date_description"
> & {
    cover?: {
        url: string | null;
        alt: string | null;
        credit: string | null;
    } | null;
    address?: {
        name: string | null;
        street: string | null;
        zipcode: string | null;
        city: string | null;
    };
    contacts?: {
        url: string | null;
        mail: string | null;
        facebook: string | null;
        vimeo: string | null;
        twitter: string | null;
        organisation_name: string | null;
        url_text: string | null;
        tiktok: string | null;
        twitch: string | null;
        youtube: string | null;
        linkedin: string | null;
        whatsapp: string | null;
        instagram: string | null;
    };
    tags?: {
        ["audience"]: string | null;
        ["accessibility"]: AccessibilityTagConfig[] | [];
        ["priceType"]: string | null;
    } | null;
};

export type EventView = "list" | "map";
