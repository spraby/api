import { Fancybox } from '@fancyapps/ui';

import '@fancyapps/ui/dist/fancybox/fancybox.css';

export interface LightboxImage {
  url: string;
  name?: string | null;
}

/** В пакете нет русской локализации — подписи кнопок и ошибок свои. */
const RU = {
  PANUP: 'Сдвинуть вверх',
  PANDOWN: 'Сдвинуть вниз',
  PANLEFT: 'Сдвинуть влево',
  PANRIGHT: 'Сдвинуть вправо',
  ZOOMIN: 'Увеличить',
  ZOOMOUT: 'Уменьшить',
  TOGGLEZOOM: 'Изменить масштаб',
  TOGGLE1TO1: 'Изменить масштаб',
  ITERATEZOOM: 'Изменить масштаб',
  ROTATECCW: 'Повернуть против часовой',
  ROTATECW: 'Повернуть по часовой',
  FLIPX: 'Отразить по горизонтали',
  FLIPY: 'Отразить по вертикали',
  FITX: 'По ширине',
  FITY: 'По высоте',
  RESET: 'Сбросить',
  TOGGLEFS: 'Во весь экран',
  CLOSE: 'Закрыть',
  NEXT: 'Следующее',
  PREV: 'Предыдущее',
  MODAL: 'Закрыть можно клавишей Esc',
  ERROR: 'Что-то пошло не так, попробуйте позже',
  IMAGE_ERROR: 'Изображение не найдено',
  ELEMENT_NOT_FOUND: 'Элемент не найден',
  AJAX_NOT_FOUND: 'Ошибка загрузки: не найдено',
  AJAX_FORBIDDEN: 'Ошибка загрузки: доступ запрещён',
  IFRAME_ERROR: 'Ошибка загрузки страницы',
  TOGGLE_ZOOM: 'Изменить масштаб',
  TOGGLE_THUMBS: 'Показать миниатюры',
  TOGGLE_SLIDESHOW: 'Слайд-шоу',
  TOGGLE_FULLSCREEN: 'Во весь экран',
  DOWNLOAD: 'Скачать',
};

/**
 * Полноэкранный просмотр картинок: курсор-лупа, увеличение по клику
 * с перетаскиванием, листание стрелками/свайпом, миниатюры, Esc — закрыть.
 */
export function openImageLightbox(images: LightboxImage[], startIndex = 0, locale = 'ru'): void {
  if (images.length === 0) {
    return;
  }

  Fancybox.show(
    images.map((image) => ({
      src: image.url,
      thumbSrc: image.url,
      caption: image.name ?? undefined,
    })),
    {
      startIndex,
      ...(locale === 'ru' ? { l10n: RU } : {}),
    },
  );
}
