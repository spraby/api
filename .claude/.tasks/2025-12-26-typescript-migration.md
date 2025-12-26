# Миграция проекта на TypeScript

Дата создания: 2025-12-26

## Описание

Полная миграция frontend части Laravel API проекта на TypeScript для обеих админок (React и Vue).

**Текущий стек:**
- React 19.2.3 + Inertia.js (admin panel в `resources/js/admin/`)
- Vue 3.4.0 + Inertia.js (основная админка, если используется)
- Vite 6.0.11
- Tailwind CSS 4.0.0
- PrimeVue 4.5.2 (для Vue админки)
- Shadcn UI компоненты (для React админки)

**Целевой стек:**
- React + TypeScript (.tsx)
- Vue + TypeScript (.vue с `<script setup lang="ts">`)
- Полная типизация для Inertia.js
- Type-safe API responses
- Type-safe роутинг

## Чеклист

### Раздел 1: Подготовка и настройка окружения

- [x] 1.1. Установка TypeScript зависимостей
  - [x] Установить `typescript`
  - [x] Установить `@types/node`
  - [x] Установить типы для React (`@types/react`, `@types/react-dom`)
  - [x] Установить типы для используемых библиотек

- [x] 1.2. Создание конфигурационных файлов
  - [x] Создать `tsconfig.json` для основного проекта
  - [x] ~~Создать `tsconfig.admin.json` для React админки (если нужно разделение)~~ (не требуется)
  - [x] Настроить path aliases в tsconfig
  - [x] Настроить strict mode для TypeScript

- [x] 1.3. Обновление Vite конфигурации
  - [x] Переименовать `vite.config.js` → `vite.config.ts`
  - [x] Обновить entry points (.js → .ts/.tsx)
  - [x] Проверить корректность плагинов для TS

### Раздел 2: Создание типов и интерфейсов

- [x] 2.1. Типы для Laravel бэкенда
  - [x] Создать директорию `resources/js/types/`
  - [x] Создать типы для моделей (User, Product, Brand, Category, и т.д.)
  - [x] Создать типы для Inertia props
  - [x] Создать типы для API responses (в models.ts - PaginatedData)
  - [x] ~~Создать типы для форм и validation~~ (используются встроенные типы Inertia)

- [x] 2.2. Глобальные типы
  - [x] Создать `global.d.ts` для глобальных типов
  - [x] Создать типы для Inertia `Page<T>` props
  - [ ] Создать типы для Laravel routes helper (если используется)
  - [ ] Создать типы для shared state/stores

- [x] 2.3. Типы для UI библиотек
  - [ ] Проверить наличие типов для PrimeVue 4
  - [x] ~~Создать типы для кастомных UI компонентов (если есть)~~ (не требуется)
  - [x] Создать типы для shadcn компонентов (встроены в компоненты)

### Раздел 3: Миграция React админки (resources/js/admin/)

- [x] 3.1. Миграция utility файлов
  - [x] `lib/utils.js` → `lib/utils.ts`
  - [x] Типизировать все helper функции

- [x] 3.2. Миграция UI компонентов (shadcn)
  - [x] `components/ui/button.jsx` → `button.tsx`
  - [x] `components/ui/card.jsx` → `card.tsx`
  - [x] `components/ui/input.jsx` → `input.tsx`
  - [x] `components/ui/label.jsx` → `label.tsx`
  - [x] `components/ui/table.jsx` → `table.tsx`
  - [x] Добавить типы для всех пропсов компонентов

- [x] 3.3. Миграция layouts
  - [x] `layouts/AdminLayout.jsx` → `AdminLayout.tsx`
  - [x] Типизировать layout props

- [x] 3.4. Миграция компонентов
  - [x] `components/Sidebar.jsx` → `Sidebar.tsx`
  - [x] Типизировать компоненты навигации

- [x] 3.5. Миграция страниц
  - [x] `Pages/Dashboard.jsx` → `Dashboard.tsx`
  - [x] `Pages/Users.jsx` → `Users.tsx`
  - [x] `Pages/Auth/Login.jsx` → `Login.tsx`
  - [x] `Pages/Auth/Register.jsx` → `Register.tsx`
  - [x] Типизировать Inertia Page props для каждой страницы

- [x] 3.6. Миграция entry point
  - [x] `app.jsx` → `app.tsx`
  - [x] Типизировать Inertia setup

### Раздел 4: Миграция Vue админки (если используется)

- [ ] 4.1. Миграция основного app
  - [ ] `resources/js/app.js` → `app.ts`
  - [ ] Типизировать Vue app setup
  - [ ] Типизировать PrimeVue конфигурацию

