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

- [ ] Исследовать текущую структуру проекта
  - [ ] Проверить наличие существующих конфигов ESLint
  - [ ] Изучить структуру `resources/js/admin/`
  - [ ] Проверить версии зависимостей в `package.json`

### Установка зависимостей

- [ ] Установить основные пакеты ESLint
  - [ ] `eslint` (latest v9.x)
  - [ ] `typescript-eslint` (parser + plugin)
  - [ ] `eslint-plugin-react`
  - [ ] `eslint-plugin-react-hooks`
  - [ ] `eslint-plugin-jsx-a11y`
  - [ ] `eslint-plugin-import`

- [ ] Установить дополнительные инструменты
  - [ ] `prettier` (опционально)
  - [ ] `eslint-config-prettier` (если используем Prettier)
  - [ ] `eslint-plugin-prettier` (если используем Prettier)

### Конфигурация ESLint

- [ ] Создать `eslint.config.js` (flat config format)
  - [ ] Базовая конфигурация
  - [ ] TypeScript конфигурация
  - [ ] React конфигурация
  - [ ] React Hooks rules
  - [ ] Accessibility rules
  - [ ] Import rules
  - [ ] Кастомные правила для проекта

- [ ] Настроить игнорирование файлов
  - [ ] `node_modules`
  - [ ] `public/build`
  - [ ] `vendor`
  - [ ] `bootstrap/cache`
  - [ ] `storage`

### Настройка скриптов

- [ ] Добавить npm scripts в `package.json`
  - [ ] `npm run lint` - проверка
  - [ ] `npm run lint:fix` - автофикс
  - [ ] `npm run format` - prettier (если используем)

### Интеграция с Vite

- [ ] Добавить `vite-plugin-eslint` (опционально)
  - [ ] Установить плагин
  - [ ] Настроить в `vite.config.ts`

### Настройка IDE

- [ ] Создать `.vscode/settings.json` (опционально)
  - [ ] Автофикс при сохранении
  - [ ] Интеграция с ESLint
  - [ ] Форматирование

### Тестирование

- [ ] Запустить линтер на существующем коде
  - [ ] Проверить на ошибки
  - [ ] Исправить критические проблемы
  - [ ] Задокументировать возможные warnings

- [ ] Проверить производительность
  - [ ] Время выполнения lint
  - [ ] Влияние на dev server

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