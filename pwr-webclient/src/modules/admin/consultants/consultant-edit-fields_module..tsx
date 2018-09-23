import * as React from 'react';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';
import {Checkbox,FormControl,FormControlLabel} from '@material-ui/core';
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
                label={PowerLocalize.get('FirstName')}
                onChange={(e, v) => this.props.onFirstNameChange(v)}
            />
            <br/>
            <LimitedTextField
                maxCharacters={100}
                value={this.props.lastName}
                label={PowerLocalize.get('LastName')}
                onChange={(e, v) => this.props.onLastNameChange(v)}
            />
            <LimitedTextField
                maxCharacters={100}
                value={isNullOrUndefined(this.props.title) ? "" : this.props.title}
                label={PowerLocalize.get('Title.Singular')}
                onChange={(e, v) => this.props.onTitleChange(v)}
            />
            <br/>

            <FormControl style={{float:'right'}}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.props.active}
                            onChange={(e:any, v:boolean) => this.props.onActiveChange(v)}
                            color={'primary'}
                        />
                     }
                    label={PowerLocalize.get("ConsultantEdit.Active")}
                />

            </FormControl>
        </div>);
    }
}
/*


<DatePicker
                style={{width: "350px"}}
                label={PowerLocalize.get("Birthdate")}
                value={this.props.birthDate}
                formatDate={formatFullLocalizedDate}
                onChange={(e: null, date: Date) => this.props.onBirthDateChange(date)}
            />
 */