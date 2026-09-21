import globalEslintConfig from '@chriscrat/eslint-config';
const { angular } = globalEslintConfig;

const eslintConfig = [
    ...angular,
    {
        languageOptions: {
            parserOptions: {
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['e2e/**/*.ts', 'playwright.config.ts'],
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'playwright.config.ts',
                        'e2e/home-events-list.spec.ts',
                        'e2e/filter-events.spec.ts',
                        'e2e/event-detail-navigation.spec.ts',
                        'e2e/pagination.spec.ts',
                        'e2e/toggle-list-map-view.spec.ts',
                        'e2e/fixtures/mock-api.ts',
                    ],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];

export default eslintConfig;