- [ ] 4.2. Миграция Vue компонентов
  - [ ] Добавить `lang="ts"` в `<script setup>`
  - [ ] Типизировать props с помощью `defineProps<T>()`
  - [ ] Типизировать emits с помощью `defineEmits<T>()`
  - [ ] Типизировать composables

- [ ] 4.3. Миграция Vue страниц
  - [ ] Добавить типы для Inertia page props
  - [ ] Типизировать reactive state
  - [ ] Типизировать computed свойства

### Раздел 5: Общие файлы

- [ ] 5.1. Миграция вспомогательных файлов
  - [ ] `bootstrap.js` → `bootstrap.ts`
  - [ ] `custom.js` → `custom.ts` (если используется)
  - [ ] Типизировать axios setup

### Раздел 6: Настройка линтинга и форматирования

- [ ] 6.1. ESLint для TypeScript
  - [ ] Установить `@typescript-eslint/parser`
  - [ ] Установить `@typescript-eslint/eslint-plugin`
  - [ ] Создать/обновить `.eslintrc.js`
  - [ ] Настроить правила для React и Vue

- [ ] 6.2. Prettier
  - [ ] Проверить совместимость с TypeScript
  - [ ] Обновить конфигурацию если нужно

### Раздел 7: Интеграция с Laravel

- [ ] 7.1. Типы для Laravel Inertia
  - [ ] Создать типы для shared data
  - [ ] Создать типы для flash messages
  - [ ] Создать типы для errors
  - [ ] Создать типы для auth user

- [ ] 7.2. Ziggy routes (если используется)
  - [ ] Установить типы для Ziggy
  - [ ] Сгенерировать типы роутов
  - [ ] Типизировать route() helper

### Раздел 8: Тестирование и проверка

- [x] 8.1. Проверка компиляции
  - [x] Запустить `tsc --noEmit` для проверки типов
  - [x] Исправить все ошибки типизации
  - [x] Убедиться в отсутствии `any` типов (кроме оправданных случаев)

- [ ] 8.2. Тестирование в dev режиме
  - [ ] Запустить `npm run dev`
  - [ ] Проверить hot reload
  - [ ] Проверить работу всех страниц React админки
  - [ ] Проверить работу всех страниц Vue админки (если есть)

- [x] 8.3. Production build
  - [x] Запустить `npm run build`
  - [x] Проверить отсутствие ошибок
  - [x] Проверить размер бандлов (387KB React app, 36KB vendor)
  - [ ] Протестировать production build в браузере

### Раздел 9: Документация

- [ ] 9.1. Обновление документации
  - [ ] Обновить `CLAUDE.md` с информацией о TypeScript
  - [ ] Создать `TYPESCRIPT.md` с guidelines (если нужно)
  - [ ] Документировать типы и интерфейсы
  - [ ] Добавить примеры использования типов

- [ ] 9.2. README обновления
  - [ ] Обновить package.json scripts
  - [ ] Добавить информацию о TypeScript в README

### Раздел 10: Очистка и финализация

- [x] 10.1. Удаление старых файлов
  - [x] Удалить все оригинальные .js/.jsx файлы после миграции
  - [x] Проверить отсутствие дубликатов

- [ ] 10.2. Git
  - [ ] Проверить .gitignore (типы могут генерироваться)
  - [ ] Коммит изменений

## Статус выполнения

**Завершено:**
- ✅ React админка полностью мигрирована на TypeScript
- ✅ Все типы созданы и типизированы
- ✅ TypeScript компиляция проходит без ошибок (`tsc --noEmit`)
- ✅ Production build успешен (npm run build)
- ✅ Все старые .js/.jsx файлы удалены

**Осталось:**
- Vue админка (если требуется)
- ESLint конфигурация для TypeScript
- Ziggy routes типизация (опционально)
- Тестирование в dev режиме
- Обновление документации

## Заметки

### Важные моменты

1. **Строгая типизация**: Использовать `strict: true` в tsconfig для максимальной безопасности типов
2. **Избегать `any`**: Использовать `unknown` или конкретные типы вместо `any`
3. **Inertia типизация**: Использовать generic типы для Page<T> props
4. **Shared types**: Держать общие типы в `resources/js/types/`
5. **Laravel sync**: При изменении моделей Laravel обновлять TypeScript типы

### Потенциальные проблемы

- Конфликты типов между PrimeVue 4 и кастомными компонентами
- Типизация сложных Inertia form helpers
- Типизация динамических роутов
- Совместимость Tailwind CSS 4 с TypeScript

### Рекомендуемый порядок миграции

1. Начать с utility функций и helpers (простые, независимые)
2. Затем UI компоненты (shadcn)
3. Потом layouts
4. Затем pages (от простых к сложным)
5. В конце entry points

### TypeScript Config Reference

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./resources/js/admin/*"]
    }
  },
  "include": ["resources/js/**/*"],
  "exclude": ["node_modules"]
}
```