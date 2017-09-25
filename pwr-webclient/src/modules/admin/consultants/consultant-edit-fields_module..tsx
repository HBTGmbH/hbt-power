import * as React from 'react';
import {LimitedTextField} from '../../general/limited-text-field-module.';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';
import {Checkbox, DatePicker} from 'material-ui';
import {formatFullLocalizedDate} from '../../../utils/DateUtil';

interface ConsultantEditFieldsProps {
    firstName: string;
    lastName: string;
    title: string;
    birthDate: Date;
    active: boolean;
    onFirstNameChange(val: string): void;
    onLastNameChange(val: string): void;
    onTitleChange(val: string): void;
    onBirthDateChange(val: Date): void;
    onActiveChange(active: boolean): void;
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
            <br/>
            <DatePicker
                style={{width: "350px"}}
                floatingLabelText={PowerLocalize.get("Birthdate")}
                value={this.props.birthDate}
                formatDate={formatFullLocalizedDate}
                onChange={(e: null, date: Date) => this.props.onBirthDateChange(date)}
            />
            <Checkbox checked={this.props.active}
                      onCheck={(e, v) => this.props.onActiveChange(v)}
                      label={PowerLocalize.get("ConsultantEdit.Active")}

            />
        </div>);
    }
}
