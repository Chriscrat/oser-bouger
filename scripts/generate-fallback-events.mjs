/**
 * Generates the static fallback dataset used when the opendata API is unreachable.
 * Deterministic (seeded PRNG): running it twice produces the same file.
 *
 * Usage: node scripts/generate-fallback-events.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const EVENT_COUNT = 200;
const SEED = 20260924;
const OUTPUT_PATH = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "public",
    "data",
    "events-fallback.json"
);

/** mulberry32: tiny deterministic PRNG returning floats in [0, 1). */
function createRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const random = createRandom(SEED);
const pick = list => list[Math.floor(random() * list.length)];
const chance = probability => random() < probability;
const pickMany = (list, count) =>
    [...list]
        .map(item => ({ item, weight: random() }))
        .sort((a, b) => a.weight - b.weight)
        .slice(0, count)
        .map(({ item }) => item);

const VENUES = [
    { name: "Forum des Halles", street: "101 porte Berger", zipcode: "75001", city: "Paris" },
    { name: "Jardin des Tuileries", street: "113 rue de Rivoli", zipcode: "75001", city: "Paris" },
    { name: "Bibliothèque Charlotte Delbo", street: "2 passage des Petits-Pères", zipcode: "75002", city: "Paris" },
    { name: "Carreau du Temple", street: "4 rue Eugène Spuller", zipcode: "75003", city: "Paris" },
    { name: "Maison Européenne de la Photographie", street: "5/7 rue de Fourcy", zipcode: "75004", city: "Paris" },
    { name: "Bibliothèque Forney", street: "1 rue du Figuier", zipcode: "75004", city: "Paris" },
    { name: "Jardin des Plantes", street: "57 rue Cuvier", zipcode: "75005", city: "Paris" },
    { name: "Bibliothèque André Malraux", street: "112 rue de Rennes", zipcode: "75006", city: "Paris" },
    { name: "Champ-de-Mars", street: "2 allée Adrienne Lecouvreur", zipcode: "75007", city: "Paris" },
    { name: "Petit Palais", street: "Avenue Winston Churchill", zipcode: "75008", city: "Paris" },
    { name: "Square d'Anvers", street: "Place d'Anvers", zipcode: "75009", city: "Paris" },
    { name: "Canal Saint-Martin", street: "Quai de Valmy", zipcode: "75010", city: "Paris" },
    { name: "Maison des Métallos", street: "94 rue Jean-Pierre Timbaud", zipcode: "75011", city: "Paris" },
    { name: "Bois de Vincennes", street: "Route de la Pyramide", zipcode: "75012", city: "Paris" },
    { name: "Bibliothèque Marguerite Durand", street: "79 rue Nationale", zipcode: "75013", city: "Paris" },
    { name: "Parc Montsouris", street: "2 rue Gazan", zipcode: "75014", city: "Paris" },
    { name: "Parc André Citroën", street: "2 rue Cauchy", zipcode: "75015", city: "Paris" },
    { name: "Maison de Balzac", street: "47 rue Raynouard", zipcode: "75016", city: "Paris" },
    { name: "Parc Clichy-Batignolles – Martin Luther King", street: "147 rue Cardinet", zipcode: "75017", city: "Paris" },
    { name: "Le Hasard Ludique", street: "128 avenue de Saint-Ouen", zipcode: "75018", city: "Paris" },
    { name: "Centquatre-Paris", street: "5 rue Curial", zipcode: "75019", city: "Paris" },
    { name: "Parc des Buttes-Chaumont", street: "1 rue Botzaris", zipcode: "75019", city: "Paris" },
    { name: "Pavillon Carré de Baudouin", street: "121 rue de Ménilmontant", zipcode: "75020", city: "Paris" },
    { name: "Parc de Belleville", street: "47 rue des Couronnes", zipcode: "75020", city: "Paris" },
    { name: "Parc des Beaumonts", street: "Rue Paul Doumer", zipcode: "93100", city: "Montreuil" },
    { name: "Basilique Saint-Denis", street: "1 rue de la Légion d'Honneur", zipcode: "93200", city: "Saint-Denis" },
    { name: "Château de Vincennes", street: "Avenue de Paris", zipcode: "94300", city: "Vincennes" },
    { name: "Île Seguin", street: "Pont Renault", zipcode: "92100", city: "Boulogne-Billancourt" },
    { name: "Parc Henri Barbusse", street: "Rue du Général Leclerc", zipcode: "92130", city: "Issy-les-Moulineaux" },
];

