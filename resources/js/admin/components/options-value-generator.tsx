import {useCallback, useEffect, useState} from "react";

import {ToggleButton} from "@/components/toggle-button.tsx";
import {Button} from "@/components/ui/button.tsx";
import {type Option, type OptionValue} from "@/types/data";

type GenerateData = Record<number, OptionValue[]>;

/**
 *
 * @param categories
 * @constructor
 */
export function OptionsValueGenerator({options = [], onGenerate}: {
    options: Option[],
    onGenerate: (combinations: OptionValue[][]) => void
}) {
    const [generateData, setGenerateData] = useState<GenerateData | null>(null);
    const [combinations, setCombinations] = useState<OptionValue[][]>([]);

    useEffect(() => {
        setCombinations(generateData ? generateVariantsCombinations(generateData) : []);
    }, [generateData]);

    /**
     *
     * @param generateData
     */
    const generateVariantsCombinations = (generateData: GenerateData) => Object.values(generateData).reduce<OptionValue[][]>((acc, group) => {
        if (acc.length === 0) {return group.map(item => [item]);}

        return acc.flatMap(combo => group.map(item => [...combo, item]));
    }, []);

    return <div className="flex flex-col gap-5">
        {
            !!options?.length &&
            <div className="p-5 bg-gray-50 rounded-xl">
                <OptionsBuilder options={options} onChange={setGenerateData}/>
            </div>
        }
        {
            !!options?.length &&
            <div className="flex justify-start">
                <Button
                    type="button"
                    disabled={!combinations?.length}
                    onClick={() => onGenerate(combinations)}
                >
                    {
                        combinations?.length ? `Generate ${combinations?.length} variant${combinations?.length > 1 ? 's' : ''}` : 'Generate'
                    }
                </Button>
            </div>
        }
    </div>
}

/**
 *
 * @param options
 * @param onChange
 * @constructor
 */
const OptionsBuilder = ({options, onChange}: {
    options: Option[],
    onChange: (data: GenerateData | null) => void
}) => {

    const [selectedData, setSelectedData] = useState<GenerateData>({});

    const isCompleted = useCallback((data: GenerateData) => {
        if (!options?.length) {return false;}
        const completedOptionsNumber = options?.reduce((acc, o) => {
            return acc + ((o.id && data[o.id]?.length) ? 1 : 0);
        }, 0);

        return completedOptionsNumber === options?.length
    }, [options]);

    useEffect(() => {
        onChange(isCompleted(selectedData) ? selectedData : null)
    }, [selectedData, isCompleted, onChange]);

    const onSelect = (option: Option, selectedValues: OptionValue[]) => {
        const {id} = option;

        if (id) {
            setSelectedData(prev => {
                return {
                    ...prev,
                    [id]: selectedValues
                }
            })
        }
    }

    return <div className="flex flex-col gap-5">
        {
            options?.map(o => <OptionLine key={o.id} option={o} onSelect={v => onSelect(o, v)}/>)
        }
    </div>
}

/**
 *
 * @param option
 * @param onSelect
 * @constructor
 */
const OptionLine = ({option, onSelect}: { option: Option, onSelect: (values: OptionValue[]) => void }) => {
    const [selectedValues, setSelectedValues] = useState<OptionValue[]>([])

    const onClick = (value: OptionValue) => setSelectedValues(prev =>
        prev.some(s => s.id === value.id) ? prev.filter(s => s.id !== value.id) : [...prev, value]
    );

    useEffect(() => {
        onSelect(selectedValues);
    }, [selectedValues, onSelect]);

    return <div className="flex flex-col gap-5">
        <div className="flex gap-2">
            <span className="text-[13px] font-bold">{option.title}</span>
            {selectedValues.length > 0 && (
                <span
                    className="flex justify-center items-center rounded-full bg-primary/10 leading-none px-2 text-xs text-primary">{selectedValues.length}</span>
            )}

            <button
                type="button"
                className="text-[11px] text-primary hover:underline"
                onClick={() => setSelectedValues(prev =>
                    prev.length === (option.values?.length ?? 0) ? [] : (option.values ?? [])
                )}
            >
                {selectedValues.length === (option.values?.length ?? 0) ? 'Снять все' : 'Выбрать все'}
            </button>
        </div>

        <div className="flex gap-2">
            {
                option.values?.slice().sort((a, b) => a.position - b.position)?.map(v => {
                    const active = selectedValues.some(s => s.id === v.id);

                    return <ToggleButton key={v.id} onClick={() => onClick(v)} active={active} title={v.value}/>
                })
            }
        </div>
    </div>
}
