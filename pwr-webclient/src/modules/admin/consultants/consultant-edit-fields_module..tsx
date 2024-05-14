import * as React from 'react';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {FormControl, FormControlLabel} from '@material-ui/core';
import {PwrDatePicker} from '../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../model/DatePickerType';
import Checkbox from '@material-ui/core/Checkbox';
import {ConsultantEditProfilePicture} from './consultant-edit-profile-picture_module';
import Typography from '@material-ui/core/Typography';
import {PropsWithChildren} from "react";

interface ConsultantEditFieldsProps extends PropsWithChildren {
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

export function ConsultantEditFields(props: ConsultantEditFieldsProps) {
    return <div>
        <ConsultantEditProfilePicture profilePictureId={props.profilePictureId}
                                      onProfilePictureIdChange={props.onProfilePictureIdChange} />
        <Typography variant="subtitle1" gutterBottom className={"pwr-margin-top"}>
            Persönliche Daten
        </Typography>
        {props.children}
        <LimitedTextField
            className="pwr-margin-top pwr-margin-bottom"
            hideProgress={true}
            maxCharacters={100}
            value={props.firstName}
            label={PowerLocalize.get('FirstName')}
            onChange={(e, v) => props.onFirstNameChange(v)}
        />
        <LimitedTextField
            className="pwr-margin-top pwr-margin-bottom"
            hideProgress={true}
            maxCharacters={100}
            value={props.lastName}
            label={PowerLocalize.get('LastName')}
            onChange={(e, v) => props.onLastNameChange(v)}
        />
        <LimitedTextField
            className="pwr-margin-top pwr-margin-bottom"
            hideProgress={true}
            maxCharacters={100}
            value={props.title || ''}
            label={PowerLocalize.get('Title.Singular')}
            onChange={(e, v) => props.onTitleChange(v)}
        />
        <PwrDatePicker
            onChange={props.onBirthDateChange}
            placeholderDate={!(props.birthDate) ? new Date() : props.birthDate}
            label={'Geburtstag'}
            type={DatePickerType.FULL_DATE}
            disableOpenEnd
        />
        <div>
            <FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={props.active}
                            onChange={(e: any, v: boolean) => props.onActiveChange(v)}
                            color={'primary'}
                        />
                    }
                    label={PowerLocalize.get('ConsultantEdit.Active')}
                />
            </FormControl>
        </div>
    </div>;
}
