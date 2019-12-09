export enum LanguageLevel {
    BASIC = 'BASIC',
    ADVANCED = 'ADVANCED',
    BUSINESS_FLUENT = 'BUSINESS_FLUENT',
    NATIVE = 'NATIVE'
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
