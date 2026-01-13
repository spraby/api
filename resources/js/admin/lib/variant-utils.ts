import { isEqual, sortBy } from 'lodash-es';

import type { Option, Variant, VariantValue } from '@/types/models';

/**
 * Type for variant value input (minimal required fields)
 * variant_id will be filled automatically by Laravel when saving
 */
export interface VariantValueInput {
    option_id: number;
    option_value_id: number;
}

/**
 * Generate all possible combinations of variant values from options
 * Uses cartesian product to generate all combinations
 *
 * @param options - Array of options with their values
 * @returns Array of all possible variant value combinations
 */
function generateAllCombinations(options: Option[]): VariantValueInput[][] {
    const filteredOptions = options.filter(option => option.values && option.values.length > 0);

    if (filteredOptions.length === 0) {
        return [];
    }

    const firstOption = filteredOptions[0];

    if (!firstOption?.values) {
        return [];
    }

    // Start with first option's values as base combinations
    let combinations: VariantValueInput[][] = firstOption.values.map(value => [{
        option_id: firstOption.id ?? 0,
        option_value_id: value.id ?? 0,
    }]);

    // Add each subsequent option's values to all existing combinations (cartesian product)
    for (let i = 1; i < filteredOptions.length; i++) {
        const option = filteredOptions[i];

        if (!option?.values) {
            continue;
        }

        const newCombinations: VariantValueInput[][] = [];

        for (const combination of combinations) {
            for (const value of option.values) {
                newCombinations.push([
                    ...combination,
                    {
                        option_id: option.id ?? 0,
                        option_value_id: value.id ?? 0,
                    },
                ]);
            }
        }

        combinations = newCombinations;
    }

    return combinations;
}

/**
 * Generate variant values from options
 * Finds the first unique combination that doesn't exist in existing variants
 *
 * @param options - Array of options with their values
 * @param existingVariants - Array of existing variants to avoid duplicates
 * @returns Array of generated variant values for the first unique combination, or null if all combinations are used
 */
export function generateVariantValuesFromOptions(
    options: Option[],
    existingVariants: Variant[] = []
): VariantValueInput[] | null {
    // Generate all possible combinations
    const allCombinations = generateAllCombinations(options);

    if (allCombinations.length === 0) {
        return null;
    }

    // Extract existing variant values combinations
    const existingCombinations = existingVariants
        .filter(variant => variant.values && variant.values.length > 0)
        .map(variant => variant.values ?? [])
        .filter(values => values.length > 0);

    // Find first combination that doesn't exist yet
    for (const combination of allCombinations) {
        const isUnique = !existingCombinations.some(existing =>
            compareVariantValues(existing, combination)
        );

        if (isUnique) {
            return combination;
        }
    }

    // If all combinations are used, return null
    return null;
}

/**
 * Compare two arrays of variant values by their option_id and option_value_id
 * Ignores variant_id and other fields that may differ between new and existing values
 *
 * @param values1 - First array of values (existing)
 * @param values2 - Second array of values (generated)
 * @returns true if arrays are equal, false otherwise
 */
export function compareVariantValues(
    values1: (VariantValue | VariantValueInput)[] | undefined,
    values2: VariantValueInput[]
): boolean {
    if (!values1 || values1.length === 0) {
        return values2.length === 0;
    }

    if (values1.length !== values2.length) {
        return false;
    }

    // Normalize both arrays to only include option_id and option_value_id
    const normalize = (values: (VariantValue | VariantValueInput)[]) =>
        values.map(v => ({
            option_id: v.option_id,
            option_value_id: v.option_value_id,
        }));

    // Sort and compare using lodash
    const sorted1 = sortBy(normalize(values1), ['option_id', 'option_value_id']);
    const sorted2 = sortBy(normalize(values2), ['option_id', 'option_value_id']);

    return isEqual(sorted1, sorted2);
}

/**
 * Check if there are available variant combinations that are not yet used
 *
 * @param options - Array of options with their values
 * @param existingVariants - Array of existing variants
 * @returns true if there are available combinations, false if all are used
 */
export function hasAvailableVariantCombinations(
    options: Option[],
    existingVariants: Variant[] = []
): boolean {
    // Generate all possible combinations
    const allCombinations = generateAllCombinations(options);

    if (allCombinations.length === 0) {
        return false;
    }

    // Extract existing variant values combinations
    const existingCombinations = existingVariants
        .filter(variant => variant.values && variant.values.length > 0)
        .map(variant => variant.values ?? [])
        .filter(values => values.length > 0);

    // Check if any combination is available
    return allCombinations.some(combination => {
        return !existingCombinations.some(existing =>
            compareVariantValues(existing, combination)
        );
    });
}