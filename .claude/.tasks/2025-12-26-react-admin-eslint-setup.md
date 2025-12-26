# Настройка ESLint для React Admin Panel

Дата создания: 2025-12-26

## Описание
Настроить современный ESLint для React админки с TypeScript, используя самые популярные и актуальные конфигурации на 2025 год.

## Стек технологий
- React 18
- TypeScript
- Inertia.js
- Vite
- shadcn/ui components

## Целевая конфигурация ESLint

### Основные пакеты
- **ESLint 9.x** (flat config format)
- **typescript-eslint** (v8.x) - TypeScript support
- **eslint-plugin-react** - React best practices
- **eslint-plugin-react-hooks** - Hooks rules
- **eslint-plugin-jsx-a11y** - Accessibility rules
- **eslint-plugin-import** - Import/export rules
- **Prettier** (опционально) - Code formatting

## Чеклист

### Подготовка

- [x] Исследовать текущую структуру проекта
  - [x] Проверить наличие существующих конфигов ESLint
  - [x] Изучить структуру `resources/js/admin/`
  - [x] Проверить версии зависимостей в `package.json`

### Установка зависимостей

- [x] Установить основные пакеты ESLint
  - [x] `eslint` (latest v9.x)
  - [x] `typescript-eslint` (parser + plugin) - уже установлен
  - [x] `eslint-plugin-react`
  - [x] `eslint-plugin-react-hooks`
  - [x] `eslint-plugin-jsx-a11y`
  - [x] `eslint-plugin-import`

- [ ] Установить дополнительные инструменты
  - [ ] `prettier` (опционально) - пропускаем
  - [ ] `eslint-config-prettier` (если используем Prettier) - пропускаем
  - [ ] `eslint-plugin-prettier` (если используем Prettier) - пропускаем

### Конфигурация ESLint

- [x] Создать `eslint.config.js` (flat config format)
  - [x] Базовая конфигурация
  - [x] TypeScript конфигурация
  - [x] React конфигурация
  - [x] React Hooks rules
  - [x] Accessibility rules
  - [x] Import rules
  - [x] Кастомные правила для проекта

- [x] Настроить игнорирование файлов
  - [x] `node_modules`
  - [x] `public/build`
  - [x] `vendor`
  - [x] `bootstrap/cache`
  - [x] `storage`

### Настройка скриптов

- [x] Добавить npm scripts в `package.json`
  - [x] `npm run lint` - проверка
  - [x] `npm run lint:fix` - автофикс
  - [ ] `npm run format` - prettier (если используем) - пропускаем

### Интеграция с Vite

- [x] Добавить `vite-plugin-eslint` (опционально)
  - [x] Установить плагин (@nabla/vite-plugin-eslint)
  - [x] Настроить в `vite.config.ts`

### Настройка IDE

- [ ] Создать `.vscode/settings.json` (опционально)
  - [ ] Автофикс при сохранении
  - [ ] Интеграция с ESLint
  - [ ] Форматирование

### Тестирование

- [x] Запустить линтер на существующем коде
  - [x] Проверить на ошибки
  - [x] Исправить критические проблемы
  - [x] Задокументировать возможные warnings

- [x] Проверить производительность
  - [x] Время выполнения lint - быстро
  - [x] Влияние на dev server - минимальное (с кэшем)

## Результаты тестирования

### Исправленные проблемы
- ✅ Resolver error для TypeScript импортов
- ✅ Порядок импортов (автофикс применен)
- ✅ Пустой интерфейс в input.tsx (заменен на type alias)

### Оставшиеся warnings (некритичные)
1. **Login.tsx:89** - `react/no-unescaped-entities`: Апостроф в тексте. Можно оставить или экранировать.
2. **models.ts:30** - `@typescript-eslint/no-explicit-any`: Использование типа `any`. Рекомендуется уточнить тип.

### Документация

- [ ] Обновить README (если требуется)
  - [ ] Добавить информацию о линтинге
  - [ ] Описать команды
  - [ ] Правила контрибуции

## Рекомендуемые правила ESLint

### TypeScript
- `@typescript-eslint/no-explicit-any`: warn
- `@typescript-eslint/no-unused-vars`: error
- `@typescript-eslint/explicit-function-return-type`: off (React components)
- `@typescript-eslint/no-non-null-assertion`: warn

### React
- `react/react-in-jsx-scope`: off (React 18)
- `react/prop-types`: off (TypeScript)
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn
- `react/jsx-key`: error

### Accessibility
- `jsx-a11y/anchor-is-valid`: error
- `jsx-a11y/click-events-have-key-events`: warn
- `jsx-a11y/no-static-element-interactions`: warn

### Imports
- `import/order`: warn (группировка импортов)
- `import/no-duplicates`: error

## Примечания
- Использовать flat config format (ESLint 9.x), НЕ `.eslintrc.*`
- Настроить под существующий code style проекта
- Не ломать существующий код массовыми изменениями
- Warnings для не-критичных правил, errors для важных