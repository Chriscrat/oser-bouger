import { Component, input, computed } from "@angular/core";
import { EventContact as EventContactModel } from "./models/event-contact-social";
import { Tag } from "../../../../ui/tag/components/tag";
import { Icon } from "../../../../ui/icon/components/icon";
import { iconClass } from "../../../../ui/icon/models/icon";

@Component({
    selector: "app-event-contact-social",
    imports: [Tag, Icon],
    standalone: true,
    templateUrl: "./event-contact-social.html",
    styleUrl: "./event-contact-social.scss",
})
export class EventContactSocial {
    contacts = input.required<EventContactModel>();
    protected readonly mailContact = computed(() => `mailto:${this.contacts()?.mail}`);
    private readonly SOCIAL_NETWORKS: {
        key: keyof NonNullable<EventContactModel>;
        icon: iconClass;
        label: string;
    }[] = [
        { key: "twitter", icon: "twitter-x", label: "Twitter X" },
        { key: "linkedin", icon: "linkedin-box", label: "LinkedIn" },
        { key: "instagram", icon: "instagram", label: "Instagram" },
        { key: "facebook", icon: "facebook-circle", label: "Facebook" },
        { key: "tiktok", icon: "tiktok", label: "TikTok" },
        { key: "vimeo", icon: "vimeo", label: "Vimeo" },
        { key: "whatsapp", icon: "whatsapp", label: "WhatsApp" },
        { key: "youtube", icon: "youtube", label: "YouTube" },
    ];
    socialLinks = computed(() => {
        const contacts = this.contacts();
        if (!contacts) {
            return [];
        }
        return this.SOCIAL_NETWORKS.filter(({ key }) => contacts[key]).map(
            ({ key, icon, label }) => ({ icon, label, url: contacts[key]! })
        );
    });
}
