import { Event, FormatedEvent, AccessibilityTagConfig } from "../models/event";

const ACCESSIBILITY_TAGS: AccessibilityTagConfig[] = [
    { key: "pmr", label: "Accès PMR", icon: "wheelchair" },
    { key: "blind", label: "Malvoyant", icon: "eye-off" },
    { key: "deaf", label: "Malentendant", icon: "ear-off" },
    { key: "sign_language", label: "Langue des signes", icon: "sign-language" },
    { key: "mental", label: "Handicap mental", icon: "mental-disabilities" },
];

export function mapEventToCardDetails(event: Event): FormatedEvent {
    return {
        id: event.id,
        title: event.title,
        url: event.url,
        description: event.description,
        date_description: event.date_description,
        cover: {
            url: event.cover_url,
            alt: event.cover_alt,
            credit: event.cover_credit,
        },
        address: {
            name: event.address_name,
            street: event.address_street,
            zipcode: event.address_zipcode,
            city: event.address_city,
        },
        contacts: {
            url: event.contact_url,
            mail: event.contact_mail,
            facebook: event.contact_facebook,
            vimeo: event.contact_vimeo,
            twitter: event.contact_twitter,
            organisation_name: event.contact_organisation_name,
            url_text: event.contact_url_text,
            tiktok: event.contact_tiktok,
            twitch: event.contact_twitch,
            youtube: event.contact_youtube,
            linkedin: event.contact_linkedin,
            whatsapp: event.contact_whatsapp,
            instagram: event.contact_instagram,
        },
        tags: {
            audience: event.audience,
            accessibility: buildAccessibilityTags(event),
            priceType: event.price_type,
        },
    };
}

function buildAccessibilityTags(event: Event): AccessibilityTagConfig[] {
    return ACCESSIBILITY_TAGS.filter(({ key }) => !!event[key] && event[key] === 1);
}
