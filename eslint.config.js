import pluginSecurity from 'eslint-plugin-security';

export default [
    pluginSecurity.configs.recommended,
    {
        files: ["src/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
                console: "readonly",
                location: "readonly",
                localStorage: "readonly",
                sessionStorage: "readonly",
                encodeURIComponent: "readonly",
                decodeURIComponent: "readonly"
            }
        },
        rules: {
            // Enforce the use of ESLint Security Plugin Recommended rules on the src folder.
        }
    }
];