const CATEGORIES = [
    "Concert",
    "Expo",
    "Théâtre",
    "Cinéma",
    "Enfants",
    "Sport",
    "Balade urbaine",
    "Atelier",
    "Conférence",
    "Festival",
    "Danse",
    "Humour",
    "Loisirs",
    "Nature",
    "Littérature",
    "Solidarité",
    "Street-art",
    "Brocante",
    "Salon",
    "Musique",
];

const TITLE_PREFIXES = {
    Concert: ["Concert", "Récital", "Live", "Showcase"],
    Expo: ["Exposition", "Rétrospective", "Accrochage"],
    Théâtre: ["Pièce", "Lecture théâtralisée", "Création"],
    Cinéma: ["Projection", "Ciné-débat", "Cinéma en plein air"],
    Enfants: ["Spectacle jeune public", "Heure du conte", "Ciné-goûter"],
    Sport: ["Initiation", "Tournoi", "Course", "Séance"],
    "Balade urbaine": ["Balade", "Visite guidée", "Promenade"],
    Atelier: ["Atelier", "Stage", "Masterclass"],
    Conférence: ["Conférence", "Rencontre", "Table ronde"],
    Festival: ["Festival", "Nuit", "Week-end"],
    Danse: ["Bal", "Spectacle de danse", "Cours ouvert"],
    Humour: ["Stand-up", "Plateau d'humour", "One-woman-show"],
    Loisirs: ["Soirée jeux", "Quiz", "Karaoké"],
    Nature: ["Découverte", "Sortie nature", "Observation"],
    Littérature: ["Lecture", "Rencontre d'auteur", "Club de lecture"],
    Solidarité: ["Collecte", "Repair café", "Journée solidaire"],
    "Street-art": ["Parcours street-art", "Fresque participative"],
    Brocante: ["Brocante", "Vide-grenier", "Troc"],
    Salon: ["Salon", "Marché", "Foire"],
    Musique: ["Jam session", "Chorale", "Scène ouverte"],
};

const TITLE_SUBJECTS = [
    "des Lumières",
    "d'automne",
    "sous les étoiles",
    "au bord de l'eau",
    "en famille",
    "des quartiers",
    "du monde",
    "électro",
    "jazz manouche",
    "baroque",
    "zéro déchet",
    "des petits curieux",
    "numérique",
    "de la biodiversité",
    "photo argentique",
    "hip-hop",
    "de la BD",
    "des années 80",
    "au jardin",
    "à la tombée de la nuit",
];

const LONG_TITLES = [
    "Grande nuit exceptionnelle des musiques improvisées, des arts de la rue et des pratiques amateurs réunies autour d'un même plateau pendant plus de douze heures consécutives",
    "Cycle de conférences : « Comprendre la ville de demain – mobilités, climat, logement et participation citoyenne à l'échelle de la métropole du Grand Paris »",
    "Exposition collective « Regards croisés » : photographies, installations sonores et vidéos d'artistes émergents issus des ateliers municipaux de la Ville",
];

const AUDIENCES = [
    "Tout public.",
    "Public adultes.",
    "Public jeunes et adultes.",
    "Public enfants. A partir de 3 ans jusqu'à 10 ans.",
    "Public jeunes. A partir de 12 ans jusqu'à 17 ans.",
    "Public seniors.",
    "Tout public. A partir de 6 ans.",
];

const PRICE_TYPES = ["gratuit", "payant", "gratuit sous condition"];

const PRICE_DETAILS = {
    gratuit: ["", "Entrée libre dans la limite des places disponibles.", "Gratuit, sans réservation."],
    payant: [
        "Plein tarif : 15 €<br>Tarif réduit : 10 €",
        "De 5 € à 25 €",
        "12 € / 8 € (étudiants, demandeurs d'emploi)",
        "Tarif unique : 7 €",
    ],
    "gratuit sous condition": [
        "Gratuit sur réservation obligatoire.",
        "Gratuit pour les moins de 26 ans, 5 € pour les autres.",
        "Gratuit pour les habitants de l'arrondissement sur présentation d'un justificatif.",
    ],
};

