import {useCallback, useRef} from 'react';

import {PlusIcon} from 'lucide-react';

import {ImagePicker} from '@/components/image-picker';
import type {ImageSelectorItem} from '@/components/image-selector';
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import {useDialog} from '@/stores/dialog';

interface Props {
    onChoose: (selected: ImageSelectorItem[]) => void;
    selectedImages?: ImageSelectorItem[];
    /** Одиночный выбор — для полей вроде логотипа бренда. */
    multiple?: boolean;
    /** Заголовок диалога и подпись кнопки; по умолчанию — «Добавить изображения». */
    label?: string;
}

const EMPTY_SELECTED_IMAGES: ImageSelectorItem[] = [];

export function ImagePickerDialog({
                                      onChoose,
                                      selectedImages = EMPTY_SELECTED_IMAGES,
                                      multiple = true,
                                      label,
                                  }: Props) {
    const {t} = useLang();
    const title = label ?? t('admin.products_edit.images.add_images');
    const {openDialog, closeDialog} = useDialog();

    const selectedItemsRef = useRef<ImageSelectorItem[]>([]);

    const onChooseHandle = useCallback(() => {
        onChoose(selectedItemsRef.current);
        closeDialog();
    }, [onChoose, closeDialog]);

    const onClick = () => {
        selectedItemsRef.current = selectedImages;
        openDialog({
            title,
            className: 'max-w-[1000px] min-h-[300px] max-h-[80vh] overflow-y-auto',
            content: (
                <ImagePicker
                    images={selectedImages}
                    initialSelectedImages={selectedImages}
                    multiple={multiple}
                    resource={route('admin.media.api.index')}
                    onChange={items => {
                        selectedItemsRef.current = items;
                    }}
                />
            ),
            footer: (
                <div>
                    <Button variant="secondary" onClick={onChooseHandle}>{t('admin.products_edit.images.choose')}</Button>
                </div>
            ),
        });
    };

    return (
        <Button variant="outline" onClick={onClick}>
            <PlusIcon className="size-4"/>
            {title}
        </Button>
    );
}
