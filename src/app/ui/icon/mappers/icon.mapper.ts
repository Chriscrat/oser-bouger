import { iconSize } from "../models/icon"; 

const ICON_CLASS_SIZE: Record<iconSize, string> = {
    xs: 'sm',
    md: 'md',
    lg: 'lg'
};

export function buildIconClassSize(size: iconSize): string {
    return ICON_CLASS_SIZE[size];
}
