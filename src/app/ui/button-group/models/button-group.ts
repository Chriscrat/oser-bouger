export interface button {
    text: string;
    value: string;
    checked?: boolean;
}

export interface ButtonGroupModel {
    title: string | null;
    clickAction: (value: string) => void;
    buttons: button[];
}
