import '../css/app.css'; // Импорт стилей с Tailwind 4
import './bootstrap';
import { createApp } from 'vue';
import ExampleComponent from '@/components/ExampleComponent.vue';

const app = createApp({});
app.component('example-component', ExampleComponent);
app.mount('#app');
