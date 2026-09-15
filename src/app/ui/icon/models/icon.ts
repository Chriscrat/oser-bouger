export type accessibilityIcons =
    | "accessibility"
    | "ear-off"
    | "mental-disabilities"
    | "sign-language"
    | "wheelchair"
    | "eye-off";
type systemIcons = "external-link";
type arrowsIcons = "arrow-right" | "arrow-left";
type mapIcons = "road-map" | "earth" | "map-pin-2";
type userIcons = "team";
type financeIcons = "money-euro-circle";
type notificationIcons = "checkbox-circle" | "error-warning" | "alert" | "information";
export type socialNetworkIcons =
    | "instagram"
    | "linkedin-box"
    | "snapchat"
    | "twitch"
    | "twitter-x"
    | "vimeo"
    | "whatsapp"
    | "facebook-circle"
    | "tiktok"
    | "youtube"
    | "mail";

type businessIcons = "calendar-event";

export type iconClass =
    | accessibilityIcons
    | systemIcons
    | arrowsIcons
    | mapIcons
    | userIcons
    | financeIcons
    | notificationIcons
    | socialNetworkIcons
    | businessIcons;

export type iconStyle = "fill" | "line";
export type iconSize = "xs" | "md" | "lg";
