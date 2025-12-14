# Настройка темы PrimeVue + Tailwind 4

Дата создания: 2025-12-14

## Описание
Настроить систему тем для админки на PrimeVue с использованием Tailwind CSS 4. Должна поддерживаться светлая и тёмная тема с возможностью переключения.

## Чеклист

- [x] **Раздел 1: Анализ текущей конфигурации**
  - [x] Проверить текущую конфигурацию Tailwind CSS
  - [x] Проверить текущую конфигурацию PrimeVue
  - [x] Проверить структуру CSS файлов
  - [x] Определить используемую версию PrimeVue (4.5.2)

- [x] **Раздел 2: Настройка Tailwind CSS 4 для темной/светлой темы**
  - [x] Настроить CSS переменные для светлой темы
  - [x] Настроить CSS переменные для тёмной темы
  - [x] Настроить dark mode selector в Tailwind (@variant dark)
  - [x] Создать палитру цветов (primary, surface, success, warning, danger, info)

- [x] **Раздел 3: Интеграция с PrimeVue**
  - [x] Настроить тему Aura для работы с CSS переменными
  - [x] Синхронизировать цвета PrimeVue с Tailwind палитрой
  - [x] Настроить переключение тем PrimeVue (darkModeSelector: '.dark')

- [x] **Раздел 4: Создание переключателя темы**
  - [x] Создать Vue компонент переключателя (ThemeToggle.vue с PrimeVue Button/Menu)
  - [x] Добавить логику сохранения выбора в localStorage (useTheme composable)
  - [x] Добавить определение системных предпочтений (prefers-color-scheme)
  - [x] Интегрировать переключатель в layout админки (AdminLayout.vue header)

- [ ] **Раздел 5: Тестирование**
  - [ ] Проверить переключение тем
  - [ ] Проверить сохранение выбора при перезагрузке
  - [ ] Проверить корректность отображения всех компонентов PrimeVue

## Палитра цветов (реализованная)

### Светлая тема
- Primary: Indigo (#6366f1 / #4f46e5)
- Surface-0: White (#ffffff)
- Surface-50: Slate-50 (#f8fafc)
- Background: Slate-50 (#f8fafc)
- Text: Slate-900 (#0f172a)
- Border: Slate-200 (#e2e8f0)

### Тёмная тема
- Primary: Indigo-400/500 (#818cf8 / #6366f1)
- Surface-0: Slate-900 (#0f172a)
- Surface-50: Slate-800 (#1e293b)
- Background: #0a0f1a
- Text: Slate-50 (#f8fafc)
- Border: Slate-700 (#334155)

## Изменённые файлы

1. `resources/css/theme.css` - CSS переменные и @theme для Tailwind 4
2. `resources/js/app.js` - Конфигурация PrimeVue с темой Aura
3. `resources/js/composables/useTheme.js` - Composable для управления темой
4. `resources/js/Components/Admin/ThemeToggle.vue` - Компонент переключателя
5. `resources/js/Layouts/AdminLayout.vue` - Обновлены стили для CSS переменных
6. `resources/js/Components/Admin/AdminSidebar.vue` - Обновлены классы для dark mode

## Статус
✅ Выполнено (кроме тестирования)