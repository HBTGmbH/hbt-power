import * as React from 'react';
import {PowerLocalize} from '../../localization/PowerLocalizer';

export enum PwrErrorType {
    DATE_START_AFTER_END = 'DATE_START_AFTER_END'

}

interface PwrErrorProps {
    error: PwrErrorType;
}

const NoError = () => <React.Fragment/>;

const Error = (props: { pwrError: PwrErrorType }) => <span style={{color: 'red'}}>
    {PowerLocalize.get('PwrError.' + props.pwrError)};
</span>;


export const PwrError = (props: PwrErrorProps) => props.error ? <Error pwrError={props.error}/> : <NoError/>;
