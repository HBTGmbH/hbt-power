import {PowerLocalize} from '../localization/PowerLocalizer';

export interface ValidationError {
    msg?: string;
}

export type ValidatorFn = (value: string) => ValidationError | null;

export function validateNonEmptyProfileEntry(value: string): ValidationError | null {
    if (!value) {
        return {
            msg: PowerLocalize.get(`Validation.NameRequired`)
        };
    }
    return null;
}
