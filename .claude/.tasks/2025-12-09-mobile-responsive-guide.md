# Руководство по мобильной адаптации админ-панели

Дата: 2025-12-09

## Реализованные возможности

### Адаптивный Layout (AdminLayout.vue)

**Desktop режим (≥768px):**
- Фиксированный sidebar слева
- Сворачиваемое меню (w-72 ↔ w-20)
- Полная видимость элементов навигации

**Mobile режим (<768px):**
- Скрытый desktop sidebar
- PrimeVue Sidebar (overlay) с кнопкой hamburger
- Автоматическое закрытие при выборе пункта меню
- Полноэкранный контент

### Breakpoints Tailwind CSS

```
sm:  640px  - small devices
md:  768px  - tablets (наш основной breakpoint)
lg:  1024px - laptops
xl:  1280px - desktops
```

### Адаптивные компоненты

#### Header
- `px-4 md:px-6` - отступы
- `py-3 md:py-4` - padding
- `gap-2 md:gap-4` - расстояния между элементами
- Скрытие имени пользователя на малых экранах (`hidden lg:inline`)

#### Content Area
- `p-4 md:p-6 lg:p-8` - прогрессивные отступы
- `ml-0` на мобильных (полная ширина)
- `md:ml-72` или `md:ml-20` на десктопе

#### Dashboard Grid
```
grid-cols-1          (mobile)
sm:grid-cols-2       (≥640px)
lg:grid-cols-3       (≥1024px)
xl:grid-cols-4       (≥1280px)
```

### Размеры текста

```vue
<!-- Заголовки -->
<h1 class="text-xl md:text-2xl">

<!-- Обычный текст -->
<p class="text-sm md:text-base">

<!-- Иконки -->
<i class="text-xl md:text-2xl"></i>
```

## Тестирование

### Chrome DevTools
1. Открыть DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Выбрать устройство или указать размер

### Рекомендуемые размеры для тестирования
- iPhone SE: 375×667
- iPhone 12 Pro: 390×844
- iPad: 768×1024
- Desktop: 1920×1080

## Best Practices

### 1. Mobile First
Начинайте дизайн с мобильной версии, затем добавляйте breakpoints:
```vue
<div class="p-4 md:p-6 lg:p-8">
```

### 2. Touch Targets
Минимум 44×44px для кликабельных элементов:
```vue
<Button class="p-2" /> <!-- достаточно для пальца -->
```

### 3. Скрытие элементов
```vue
<!-- Показать только на desktop -->
<span class="hidden md:inline">Desktop only</span>

<!-- Показать только на mobile -->
<span class="md:hidden">Mobile only</span>
```

### 4. Responsive Grid
```vue
<!-- Автоматическая адаптация -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### 5. Overflow Protection
```vue
<!-- Предотвращение переполнения -->
<div class="overflow-hidden">
  <h1 class="truncate">Long title...</h1>
</div>
```

## Компоненты для будущих страниц

### Пример адаптивной страницы

```vue
<template>
    <AdminLayout>
        <template #header>
            <h1 class="text-xl md:text-2xl font-semibold truncate">
                Page Title
            </h1>
        </template>

        <div class="space-y-4 md:space-y-6">
            <!-- Контент -->
            <Card>
                <template #title>
                    <span class="text-base md:text-lg">Card Title</span>
                </template>
                <template #content>
                    <p class="text-sm md:text-base">Content</p>
                </template>
            </Card>
        </div>
    </AdminLayout>
</template>
```

### Адаптивная таблица

```vue
<!-- Desktop: обычная таблица -->
<div class="hidden md:block">
    <DataTable :value="items" />
</div>

<!-- Mobile: карточки -->
<div class="md:hidden space-y-2">
    <Card v-for="item in items" :key="item.id">
        <!-- Карточка с данными -->
    </Card>
</div>
```

### Адаптивные формы

```vue
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <InputLabel value="Field 1" />
        <TextInput class="w-full" />
    </div>
    <div>
        <InputLabel value="Field 2" />
        <TextInput class="w-full" />
    </div>
</div>
```

## Проблемы и решения

### Проблема: Сайдбар перекрывает контент на планшетах
**Решение:** Использован breakpoint 768px для четкого разделения mobile/desktop

### Проблема: Мелкий текст на мобильных
**Решение:** Адаптивные размеры `text-sm md:text-base`

### Проблема: Сложная навигация на touch-устройствах
**Решение:** PrimeVue Sidebar с overlay и крупными touch targets

## Чеклист для новых страниц

- [ ] Адаптивные отступы (`p-4 md:p-6 lg:p-8`)
- [ ] Адаптивные размеры текста (`text-sm md:text-base`)
- [ ] Responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
- [ ] Truncate для длинных заголовков
- [ ] Touch-friendly кнопки (минимум p-2)
- [ ] Тестирование на мобильных размерах
- [ ] Проверка overflow/scroll
- [ ] Адаптация таблиц (desktop table → mobile cards)