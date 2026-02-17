import {useCallback, useRef} from 'react';

import {PlusIcon} from 'lucide-react';

import {ImagePicker} from '@/components/image-picker';
import type {ImageSelectorItem} from '@/components/image-selector';
import {Button} from '@/components/ui/button';
import {useLang} from '@/lib/lang';
import {useDialog} from '@/stores/dialog';

interface Props {
    onChoose: (selected: ImageSelectorItem[]) => void;
}

export function ImagePickerDialog({onChoose}: Props) {
    const {t} = useLang();
    const {openDialog, closeDialog} = useDialog();

    const selectedItemsRef = useRef<ImageSelectorItem[]>([]);

    const onChooseHandle = useCallback(() => {
        onChoose(selectedItemsRef.current);
        closeDialog();
    }, [onChoose, closeDialog]);

    const onClick = () => {
        selectedItemsRef.current = [];
        openDialog({
            title: t('admin.products_edit.images.add_images'),
            className: 'max-w-[1000px] min-h-[300px] max-h-[80vh] overflow-y-auto',
            content: (
                <ImagePicker
                    resource={route('admin.media.api.index')}
                    onChange={items => {
                        selectedItemsRef.current = items;
                    }}
                />
            ),
            footer: (
                <div>
                    <Button variant="secondary" onClick={onChooseHandle}>Choose</Button>
                </div>
            ),
        });
    };

    return (
        <Button variant="outline" onClick={onClick}>
            <PlusIcon className="size-4"/>
            {t('admin.products_edit.images.add_images')}
        </Button>
    );
}
