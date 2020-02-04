export enum LanguageLevel {
    BASIC = 'BASIC',
    ADVANCED = 'ADVANCED',
    BUSINESS_FLUENT = 'BUSINESS_FLUENT',
    NATIVE = 'NATIVE'
}

export function toIdx(lvl: LanguageLevel): number {
    switch (lvl) {
        case LanguageLevel.BASIC:
            return 0;
        case LanguageLevel.ADVANCED:
            return 1;
        case LanguageLevel.BUSINESS_FLUENT:
            return 2;
        case LanguageLevel.NATIVE:
            return 3;
        default:
            return 0;
    }
}

export function toLanguageLevel(name: string): LanguageLevel {
    switch (name) {
        case 'BASIC':
            return LanguageLevel.BASIC;
        case 'ADVANCED':
            return LanguageLevel.ADVANCED;
        case 'BUSINESS_FLUENT':
            return LanguageLevel.BUSINESS_FLUENT;
        case 'NATIVE':
            return LanguageLevel.NATIVE;
    }
    return null;
}

export function translationToLevel(translation: string): LanguageLevel {

    console.log('TransLevel:', translation);
    switch (translation) {
        case'Anfänger':
            return LanguageLevel.BASIC;
        case 'Fortgeschrtten'  :
            return LanguageLevel.ADVANCED;
        case 'Verhandlungssicher':
            return LanguageLevel.BUSINESS_FLUENT;
        case 'Muttersprache' :
            return LanguageLevel.NATIVE;
    }
    return null;
}
