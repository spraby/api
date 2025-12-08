# PrimeVue UI Component Library

**Дата создания**: 2025-12-08
**Версия**: PrimeVue для Vue 3

## Обзор

**PrimeVue** - это комплексная UI библиотека компонентов для Vue 3 приложений от PrimeTek, используемая для построения Vue админ-панели в Laravel проекте.

### Ключевые особенности

- **80+ компонентов** - полный набор UI компонентов
- **Vue 3 совместимость** - построено на современных Vue паттернах
- **TypeScript поддержка** - полная типизация
- **Accessibility** - WCAG 2.1 AA compliance
- **Два режима стилизации** - Styled и Unstyled
- **Tailwind CSS интеграция** - первоклассная поддержка
- **PrimeIcons** - 250+ встроенных иконок

## Установка и настройка

### Базовая установка

```bash
npm install primevue primeicons
# или
yarn add primevue primeicons
# или
pnpm add primevue primeicons
```

### Базовая конфигурация

```javascript
// main.js или app.js
import PrimeVue from 'primevue/config';

app.use(PrimeVue, {
  // Опции конфигурации
  inputVariant: 'outlined', // 'outlined' | 'filled'
  ripple: true,
  theme: {
    preset: 'Aura', // 'Aura' | 'Material' | 'Lara' | 'Nora'
  }
});
```

### Auto-Import (рекомендуется)

```javascript
// vite.config.js
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from '@primevue/auto-import-resolver';

export default {
  plugins: [
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ]
};
```

## Архитектура и режимы

### Styled Mode (По умолчанию)

Компоненты с предустановленным дизайном через design tokens:

```javascript
app.use(PrimeVue, {
  theme: {
    preset: 'Aura' // Готовая тема
  }
});
```

**Доступные пресеты**: Aura, Material, Lara, Nora

### Unstyled Mode

Минимальная стилизация для полной кастомизации:

```javascript
app.use(PrimeVue, {
  unstyled: true // Отключить design tokens
});
```

Идеально для использования с Tailwind CSS или собственными стилями.

## Основные категории компонентов

### Form Components (Формы)

- **InputText** - текстовое поле
- **InputNumber** - числовое поле
- **Dropdown** - выпадающий список
- **MultiSelect** - множественный выбор
- **Checkbox** - чекбокс
- **RadioButton** - радио кнопка
- **Calendar** - выбор даты
- **InputMask** - ввод с маской
- **Textarea** - многострочное поле
- **AutoComplete** - автодополнение
- **Password** - поле пароля
- **ColorPicker** - выбор цвета
- **FileUpload** - загрузка файлов
- **Rating** - рейтинг звездами
- **Slider** - слайдер

### Data Display (Отображение данных)

- **DataTable** - таблица данных с сортировкой, фильтрацией, пагинацией
- **DataView** - представление списка
- **Timeline** - временная шкала
- **Tree** - древовидная структура
- **TreeTable** - таблица дерева
- **VirtualScroller** - виртуальный скроллинг

### Panel Components (Панели)

- **Accordion** - аккордеон для группировки контента
- **Card** - карточка
- **Divider** - разделитель
- **Fieldset** - группировка полей
- **Panel** - контейнер панели
- **ScrollPanel** - панель со скроллом
- **Splitter** - разделитель панелей
- **Stepper** - пошаговая форма
- **TabView** - вкладки
- **Toolbar** - панель инструментов

### Overlay Components (Оверлеи)

- **Dialog** - модальное окно
- **Drawer** - выдвижная панель
- **Popover** - всплывающее окно
- **OverlayPanel** - оверлей панель
- **Sidebar** - боковая панель
- **Tooltip** - подсказка
- **ConfirmDialog** - диалог подтверждения
- **ConfirmPopup** - попап подтверждения

### Menu Components (Меню)

