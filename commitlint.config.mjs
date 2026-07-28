export default {
    extends: ["@commitlint/config-conventional"],
    rules: {
        "scope-enum": [
            2,
            "always",
            [
                "app",
                "layout",
                "home",
                "architecture",
                "ui",
                "event-list",
                "events",
                "card",
                "map",
                "filters",
                "build",
            ],
        ],
    },
};