const ORGANISATIONS = [
    "Ville de Paris",
    "Bibliothèques de Paris",
    "Paris Musées",
    "Association Les Voisins d'à côté",
    "Collectif Rues Vivantes",
    "Compagnie du Petit Pont",
    "Maison des associations",
    "Paris Sport Loisirs",
];

const DESCRIPTION_SNIPPETS = [
    "<p>Un rendez-vous convivial ouvert à toutes et à tous, pensé pour découvrir le quartier autrement.</p>",
    "<p>Venez partager un moment <strong>unique</strong> avec des artistes locaux et des habitants passionnés.</p>",
    "<p>Au programme :</p><ul><li>accueil et présentation</li><li>temps d'échange</li><li>verre de l'amitié</li></ul>",
    "<p>Pensez à réserver, les places sont limitées. Plus d'informations sur <a href=\"https://example.org\">le site de l'organisateur</a>.</p>",
    "<p>L'événement se tient en extérieur : en cas de pluie, il est déplacé dans la salle polyvalente voisine.</p>",
    "<p>Matériel fourni sur place. Aucune connaissance préalable n'est requise.</p>",
    "<p>Une proposition accessible, bienveillante et pleine d'énergie pour petits et grands.</p>",
];

const MONTHS = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
];
const WEEKDAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

// From ~3 months in the past to ~6 months in the future relative to 2026-09-24,
// so both past and upcoming events are represented.
const DATE_RANGE_START = Date.UTC(2026, 5, 20);
const DATE_RANGE_END = Date.UTC(2027, 2, 31);
const DAY_MS = 86400000;
const SLOT_HOURS = [10, 11, 14, 15, 18, 19, 20, 21];

function slugify(value) {
    return value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 60);
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function formatDateLabel(date) {
    return `${WEEKDAYS[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function buildDate(index) {
    const day = Math.floor(random() * ((DATE_RANGE_END - DATE_RANGE_START) / DAY_MS));
    const date = new Date(DATE_RANGE_START + day * DAY_MS);
    const hour = pick(SLOT_HOURS);
    const endHour = hour + 1 + Math.floor(random() * 3);
    const dateStart = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(hour)}:00:00+02:00`;

    // Every 10th event spans several days to exercise multi-line date descriptions.
    if (index % 10 === 0) {
        const end = new Date(date.getTime() + (2 + Math.floor(random() * 20)) * DAY_MS);
        return {
            dateStart,
            dateDescription: `Du ${formatDateLabel(date)} au ${formatDateLabel(end)}<br />du lundi au vendredi de ${hour}h00 à ${endHour}h00`,
        };
    }
    return {
        dateStart,
        dateDescription: `Le ${formatDateLabel(date)}<br />de ${hour}h00 à ${endHour}h00`,
    };
}

/** Cycles through all 32 accessibility combinations for the first 64 events, then randomizes. */
function buildAccessibility(index) {
    const keys = ["pmr", "blind", "deaf", "sign_language", "mental"];
    if (index < 64) {
        const mask = index % 32;
        const unsetValue = index < 32 ? 0 : null;
        return Object.fromEntries(keys.map((key, bit) => [key, mask & (1 << bit) ? 1 : unsetValue]));
    }
    return Object.fromEntries(keys.map(key => [key, chance(0.35) ? 1 : pick([0, null])]));
}

