import { isEqual, sortBy } from 'lodash-es';

import type { Option, OptionValue, Variant, VariantValue } from '@/types/models';

/**
 * Type for variant value input (minimal required fields)
 * variant_id will be filled automatically by Laravel when saving
 */
export interface VariantValueInput {
    option_id: number;
    option_value_id: number;
}

/**
 * Result of variant generation
 */
export interface GenerateVariantResult {
    values: VariantValueInput[];
    title: string;
}

/**
 * Statistics about variant combinations
 */
export interface VariantCombinationStats {
    total: number;
    used: number;
    available: number;
}

/**
 * Service for working with product variants
 * Provides methods for generating, validating, and managing variant combinations
 */
class VariantServiceClass {
    /**
     * Generate variant values from options
     * Finds the first unique combination that doesn't exist in existing variants
     * Generates combinations lazily to avoid generating all possible combinations at once
     *
     * @param options - Array of options with their values
     * @param existingVariants - Array of existing variants to avoid duplicates
     * @returns Generated variant values for the first unique combination, or null if all combinations are used
     */
    generateVariantValues(
        options: Option[],
        existingVariants: Variant[] = []
    ): VariantValueInput[] | null {
        const filteredOptions = this.filterOptionsWithValues(options);

        if (filteredOptions.length === 0) {
            return null;
        }

        const existingCombinations = this.extractExistingCombinations(existingVariants);
        const generator = this.createCombinationsGenerator(filteredOptions);

        for (const combination of generator) {
            if (this.isCombinationUnique(combination, existingCombinations)) {
                return combination;
            }
        }

        return null;
    }

    /**
     * Generate variant with values and auto-generated title
     *
     * @param options - Array of options with their values
     * @param existingVariants - Array of existing variants to avoid duplicates
     * @returns Generated variant result with values and title, or null if all combinations are used
     */
    generateVariant(
        options: Option[],
        existingVariants: Variant[] = []
    ): GenerateVariantResult | null {
        const values = this.generateVariantValues(options, existingVariants);

        if (!values) {
            return null;
        }

        const title = this.generateTitle(values, options);

        return { values, title };
    }

