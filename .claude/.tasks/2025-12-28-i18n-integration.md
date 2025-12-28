# Интеграция мультиязычности в React админ-панель

Дата создания: 2025-12-28

## Описание
Интеграция пакета Laravel Lang Sync Inertia для поддержки русского (по умолчанию) и английского языков в React админ-панели.

## Чеклист

### Раздел 1: Подготовка и установка пакетов
- [ ] 1.1. Установить Composer пакет `erag/laravel-lang-sync-inertia` в Docker контейнер
- [ ] 1.2. Запустить команду установки `php artisan erag:install-lang` (выбрать React)
- [ ] 1.3. Установить npm пакет `@erag/lang-sync-inertia`
- [ ] 1.4. Проверить установку пакетов

### Раздел 2: Backend конфигурация
- [ ] 2.1. Обновить `bootstrap/app.php`:
  - [ ] 2.1.1. Добавить alias для SetLocale middleware
  - [ ] 2.1.2. Применить SetLocale к web middleware группе
- [ ] 2.2. Улучшить `app/Http/Middleware/SetLocale.php` (добавить валидацию локалей: en, ru)
- [ ] 2.3. Обновить `app/Http/Middleware/HandleInertiaRequests.php`:
  - [ ] 2.3.1. Добавить 'locale' в share()
  - [ ] 2.3.2. Добавить 'lang' с syncLangFiles(['admin']) в share()
- [ ] 2.4. Создать файлы переводов:
  - [ ] 2.4.1. Создать `resources/lang/ru/admin.php` с русскими переводами
  - [ ] 2.4.2. Создать `resources/lang/en/admin.php` с английскими переводами
- [ ] 2.5. Установить русский как default locale:
  - [ ] 2.5.1. Обновить `config/app.php` ('locale' => 'ru')
  - [ ] 2.5.2. Обновить `.env` (APP_LOCALE=ru, APP_FALLBACK_LOCALE=en)

### Раздел 3: Frontend конфигурация
- [ ] 3.1. Обновить TypeScript типы `resources/js/admin/types/inertia.d.ts`:
  - [ ] 3.1.1. Создать интерфейс LangTranslations
  - [ ] 3.1.2. Добавить locale: string в PageProps
  - [ ] 3.1.3. Добавить lang: { admin: LangTranslations } в PageProps
- [ ] 3.2. Создать React hook `resources/js/admin/lib/lang.ts`:
  - [ ] 3.2.1. Реализовать функцию __() для базовых переводов
  - [ ] 3.2.2. Реализовать функцию trans() для переводов с заменой плейсхолдеров
  - [ ] 3.2.3. Экспортировать useLang() hook
- [ ] 3.3. Создать компонент переключения языка `resources/js/admin/components/language-toggle.tsx`:
  - [ ] 3.3.1. Реализовать dropdown меню с иконкой Languages
  - [ ] 3.3.2. Добавить пункты меню для русского и английского
  - [ ] 3.3.3. Реализовать переключение через Inertia router с preserveState

### Раздел 4: Обновление компонентов
- [ ] 4.1. Обновить `resources/js/admin/components/site-header.tsx`:
  - [ ] 4.1.1. Добавить import LanguageToggle и useLang
  - [ ] 4.1.2. Заменить хардкод "Documents" на __('admin.nav.documents')
  - [ ] 4.1.3. Добавить LanguageToggle рядом с ThemeToggle
- [ ] 4.2. Обновить `resources/js/admin/components/app-sidebar.tsx`:
  - [ ] 4.2.1. Добавить import useLang
  - [ ] 4.2.2. Заменить хардкод в navMain на переводы (dashboard, users)
  - [ ] 4.2.3. Заменить хардкод в navSecondary на переводы (settings)
- [ ] 4.3. Обновить `resources/js/admin/components/theme-toggle.tsx`:
  - [ ] 4.3.1. Добавить import useLang
  - [ ] 4.3.2. Заменить "Toggle theme" на __('admin.theme.toggle')
  - [ ] 4.3.3. Заменить "Light", "Dark", "System" на переводы
- [ ] 4.4. Обновить `resources/js/admin/components/nav-user.tsx`:
  - [ ] 4.4.1. Добавить import useLang
  - [ ] 4.4.2. Заменить "Account" на __('admin.user.account')
  - [ ] 4.4.3. Заменить "Log out" на __('admin.user.logout')

### Раздел 5: Тестирование и верификация
- [ ] 5.1. Очистить кеши Laravel:
  - [ ] 5.1.1. php artisan config:clear
  - [ ] 5.1.2. php artisan cache:clear
  - [ ] 5.1.3. php artisan view:clear
- [ ] 5.2. Проверить TypeScript компиляцию (npx tsc --noEmit)
- [ ] 5.3. Запустить dev сервер (npm run dev)
- [ ] 5.4. Функциональное тестирование:
  - [ ] 5.4.1. Открыть /sb/admin/dashboard
  - [ ] 5.4.2. Проверить что интерфейс на русском по умолчанию
  - [ ] 5.4.3. Переключить на английский через Languages кнопку
  - [ ] 5.4.4. Проверить что все тексты изменились
  - [ ] 5.4.5. Перезагрузить страницу - язык должен сохраниться
  - [ ] 5.4.6. Переключить обратно на русский
  - [ ] 5.4.7. Проверить sidebar, theme toggle, nav user на обоих языках

### Раздел 6: Финализация
- [ ] 6.1. Обновить документацию `api/CLAUDE.md` (добавить секцию о локализации)
- [ ] 6.2. Проверить что все компоненты работают корректно
- [ ] 6.3. Выполнить финальное тестирование всего интерфейса

## Критические файлы

### Backend (7 файлов)
1. `bootstrap/app.php` - регистрация middleware
2. `app/Http/Middleware/SetLocale.php` - валидация локалей
3. `app/Http/Middleware/HandleInertiaRequests.php` - передача locale и lang
4. `config/app.php` - default locale
5. `.env` - APP_LOCALE
6. `resources/lang/ru/admin.php` - русские переводы (НОВЫЙ)
7. `resources/lang/en/admin.php` - английские переводы (НОВЫЙ)

### Frontend (7 файлов)
1. `resources/js/admin/types/inertia.d.ts` - TypeScript типы
2. `resources/js/admin/lib/lang.ts` - hook useLang() (НОВЫЙ)
3. `resources/js/admin/components/language-toggle.tsx` - переключатель (НОВЫЙ)
4. `resources/js/admin/components/site-header.tsx` - header с LanguageToggle
5. `resources/js/admin/components/app-sidebar.tsx` - навигация с переводами
6. `resources/js/admin/components/theme-toggle.tsx` - тема с переводами
7. `resources/js/admin/components/nav-user.tsx` - меню пользователя с переводами

## Технические детали

**Пакет**: erag/laravel-lang-sync-inertia
- Composer: `erag/laravel-lang-sync-inertia`
- NPM: `@erag/lang-sync-inertia`

**Языки**:
- Русский (ru) - по умолчанию
- Английский (en)

**Хранение выбора**: Session (уже реализовано в SetLocale middleware)

**UX**: Переключение через Inertia partial reload (preserveState, preserveScroll)

## Примерное время выполнения
- Раздел 1: 5-10 минут
- Раздел 2: 15-20 минут
- Раздел 3: 20-25 минут
- Раздел 4: 30-40 минут
- Раздел 5: 10-15 минут
- Раздел 6: 5-10 минут

**Общее время**: ~1.5-2 часа