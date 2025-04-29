import './bootstrap';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

document.addEventListener('alpine:init', () => {
    Fancybox.bind('[data-fancybox]');
});