/** Rotates between empty, partial and complete contact sets. */
function buildContacts(index, slug) {
    const empty = {
        contact_url: null,
        contact_mail: null,
        contact_facebook: null,
        contact_vimeo: null,
        contact_twitter: null,
        contact_organisation_name: null,
        contact_url_text: null,
        contact_tiktok: null,
        contact_twitch: null,
        contact_youtube: null,
        contact_linkedin: null,
        contact_whatsapp: null,
        contact_instagram: null,
    };
    const variant = index % 4;
    if (variant === 0) {
        return empty;
    }
    const partial = {
        ...empty,
        contact_url: `https://example.org/evenements/${slug}`,
        contact_url_text: "Réserver",
        contact_organisation_name: pick(ORGANISATIONS),
        contact_mail: chance(0.6) ? `contact+${index}@example.org` : null,
        contact_instagram: chance(0.5) ? `https://www.instagram.com/example${index}` : null,
    };
    if (variant !== 3) {
        return partial;
    }
    return {
        ...partial,
        contact_mail: `contact+${index}@example.org`,
        contact_facebook: `https://www.facebook.com/example${index}`,
        contact_vimeo: `https://vimeo.com/example${index}`,
        contact_twitter: `https://x.com/example${index}`,
        contact_tiktok: `https://www.tiktok.com/@example${index}`,
        contact_twitch: `https://www.twitch.tv/example${index}`,
        contact_youtube: `https://www.youtube.com/@example${index}`,
        contact_linkedin: `https://www.linkedin.com/company/example${index}`,
        contact_whatsapp: `https://wa.me/33600000${pad(index % 100)}`,
        contact_instagram: `https://www.instagram.com/example${index}`,
    };
}

function buildAddress(index) {
    // ~4% of events have no address at all (online or venue to be announced).
    if (index % 25 === 7) {
        return { address_name: null, address_street: null, address_zipcode: null, address_city: null };
    }
    const venue = pick(VENUES);
    return {
        address_name: venue.name,
        address_street: venue.street,
        address_zipcode: venue.zipcode,
        address_city: venue.city,
    };
}

function buildTags(index) {
    // Every 20th event has no category, to exercise the empty-tags case.
    if (index % 20 === 13) {
        return { mainCategory: pick(CATEGORIES), qfapTags: null };
    }
    const tags = pickMany(CATEGORIES, 1 + Math.floor(random() * 3));
    return { mainCategory: tags[0], qfapTags: tags.join(";") };
}

function buildCover(id, title) {
    const roll = random();
    // ~5% without cover at all, then a few with missing alt or credit.
    if (roll < 0.05) {
        return { cover_url: null, cover_alt: null, cover_credit: null };
    }
    return {
        cover_url: `https://picsum.photos/seed/oser-bouger-${id}/800/450`,
        cover_alt: roll < 0.12 ? null : `Illustration de l'événement « ${title} »`,
        cover_credit:
            roll < 0.2 ? null : pick(["Ville de Paris", "DR", "Picsum Photos", "Collectif Rues Vivantes"]),
    };
}

function buildDescription(index) {
    // A few very long descriptions to test truncation.
    const snippetCount =
        index % 15 === 4 ? DESCRIPTION_SNIPPETS.length * 2 : 1 + Math.floor(random() * 3);
    return Array.from({ length: snippetCount }, () => pick(DESCRIPTION_SNIPPETS)).join("");
}

function buildEvent(index) {
    const id = String(90001 + index);
    const { mainCategory, qfapTags } = buildTags(index);
    const title =
        index % 40 === 17
            ? LONG_TITLES[Math.floor(index / 40) % LONG_TITLES.length]
            : `${pick(TITLE_PREFIXES[mainCategory])} ${pick(TITLE_SUBJECTS)}`;
    const slug = slugify(title);
    const priceType = PRICE_TYPES[index % PRICE_TYPES.length];
    const { dateStart, dateDescription } = buildDate(index);

    return {
        id,
        title,
        url: `https://example.org/evenements/${id}/${slug}`,
        description: buildDescription(index),
        ...buildCover(id, title),
        date_description: dateDescription,
        date_start: dateStart,
        audience: pick(AUDIENCES),
        price_type: priceType,
        price_detail: pick(PRICE_DETAILS[priceType]),
        qfap_tags: qfapTags,
        ...buildAccessibility(index),
        ...buildAddress(index),
        ...buildContacts(index, slug),
    };
}

const events = Array.from({ length: EVENT_COUNT }, (_, index) => buildEvent(index)).sort((a, b) =>
    a.date_start.localeCompare(b.date_start)
);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(
    OUTPUT_PATH,
    `${JSON.stringify({ total_count: events.length, results: events }, null, 4)}\n`
);

console.log(`${events.length} events written to ${OUTPUT_PATH}`);
