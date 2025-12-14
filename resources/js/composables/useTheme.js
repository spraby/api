import { ref, watch, onMounted } from 'vue';
import { useLocalStorage, usePreferredDark } from '@vueuse/core';

const THEME_KEY = 'spraby_admin_theme';

// Possible values: 'light', 'dark', 'system'
const themePreference = useLocalStorage(THEME_KEY, 'system');

// Track actual applied theme
const isDark = ref(false);

// System preference
const prefersDark = usePreferredDark();

/**
 * Composable for managing theme (light/dark mode)
 */
export function useTheme() {
    /**
     * Apply theme to document
     */
    function applyTheme(dark) {
        // Add transition class for smooth animation
        document.documentElement.classList.add('theme-transition');

        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        isDark.value = dark;

        // Remove transition class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transition');
        }, 300);
    }

    /**
     * Update theme based on preference
     */
    function updateTheme() {
        const preference = themePreference.value;

        if (preference === 'system') {
            applyTheme(prefersDark.value);
        } else {
            applyTheme(preference === 'dark');
        }
    }

    /**
     * Set theme preference
     * @param {'light' | 'dark' | 'system'} value
     */
    function setTheme(value) {
        themePreference.value = value;
        updateTheme();
    }

    /**
     * Toggle between light and dark
     * If system mode, switches to opposite of current
     */
    function toggleTheme() {
        if (themePreference.value === 'system') {
            // Switch to opposite of current system preference
            setTheme(prefersDark.value ? 'light' : 'dark');
        } else {
            // Toggle between light and dark
            setTheme(themePreference.value === 'dark' ? 'light' : 'dark');
        }
    }

    /**
     * Cycle through: light -> dark -> system
     */
    function cycleTheme() {
        const cycle = {
            light: 'dark',
            dark: 'system',
            system: 'light'
        };
        setTheme(cycle[themePreference.value] || 'light');
    }

    // Watch for system preference changes (only when in system mode)
    watch(prefersDark, () => {
        if (themePreference.value === 'system') {
            updateTheme();
        }
    });

    // Initialize theme on mount
    onMounted(() => {
        // Apply theme immediately without transition on first load
        const preference = themePreference.value;
        const shouldBeDark = preference === 'system'
            ? prefersDark.value
            : preference === 'dark';

        if (shouldBeDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        isDark.value = shouldBeDark;
    });

    return {
        isDark,
        themePreference,
        setTheme,
        toggleTheme,
        cycleTheme,
        updateTheme
    };
}

/**
 * Initialize theme before Vue mounts (prevents flash)
 * Call this in app.js before createInertiaApp
 */
export function initTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    let preference = 'system';

    if (stored) {
        try {
            // useLocalStorage saves as JSON string (e.g., "system" with quotes)
            preference = JSON.parse(stored);
        } catch {
            // Fallback for plain string values (e.g., system without quotes)
            preference = stored;
        }
    }

    const prefersDarkMedia = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = preference === 'system'
        ? prefersDarkMedia
        : preference === 'dark';

    if (shouldBeDark) {
        document.documentElement.classList.add('dark');
    }
}

export default useTheme;
