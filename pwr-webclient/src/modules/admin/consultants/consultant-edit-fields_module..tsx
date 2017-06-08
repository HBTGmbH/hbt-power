import * as React from 'react';
import {LimitedTextField} from '../../general/limited-text-field-module.';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';

interface ConsultantEditFieldsProps {
    firstName: string;
    lastName: string;
    title: string;
    onFirstNameChange(val: string): void;
    onLastNameChange(val: string): void;
    onTitleChange(val: string): void;
}

interface ConsultantEditFieldsState {

}

export class ConsultantEditFields extends React.Component<ConsultantEditFieldsProps, ConsultantEditFieldsState> {

    render() {
        return (<div>
            {this.props.children}
            <LimitedTextField
                maxCharacters={100}
                value={this.props.firstName}
                floatingLabelText={PowerLocalize.get('FirstName')}
                onChange={(e, v) => this.props.onFirstNameChange(v)}
            />
            <br/>
            <LimitedTextField
                maxCharacters={100}
                value={this.props.lastName}
                floatingLabelText={PowerLocalize.get('LastName')}
                onChange={(e, v) => this.props.onLastNameChange(v)}
            />
            <LimitedTextField
                maxCharacters={100}
                value={isNullOrUndefined(this.props.title) ? "" : this.props.title}
                floatingLabelText={PowerLocalize.get('Title.Singular')}
                onChange={(e, v) => this.props.onTitleChange(v)}
            />
        </div>);
    }
}
