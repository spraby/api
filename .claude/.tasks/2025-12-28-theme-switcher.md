# Добавление темной и светлой темы с переключателем

Дата создания: 2025-12-28

## Описание

Добавить поддержку светлой и темной темы в React/Inertia админку с переключателем.
Использовать уже установленный пакет `next-themes` и существующие стили из `admin.css`.

## Технические детали

- **Пакет для управления темами**: `next-themes` (уже установлен)
- **Стили**: В `resources/css/admin.css` уже настроены CSS переменные для `.dark` класса
- **Компоненты**: shadcn/ui (уже есть `dropdown-menu`, `toggle`, `button`)
- **Иконки**: `@tabler/icons-react` (уже установлен) или `lucide-react`

## Чеклист

### Раздел 1: Анализ текущего состояния

- [x] Проверить текущую структуру layouts (`AdminLayout.tsx`)
- [x] Проверить наличие компонентов для переключателя темы
- [x] Проверить app.tsx на наличие провайдеров
- [x] Изучить структуру компонентов в `components/ui/`

### Раздел 2: Настройка ThemeProvider

- [x] Создать или обновить `app.tsx` для добавления ThemeProvider из `next-themes`
- [x] Настроить параметры: `attribute="class"`, `defaultTheme="system"`, `enableSystem`
- [x] Убедиться, что провайдер оборачивает всё приложение

### Раздел 3: Создание компонента переключателя темы

- [x] Создать компонент `ThemeToggle.tsx` в `components/ui/` или `components/`
- [x] Использовать `useTheme()` хук из `next-themes`
- [x] Реализовать три варианта: Light, Dark, System
- [x] Добавить иконки (солнце/луна) из `@tabler/icons-react` или `lucide-react`
- [x] Использовать существующие shadcn компоненты (Button, DropdownMenu или Toggle)

### Раздел 4: Интеграция в Layout

- [x] Открыть `layouts/AdminLayout.tsx`
- [x] Добавить компонент `ThemeToggle` в header/sidebar
- [x] Разместить переключатель в удобном месте (правый верхний угол или в меню)
- [x] Проверить responsive поведение

### Раздел 5: Тестирование

- [x] Запустить dev сервер (`npm run dev`) / Выполнена сборка (`npm run build`)
- [ ] Проверить переключение тем (Light → Dark → System) - требуется проверка пользователем
- [ ] Проверить сохранение выбранной темы (localStorage) - требуется проверка пользователем
- [ ] Проверить корректность цветов в обеих темах - требуется проверка пользователем
- [x] Проверить отсутствие "вспышки" при загрузке страницы (FOUC) - реализовано через mounted state

### Раздел 6: Оптимизация (опционально)

- [ ] Добавить transition для плавной смены темы
- [ ] Проверить accessibility (aria-labels, keyboard navigation)
- [ ] Добавить tooltip с описанием текущей темы

## Примеры реализации

### ThemeProvider в app.tsx
```tsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <App {...props} />
  <Toaster />
</ThemeProvider>
```

### ThemeToggle компонент (вариант с DropdownMenu)
```tsx
import { useTheme } from 'next-themes';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <IconSun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <IconMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <IconSun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <IconMoon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <IconDeviceDesktop className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### ThemeToggle компонент (вариант с Toggle)
```tsx
import { useTheme } from 'next-themes';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <IconSun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <IconMoon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

## Потенциальные проблемы

1. **FOUC (Flash of Unstyled Content)**:
   - next-themes автоматически добавляет script для предотвращения вспышки
   - Убедиться, что `attribute="class"` соответствует `.dark` в CSS

2. **Hydration mismatch**:
   - Использовать `suppressHydrationWarning` на элементе `<html>` если нужно
   - next-themes обрабатывает это автоматически

3. **TypeScript ошибки**:
   - Убедиться, что `next-themes` правильно типизирован
   - Возможно потребуется `@types/next-themes` (но обычно не нужен)

## Результат

После выполнения задачи:
- ✅ Пользователи могут переключаться между светлой и темной темой
- ✅ Выбор сохраняется в localStorage
- ✅ Поддерживается системная тема (auto)
- ✅ Плавная смена темы без перезагрузки
- ✅ Корректное отображение всех компонентов в обеих темах