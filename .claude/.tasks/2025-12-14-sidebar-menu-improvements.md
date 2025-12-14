# Улучшение меню в сайдбаре админки на PrimeVue

Дата создания: 2025-12-14
Статус: **ВЫПОЛНЕНО**

## Описание

Реализовано две функции:
1. При свёрнутом меню (collapsed) - показывается всплывающее подменю при наведении на иконку пунктов с children
2. Используется библиотека VueUse для определения мобильных устройств

## Изменённые файлы

- `resources/js/Components/Admin/AdminSidebar.vue` - добавлен popup подменю через PrimeVue OverlayPanel
- `resources/js/Layouts/AdminLayout.vue` - интегрирован VueUse для определения устройства
- `package.json` - добавлена зависимость @vueuse/core

## Чеклист

- [x] **Раздел 1: Анализ и выбор библиотек**
  - [x] 1.1 Исследовать варианты библиотек для определения устройства (VueUse, ua-parser-js, mobile-detect)
  - [x] 1.2 Выбрать оптимальную библиотеку с учётом Vue 3 совместимости - **VueUse**
  - [x] 1.3 Изучить компоненты PrimeVue для popup/overlay - **OverlayPanel**

- [x] **Раздел 2: Установка зависимостей**
  - [x] 2.1 Установить @vueuse/core
  - [x] 2.2 Проверить установку

- [x] **Раздел 3: Реализация popup подменю в collapsed режиме**
  - [x] 3.1 Добавить состояние для отслеживания наведения
  - [x] 3.2 Интегрировать PrimeVue OverlayPanel для popup
  - [x] 3.3 Реализовать показ подменю при hover на иконку с children
  - [x] 3.4 Добавить стили для popup подменю
  - [x] 3.5 Обеспечить правильное позиционирование popup справа от иконки

- [x] **Раздел 4: Интеграция библиотеки определения устройства**
  - [x] 4.1 Интегрировать useBreakpoints из VueUse
  - [x] 4.2 Заменить текущую логику в AdminLayout.vue
  - [x] 4.3 Убрать ручной resize listener (VueUse делает это автоматически)

- [x] **Раздел 5: Тестирование**
  - [x] 5.1 Сборка проекта успешна (npm run build)

## Реализованное решение

### Библиотека для определения устройства
**VueUse** (`@vueuse/core`) с `useBreakpoints`:
```javascript
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core';

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller('md');  // < 768px
const isTablet = breakpoints.between('md', 'lg');  // 768px - 1024px
const isDesktop = breakpoints.greaterOrEqual('lg');  // >= 1024px
```

### PrimeVue компонент для popup
**OverlayPanel** с hover событиями:
- `@mouseenter` на пункт меню - показывает popup
- `@mouseleave` - скрывает popup с задержкой
- Hover на popup предотвращает закрытие

### Логика работы
1. Desktop + collapsed + hasChildren → hover показывает popup подменю справа
2. Desktop + expanded → стандартное раскрытие accordion
3. Mobile → drawer с полным меню (без popup)