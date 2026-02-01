import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import eslint from '@nabla/vite-plugin-eslint';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/admin.css',
                'resources/js/admin/app.tsx',
            ],
            refresh: true,
        }),
        react({
            jsxRuntime: 'automatic',
        }),
        tailwindcss(),
        eslint({
            eslintOptions: {
                cache: true,
            },
            shouldLint: (path) => path.includes('resources/js/admin/'),
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js/admin'),
        },
    },
});
