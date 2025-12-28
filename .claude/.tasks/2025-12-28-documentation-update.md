# Обновление документации

Дата: 2025-12-28

## Внесенные изменения

### Корневой CLAUDE.md

**Исправлена критическая ошибка в описании стека:**
- ❌ Было: `Laravel 12 + Vue 3/PrimeVue 4`
- ✅ Стало: `Laravel 12 + React 19/Inertia`

**Обновлен раздел "React Admin Panel":**
- Полностью переписано описание структуры `resources/js/admin/`
- Добавлена информация о shadcn/ui вместо PrimeVue
- Обновлена документация по Theme System (Tailwind 4 + next-themes)
- Исправлены Styling Rules

### api/CLAUDE.md

**Добавлены новые разделы:**

1. **Localization (i18n)**
   - Документация по использованию `useLang()` hook
   - Структура файлов локализации (en/ru)
   - Примеры работы с переводами

2. **Route Helpers (Ziggy)**
   - Использование TypeScript-safe route helpers
   - Интеграция с Inertia router
   - Примеры навигации

3. **Controllers**
   - Список Admin контроллеров
   - Список API контроллеров
   - Auth контроллеры

4. **Middleware**
   - `HandleInertiaRequests` - Inertia data sharing
   - `SetLocale` - локализация
   - `Authenticate` - аутентификация

5. **Build Configuration**
   - Детальное описание Vite setup
   - ESLint конфигурация
   - Path aliases

6. **Development Best Practices**
   - React Admin UI guidelines
   - Component development rules
   - State management patterns
   - Styling conventions
   - Backend best practices
   - Security guidelines

**Обновлена существующая информация:**
- Добавлена структура директории `resources/lang/`
- Расширен список Frontend зависимостей (next-themes, tanstack/react-table, sonner, lucide-react, ziggy, zod)
- Добавлена секция Routing Structure с примерами
- Добавлена секция Utility Functions (`lib/utils.ts`, `lib/lang.ts`)
- Обновлен раздел Important Notes

## Итог

Документация теперь полностью соответствует реальному состоянию проекта:
- ✅ React 19 + Inertia.js (не Vue + PrimeVue)
- ✅ shadcn/ui components (не PrimeVue)
- ✅ Tailwind CSS 4 синтаксис
- ✅ Полная структура проекта
- ✅ Best practices для разработки
- ✅ Все ключевые пакеты и зависимости
