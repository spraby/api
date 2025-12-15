import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createApp, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';

// PrimeVue
import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import 'primeicons/primeicons.css';

// Custom PrimeVue theme preset with Indigo as primary color and Slate surfaces
const SprabyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        },
        colorScheme: {
            light: {
                surface: {
                    0: '#ffffff',
                    50: '{slate.50}',
                    100: '{slate.100}',
                    200: '{slate.200}',
                    300: '{slate.300}',
                    400: '{slate.400}',
                    500: '{slate.500}',
                    600: '{slate.600}',
                    700: '{slate.700}',
                    800: '{slate.800}',
                    900: '{slate.900}',
                    950: '{slate.950}'
                }
            },
            dark: {
                surface: {
                    0: '{slate.900}',
                    50: '{slate.800}',
                    100: '{slate.700}',
                    200: '{slate.600}',
                    300: '{slate.500}',
                    400: '{slate.400}',
                    500: '{slate.300}',
                    600: '{slate.200}',
                    700: '{slate.100}',
                    800: '{slate.50}',
                    900: '#ffffff',
                    950: '#ffffff'
                }
            }
        }
    }
});

// Theme initialization (prevents flash of unstyled content)
import { initTheme } from './composables/useTheme';
initTheme();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob('./Pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) });

        app.use(plugin)
            .use(ZiggyVue)
            .use(PrimeVue, {
                theme: {
                    preset: SprabyPreset,
                    options: {
                        // Enable dark mode with .dark class selector
                        darkModeSelector: '.dark'
                    }
                }
            })
            .use(ToastService)
            .use(ConfirmationService);

        // Директивы PrimeVue
        app.directive('tooltip', Tooltip);

        return app.mount(el);
    },
    progress: {
        color: '#6366f1',
    },
});
