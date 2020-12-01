import * as React from 'react';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';
import {FormControl, FormControlLabel} from '@material-ui/core';
import {PwrDatePicker} from '../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../model/DatePickerType';
import Checkbox from '@material-ui/core/Checkbox';
import {ConsultantEditProfilePicture} from './consultant-edit-profile-picture_module';
import Typography from '@material-ui/core/Typography';

interface ConsultantEditFieldsProps {
    firstName: string;
    lastName: string;
    title: string;
    birthDate: Date;
    active: boolean;
    profilePictureId: string;

    onFirstNameChange(val: string): void;

    onLastNameChange(val: string): void;

    onTitleChange(val: string): void;

    onBirthDateChange(val: Date): void;

    onActiveChange(active: boolean): void;

    onProfilePictureIdChange(profilePictureId: string): void;
}

interface ConsultantEditFieldsState {

}

export class ConsultantEditFields extends React.Component<ConsultantEditFieldsProps, ConsultantEditFieldsState> {


    render() {
        return (<div>
            <ConsultantEditProfilePicture profilePictureId={this.props.profilePictureId}
                                          onProfilePictureIdChange={this.props.onProfilePictureIdChange}/>
            <Typography variant="subtitle1" gutterBottom className={"pwr-margin-top"}>
                Persönliche Daten
            </Typography>
            {this.props.children}
            <LimitedTextField
                className="pwr-margin-top pwr-margin-bottom"
                hideProgress={true}
                maxCharacters={100}
                value={this.props.firstName}
                label={PowerLocalize.get('FirstName')}
                onChange={(e, v) => this.props.onFirstNameChange(v)}
            />
            <LimitedTextField
                className="pwr-margin-top pwr-margin-bottom"
                hideProgress={true}
                maxCharacters={100}
                value={this.props.lastName}
                label={PowerLocalize.get('LastName')}
                onChange={(e, v) => this.props.onLastNameChange(v)}
            />
            <LimitedTextField
                className="pwr-margin-top pwr-margin-bottom"
                hideProgress={true}
                maxCharacters={100}
                value={isNullOrUndefined(this.props.title) ? '' : this.props.title}
                label={PowerLocalize.get('Title.Singular')}
                onChange={(e, v) => this.props.onTitleChange(v)}
            />
            <PwrDatePicker
                onChange={this.props.onBirthDateChange}
                placeholderDate={isNullOrUndefined(this.props.birthDate) ? new Date() : this.props.birthDate}
                label={'Geburtstag'}
                type={DatePickerType.FULL_DATE}
                disableOpenEnd
            />
            <div>
                <FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={this.props.active}
                                onChange={(e: any, v: boolean) => this.props.onActiveChange(v)}
                                color={'primary'}
                            />
                        }
                        label={PowerLocalize.get('ConsultantEdit.Active')}
                    />
                </FormControl>
            </div>
        </div>);
    }
}
