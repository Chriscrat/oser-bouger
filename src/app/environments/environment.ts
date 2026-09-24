const OPENDATA_API_URL = "https://opendata.paris.fr";
export const environment = {
    catalogApi: `${OPENDATA_API_URL}/api/explore/v2.1/catalog/datasets/que-faire-a-paris-/records`,
    mapApi: `${OPENDATA_API_URL}/explore/embed/dataset/que-faire-a-paris-/map`,
    facetsApi: `${OPENDATA_API_URL}/api/records/1.0/search`,
    // Static dataset served when the opendata API is unreachable (see scripts/generate-fallback-events.mjs).
    fallbackDataUrl: "/data/events-fallback.json",
    // Forces the static dataset without even trying the opendata API.
    useFallbackData: false,
    // Delay (ms) after which an unanswered API request switches to the fallback.
    apiTimeout: 5000,
};
