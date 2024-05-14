import * as React from 'react';
import {ChangeEvent} from 'react';
import {Theme} from '@material-ui/core';


export interface ThemeProps {
    theme: Theme;
}

export function provideValueTo(handler: (v: string) => void): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handler(e.target.value);
    };
}