- **Menubar** - горизонтальное меню
- **Menu** - вертикальное меню
- **ContextMenu** - контекстное меню
- **MegaMenu** - мега меню
- **PanelMenu** - панельное меню
- **TieredMenu** - многоуровневое меню
- **Breadcrumb** - хлебные крошки
- **Steps** - шаги навигации
- **TabMenu** - меню вкладок
- **Dock** - док меню

### Messages (Сообщения)

- **Message** - информационное сообщение
- **Toast** - всплывающее уведомление
- **InlineMessage** - встроенное сообщение

### Buttons (Кнопки)

- **Button** - стандартная кнопка
- **SpeedDial** - быстрый набор
- **SplitButton** - кнопка с выпадающим меню

### Misc (Разное)

- **Badge** - значок
- **Chip** - чип/тег
- **ProgressBar** - прогресс бар
- **ProgressSpinner** - спиннер загрузки
- **Tag** - тег
- **Avatar** - аватар
- **AvatarGroup** - группа аватаров
- **Skeleton** - скелетон загрузки

## PrimeVue Forms - Управление формами

PrimeVue Forms (`@primevue/forms`) - мощная система управления состоянием форм.

### Установка

```bash
npm install @primevue/forms
```

### Базовое использование

```vue
<script setup>
import { useForm } from '@primevue/forms';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+')
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema
});

const name = defineField('name');
const email = defineField('email');
const age = defineField('age');

const onSubmit = handleSubmit((values) => {
  console.log('Form submitted:', values);
});
</script>

<template>
  <form @submit="onSubmit">
    <InputText v-model="name" :invalid="!!errors.name" />
    <small v-if="errors.name">{{ errors.name }}</small>

    <InputText v-model="email" :invalid="!!errors.email" />
    <small v-if="errors.email">{{ errors.email }}</small>

    <InputNumber v-model="age" :invalid="!!errors.age" />
    <small v-if="errors.age">{{ errors.age }}</small>

    <Button type="submit" label="Submit" />
  </form>
</template>
```

### Поддерживаемые validation библиотеки

- **Zod** - рекомендуется
- **Yup**
- **Joi**
- **Valibot**

### Triggers валидации

- `mount` - при монтировании
- `blur` - при потере фокуса
- `submit` - при отправке формы
- `input` - при вводе

## Система тем и токенов

### Design Tokens структура

PrimeVue использует три уровня токенов:

1. **Primitive Tokens** - базовые цвета
   - `blue-50` до `blue-900`
   - `gray-50` до `gray-900`
   - и т.д.

2. **Semantic Tokens** - контекстные токены
   - `--p-primary-color`
   - `--p-primary-50` до `--p-primary-950`
   - `--p-surface-0` до `--p-surface-950`

3. **Component Tokens** - компонентные токены
   - `--p-button-color`
   - `--p-input-background`
   - и т.д.

### Кастомизация темы

```javascript
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}',
      100: '{blue.100}',
      // ...
      900: '{blue.900}'
    }
  }
});

app.use(PrimeVue, {
  theme: {
    preset: MyPreset
  }
});
```

### Runtime изменения

```javascript
import { updatePreset, updatePrimaryPalette } from '@primevue/themes';

// Изменить весь пресет
updatePreset({
  semantic: {
    primary: {
      color: '#your-color'
    }
  }
});

// Изменить только primary палитру
updatePrimaryPalette({
  50: '#fff9e6',
  // ...
  900: '#663c00'
});
```

### Доступ к токенам в коде

```javascript
import { $dt } from '@primevue/themes';

const primaryColor = $dt('primary.color');
const surfaceColor = $dt('surface.0');
```

## PrimeIcons - Иконочная система

### Базовое использование

```vue
<template>
  <!-- Inline иконка -->
  <i class="pi pi-check"></i>

  <!-- В кнопке -->
  <Button icon="pi pi-search" label="Search" />

  <!-- Только иконка -->
  <Button icon="pi pi-times" severity="danger" text rounded />
</template>
```

