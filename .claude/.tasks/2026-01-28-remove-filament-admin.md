# Удаление Filament Admin Panel

Дата создания: 2026-01-28

## Описание
Полное удаление Filament админки и всех связанных с ней файлов, компонентов, переводов и зависимостей.

## Чеклист

- [x] **Раздел 1: Удаление PHP кода**
  - [x] Удалить директорию `app/Filament/` (11 ресурсов, компоненты, actions, tables)
  - [x] Удалить провайдер `app/Providers/Filament/AdminPanelProvider.php`
  - [x] Удалить Livewire компонент `app/Livewire/ImagePicker.php` (зависит от Filament)

- [x] **Раздел 2: Удаление Views**
  - [x] Удалить директорию `resources/views/filament/` (11 blade файлов)
  - [x] Удалить директорию `resources/views/livewire/image-picker/` (связана с Filament)

- [x] **Раздел 3: Удаление конфигов и переводов**
  - [x] Удалить `config/filament.php`
  - [x] Удалить переводы `resources/lang/en/filament-*.php` (5 файлов)
  - [x] Удалить переводы `resources/lang/ru/filament-*.php` (5 файлов)

- [x] **Раздел 4: Обновление bootstrap**
  - [x] Убрать `AdminPanelProvider` из `bootstrap/providers.php`
  - [x] Убрать комментарии и логику про Filament из `bootstrap/app.php`

- [x] **Раздел 5: Удаление Composer зависимостей**
  - [x] Удалить `filament/filament` - основной пакет Filament
  - [x] Удалить `lara-zeus/popover` - плагин для Filament
  - [x] Удалить `eduard9969/blade-polaris-icons` - иконки для Filament
  - [x] Удалить скрипт `@php artisan filament:upgrade` из composer.json scripts
  - [x] Выполнить `composer remove filament/filament lara-zeus/popover eduard9969/blade-polaris-icons` (удалено 35 пакетов)

- [x] **Раздел 6: Очистка Vite конфигурации**
  - [x] Удалить `resources/css/app.css` из входных точек vite.config.js
  - [x] Удалить плагин Vue из vite.config.js
  - [x] Удалить файл `resources/css/app.css`
  - [x] Удалить npm пакеты `@vitejs/plugin-vue` и `vue`

- [x] **Раздел 7: Финальная проверка**
  - [x] Очистить кэши Laravel: `php artisan config:clear` (cache требует DB)
  - [x] Composer autoload обновлён при remove
  - [x] Проверить `npm run lint` - OK, без ошибок
  - [x] Проверить `npm run build` - OK, сборка успешна
  - [x] Удалить пустую директорию `app/Livewire/`

## Файлы для удаления (полный список)

### app/Filament/ (вся директория)
- `app/Filament/Actions/Utilities.php`
- `app/Filament/Components/` (7 файлов)
- `app/Filament/Resources/` (11 ресурсов с подпапками)
- `app/Filament/Tables/ProductImageTable.php`

### app/Providers/Filament/
- `AdminPanelProvider.php`

### app/Livewire/
- `ImagePicker.php`

### resources/views/filament/ (вся директория)
- `language-switcher.blade.php`
- `components/` (11 файлов)

### resources/views/livewire/image-picker/
- `view.blade.php`
- `data.blade.php`

### config/
- `filament.php`

### resources/lang/en/
- `filament-actions.php`
- `filament-forms.php`
- `filament-panels.php`
- `filament-resources.php`
- `filament-tables.php`

### resources/lang/ru/
- `filament-actions.php`
- `filament-forms.php`
- `filament-panels.php`
- `filament-resources.php`
- `filament-tables.php`