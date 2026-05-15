import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    server: {
        host: "0.0.0.0",     // écoute réseau (LAN)
        port: 5173,
        strictPort: true,
        hmr: {
        host: "10.0.0.168", // ton IP
        port: 5173,
        },
    },
});