### Популярные иконки

- `pi-check` - галочка
- `pi-times` - крестик
- `pi-search` - поиск
- `pi-user` - пользователь
- `pi-cog` - настройки
- `pi-trash` - удалить
- `pi-pencil` - редактировать
- `pi-plus` - плюс
- `pi-minus` - минус
- `pi-eye` - просмотр
- `pi-eye-slash` - скрыть
- `pi-save` - сохранить
- `pi-upload` - загрузить
- `pi-download` - скачать
- `pi-calendar` - календарь
- `pi-home` - домой
- `pi-folder` - папка
- `pi-file` - файл
- `pi-image` - изображение
- `pi-chart-bar` - график
- `pi-shopping-cart` - корзина

[Полный список иконок](https://primevue.org/icons/)

### Альтернативные иконочные системы

```vue
<template>
  <!-- Font Awesome -->
  <Button icon="fas fa-user" />

  <!-- Material Icons -->
  <Button>
    <template #icon>
      <span class="material-icons">home</span>
    </template>
  </Button>

  <!-- SVG -->
  <Button>
    <template #icon>
      <svg>...</svg>
    </template>
  </Button>
</template>
```

## Tailwind CSS интеграция

### Установка плагина

```bash
npm install tailwindcss-primeui
```

### Конфигурация Tailwind

```javascript
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  plugins: [
    require('tailwindcss-primeui')
  ]
};
```

### Доступные утилиты

```vue
<template>
  <!-- Семантические цвета -->
  <div class="bg-primary text-primary-contrast">Primary</div>
  <div class="bg-surface-0 text-surface-900">Surface</div>

  <!-- Расширенные анимации -->
  <div class="animate-fadein">Fade in</div>
  <div class="animate-slidedown">Slide down</div>
</template>
```

## Pass Through API - Продвинутая кастомизация

Pass Through позволяет добавлять произвольные атрибуты к внутренним DOM элементам:

```vue
<template>
  <DataTable
    :value="products"
    :pt="{
      root: { class: 'custom-table' },
      header: { class: 'bg-primary' },
      tbody: {
        class: 'striped',
        'data-testid': 'table-body'
      }
    }"
  />
</template>
```

### Глобальный Pass Through

```javascript
app.use(PrimeVue, {
  pt: {
    button: {
      root: { class: 'custom-button' }
    },
    datatable: {
      root: { class: 'custom-datatable' }
    }
  }
});
```

### Lifecycle Hooks в Pass Through

```vue
<template>
  <Button
    :pt="{
      root: {
        onMounted: (el) => {
          console.log('Button mounted', el);
        },
        onUpdated: (el) => {
          console.log('Button updated', el);
        }
      }
    }"
  />
</template>
```

## Best Practices для админ-панели

### 1. Структура форм

```vue
<script setup>
import { useForm } from '@primevue/forms';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email')
});

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: schema
});
</script>

<template>
  <form @submit="handleSubmit" class="space-y-4">
    <div class="field">
      <label for="name">Name</label>
      <InputText
        id="name"
        v-model="name"
        :invalid="!!errors.name"
        class="w-full"
      />
      <small v-if="errors.name" class="text-red-500">
        {{ errors.name }}
      </small>
    </div>
  </form>
</template>
```

### 2. DataTable с CRUD

```vue
<script setup>
import { ref } from 'vue';
import { useConfirm } from 'primevue/useconfirm';

const products = ref([]);
const selectedProduct = ref(null);
const displayDialog = ref(false);
const confirm = useConfirm();

const editProduct = (product) => {
  selectedProduct.value = { ...product };
  displayDialog.value = true;
};

const deleteProduct = (product) => {
  confirm.require({
    message: 'Are you sure you want to delete this product?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      // Delete logic
    }
  });
};
</script>

<template>
  <DataTable :value="products" paginator :rows="10">
    <Column field="name" header="Name" sortable />
    <Column field="price" header="Price" sortable />
    <Column header="Actions">
      <template #body="{ data }">
        <Button
          icon="pi pi-pencil"
          text
          @click="editProduct(data)"
        />
        <Button
          icon="pi pi-trash"
          text
          severity="danger"
          @click="deleteProduct(data)"
        />
      </template>
    </Column>
  </DataTable>

  <Dialog v-model:visible="displayDialog" header="Edit Product">
    <!-- Form content -->
  </Dialog>

  <ConfirmDialog />
</template>
```

### 3. Toast уведомления

```vue
<script setup>
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const saveProduct = async () => {
  try {
    await api.save();
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Product saved successfully',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message,
      life: 3000
    });
  }
};
</script>

<template>
  <Toast />
  <Button @click="saveProduct" label="Save" />
</template>
```

### 4. Responsive layout

```vue
<template>
  <div class="grid">
    <div class="col-12 md:col-6 lg:col-4">
      <Card>
        <template #title>Product 1</template>
        <template #content>Content</template>
      </Card>
    </div>
    <div class="col-12 md:col-6 lg:col-4">
      <Card>
        <template #title>Product 2</template>
        <template #content>Content</template>
      </Card>
    </div>
  </div>
</template>
```

## Accessibility (a11y)

PrimeVue соответствует WCAG 2.1 AA:

- ✅ Keyboard navigation для всех компонентов
- ✅ ARIA attributes
- ✅ Screen reader support
- ✅ Focus management
- ✅ High contrast mode

### Пример доступной формы

```vue
<template>
  <div class="field">
    <label for="email" class="required">Email</label>
    <InputText
      id="email"
      v-model="email"
      aria-describedby="email-help"
      :invalid="!!errors.email"
      aria-required="true"
    />
    <small id="email-help" v-if="errors.email" role="alert">
      {{ errors.email }}
    </small>
  </div>
</template>
```

## Интеграция с Laravel Inertia.js

### Настройка в Laravel проекте

```javascript
// resources/js/app.js
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
    return pages[`./Pages/${name}.vue`];
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(PrimeVue, {
        theme: {
          preset: Aura
        }
      })
      .use(ToastService)
      .use(ConfirmationService)
      .mount(el);
  },
});
```

### Использование в Inertia страницах

```vue
<script setup>
import { useForm } from '@inertiajs/vue3';
import { useToast } from 'primevue/usetoast';

const props = defineProps({
  product: Object
});

const form = useForm({
  name: props.product?.name || '',
  price: props.product?.price || 0
});

const toast = useToast();

const submit = () => {
  form.post('/products', {
    onSuccess: () => {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Product created',
        life: 3000
      });
    }
  });
};
</script>

<template>
  <form @submit.prevent="submit">
    <InputText
      v-model="form.name"
      :invalid="form.errors.name"
    />
    <small v-if="form.errors.name" class="text-red-500">
      {{ form.errors.name }}
    </small>

    <Button
      type="submit"
      label="Save"
      :loading="form.processing"
    />
  </form>

  <Toast />
</template>
```

## Ресурсы и поддержка

- **Официальная документация**: https://primevue.org/
- **GitHub**: https://github.com/primefaces/primevue
- **Discord**: Активное сообщество разработчиков
- **Figma UI Kit**: Доступен для дизайна
- **Theme Designer**: Визуальный редактор тем с интеграцией Figma

## Заключение

PrimeVue предоставляет полноценную экосистему для быстрой разработки профессиональных админ-панелей с:

- ✅ Богатым набором компонентов
- ✅ Гибкой системой тем
- ✅ Отличной TypeScript поддержкой
- ✅ Accessibility из коробки
- ✅ Tailwind CSS интеграцией
- ✅ Мощной системой форм

Идеально подходит для Vue админ-панели в Laravel проекте!