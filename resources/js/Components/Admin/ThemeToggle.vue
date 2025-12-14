<script setup>
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Popover from 'primevue/popover';
import { useTheme } from '@/composables/useTheme';

const { isDark, themePreference, setTheme, toggleTheme } = useTheme();

const popoverRef = ref();

const currentIcon = computed(() => {
    if (themePreference.value === 'system') {
        return 'pi pi-desktop';
    }
    return isDark.value ? 'pi pi-moon' : 'pi pi-sun';
});

const currentLabel = computed(() => {
    const labels = {
        light: 'Light',
        dark: 'Dark',
        system: 'System'
    };
    return labels[themePreference.value] || 'System';
});

const themeOptions = [
    { key: 'light', label: 'Light', icon: 'pi pi-sun' },
    { key: 'dark', label: 'Dark', icon: 'pi pi-moon' },
    { key: 'system', label: 'System', icon: 'pi pi-desktop' }
];

function togglePopover(event) {
    popoverRef.value.toggle(event);
}

function selectTheme(theme) {
    setTheme(theme);
    popoverRef.value.hide();
}
</script>

<template>
    <Button
        :icon="currentIcon"
        @click="togglePopover"
        text
        rounded
        severity="secondary"
        v-tooltip.bottom="currentLabel"
        aria-label="Theme options"
        aria-haspopup="true"
    />

    <Popover ref="popoverRef">
        <div class="flex flex-col gap-1 p-2 min-w-36">
            <Button
                v-for="option in themeOptions"
                :key="option.key"
                :icon="option.icon"
                :label="option.label"
                @click="selectTheme(option.key)"
                text
                size="small"
                class="justify-start w-full"
                :class="themePreference === option.key ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : ''"
            />
        </div>
    </Popover>
</template>
