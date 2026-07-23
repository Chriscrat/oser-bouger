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
];

export default eslintConfig;