    /**
     * Check if there are available variant combinations that are not yet used
     * Uses lazy generation to stop as soon as first available combination is found
     *
     * @param options - Array of options with their values
     * @param existingVariants - Array of existing variants
     * @returns true if there are available combinations, false if all are used
     */
    hasAvailableCombinations(
        options: Option[],
        existingVariants: Variant[] = []
    ): boolean {
        const filteredOptions = this.filterOptionsWithValues(options);

        if (filteredOptions.length === 0) {
            return false;
        }

        const existingCombinations = this.extractExistingCombinations(existingVariants);
        const generator = this.createCombinationsGenerator(filteredOptions);

        for (const combination of generator) {
            if (this.isCombinationUnique(combination, existingCombinations)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Compare two arrays of variant values by their option_id and option_value_id
     * Ignores variant_id and other fields that may differ between new and existing values
     *
     * @param values1 - First array of values (existing)
     * @param values2 - Second array of values (generated)
     * @returns true if arrays are equal, false otherwise
     */
    compareValues(
        values1: (VariantValue | VariantValueInput)[] | undefined,
        values2: VariantValueInput[]
    ): boolean {
        if (!values1 || values1.length === 0) {
            return values2.length === 0;
        }

        if (values1.length !== values2.length) {
            return false;
        }

        const normalize = (values: (VariantValue | VariantValueInput)[]) =>
            values.map(v => ({
                option_id: v.option_id,
                option_value_id: v.option_value_id,
            }));

        const sorted1 = sortBy(normalize(values1), ['option_id', 'option_value_id']);
        const sorted2 = sortBy(normalize(values2), ['option_id', 'option_value_id']);

        return isEqual(sorted1, sorted2);
    }

    /**
     * Get statistics about variant combinations
     *
     * @param options - Array of options with their values
     * @param existingVariants - Array of existing variants
     * @returns Statistics object with total, used, and available counts
     */
    getCombinationStats(
        options: Option[],
        existingVariants: Variant[] = []
    ): VariantCombinationStats {
        const total = this.getTotalCombinationsCount(options);
        const used = existingVariants.filter(v => v.values && v.values.length > 0).length;
        const available = Math.max(0, total - used);

        return { total, used, available };
    }

    /**
     * Calculate total number of possible combinations
     *
     * @param options - Array of options with their values
     * @returns Total number of possible combinations
     */
    getTotalCombinationsCount(options: Option[]): number {
        const filteredOptions = this.filterOptionsWithValues(options);

        if (filteredOptions.length === 0) {
            return 0;
        }

        return filteredOptions.reduce((total, option) => {
            return total * (option.values?.length ?? 0);
        }, 1);
    }

    /**
     * Generate all possible combinations (use with caution for large option sets)
     *
     * @param options - Array of options with their values
     * @returns Array of all possible variant value combinations
     */
    getAllCombinations(options: Option[]): VariantValueInput[][] {
        const filteredOptions = this.filterOptionsWithValues(options);

        if (filteredOptions.length === 0) {
            return [];
        }

        const generator = this.createCombinationsGenerator(filteredOptions);

        return Array.from(generator);
    }

    /**
     * Generate title for variant based on its values
     *
     * @param values - Variant values
     * @param options - Options to lookup value labels
     * @returns Generated title string
     */
    generateTitle(values: VariantValueInput[], options: Option[]): string {
        const parts: string[] = [];

        for (const value of values) {
            const option = options.find(o => o.id === value.option_id);
            const optionValue = option?.values?.find(v => v.id === value.option_value_id);

            if (optionValue) {
                parts.push(optionValue.value);
            }
        }

        return parts.join(' / ');
    }

    /**
     * Validate variant values against available options
     *
     * @param values - Variant values to validate
     * @param options - Available options
     * @returns Validation result with errors if any
     */
    validateValues(
        values: VariantValueInput[],
        options: Option[]
    ): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        for (const value of values) {
            const option = options.find(o => o.id === value.option_id);

            if (!option) {
                errors.push(`Option with id ${value.option_id} not found`);
                continue;
            }

            const optionValue = option.values?.find(v => v.id === value.option_value_id);

            if (!optionValue) {
                errors.push(
                    `Value with id ${value.option_value_id} not found in option "${option.name}"`
                );
            }
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Check if a specific combination already exists
     *
     * @param values - Variant values to check
     * @param existingVariants - Array of existing variants
     * @returns true if combination exists, false otherwise
     */
    combinationExists(values: VariantValueInput[], existingVariants: Variant[]): boolean {
        const existingCombinations = this.extractExistingCombinations(existingVariants);

        return !this.isCombinationUnique(values, existingCombinations);
    }

    /**
     * Find variant by its values combination
     *
     * @param values - Variant values to find
     * @param variants - Array of variants to search in
     * @returns Found variant or undefined
     */
    findByValues(values: VariantValueInput[], variants: Variant[]): Variant | undefined {
        return variants.find(variant => this.compareValues(variant.values, values));
    }

    /**
     * Get option values map for quick lookup
     *
     * @param options - Array of options
     * @returns Map of option_id -> option_value_id -> OptionValue
     */
    createOptionValuesMap(options: Option[]): Map<number, Map<number, OptionValue>> {
        const map = new Map<number, Map<number, OptionValue>>();

        for (const option of options) {
            if (!option.id || !option.values) {
                continue;
            }

            const valuesMap = new Map<number, OptionValue>();

            for (const value of option.values) {
                if (value.id) {
                    valuesMap.set(value.id, value);
                }
            }
            map.set(option.id, valuesMap);
        }

        return map;
    }

    // ============================================================================
    // Private methods
    // ============================================================================

    private filterOptionsWithValues(options: Option[]): Option[] {
        return options.filter(option => option.values && option.values.length > 0);
    }

    private extractExistingCombinations(variants: Variant[]): VariantValue[][] {
        return variants
            .filter(variant => variant.values && variant.values.length > 0)
            .map(variant => variant.values ?? [])
            .filter(values => values.length > 0);
    }

    private isCombinationUnique(
        combination: VariantValueInput[],
        existingCombinations: VariantValue[][]
    ): boolean {
        return !existingCombinations.some(existing => this.compareValues(existing, combination));
    }

    /**
     * Generator function that yields combinations one by one (lazy evaluation)
     * Uses cartesian product algorithm with iterative approach
     */
    private *createCombinationsGenerator(options: Option[]): Generator<VariantValueInput[]> {
        if (options.length === 0) {
            return;
        }

        const firstOption = options[0];

        if (!firstOption?.values || firstOption.values.length === 0) {
            return;
        }

        if (options.length === 1) {
            for (const value of firstOption.values) {
                yield [
                    {
                        option_id: firstOption.id ?? 0,
                        option_value_id: value.id ?? 0,
                    },
                ];
            }

            return;
        }

        for (const value of firstOption.values) {
            const restOptions = options.slice(1);
            const restGenerator = this.createCombinationsGenerator(restOptions);

            for (const restCombination of restGenerator) {
                yield [
                    {
                        option_id: firstOption.id ?? 0,
                        option_value_id: value.id ?? 0,
                    },
                    ...restCombination,
                ];
            }
        }
    }
}

/**
 * Singleton instance of VariantService
 */
export const VariantService = new VariantServiceClass();

// Export class for testing or extension
export { VariantServiceClass };

// ============================================================================
// Legacy exports for backward compatibility
// ============================================================================

/**
 * @deprecated Use VariantService.generateVariantValues() instead
 */
export const generateVariantValuesFromOptions = (
    options: Option[],
    existingVariants: Variant[] = []
): VariantValueInput[] | null => {
    return VariantService.generateVariantValues(options, existingVariants);
};

/**
 * @deprecated Use VariantService.compareValues() instead
 */
export const compareVariantValues = (
    values1: (VariantValue | VariantValueInput)[] | undefined,
    values2: VariantValueInput[]
): boolean => {
    return VariantService.compareValues(values1, values2);
};

/**
 * @deprecated Use VariantService.hasAvailableCombinations() instead
 */
export const hasAvailableVariantCombinations = (
    options: Option[],
    existingVariants: Variant[] = []
): boolean => {
    return VariantService.hasAvailableCombinations(options, existingVariants);
};