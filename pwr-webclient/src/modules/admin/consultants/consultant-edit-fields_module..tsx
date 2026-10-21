import * as React from 'react';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {FormControl, FormControlLabel} from '@material-ui/core';
import {PwrDatePicker} from '../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../model/DatePickerType';
import Checkbox from '@material-ui/core/Checkbox';
import {ConsultantEditProfilePicture} from './consultant-edit-profile-picture_module';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PwrFormSection} from '../../general/pwr-form-section';
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
        {/* Spacing scale (#40): a section of its own, fields 16 px apart */}
        <PwrFormSection title={PowerLocalize.get('ConsultantEdit.PersonalData')}>
            {props.children}
            {props.children && <PwrSpacer/>}
            <LimitedTextField
                hideProgress={true}
                maxCharacters={100}
                value={props.firstName}
                label={PowerLocalize.get('FirstName')}
                onChange={(e, v) => props.onFirstNameChange(v)}
            />
            <PwrSpacer/>
            <LimitedTextField
                hideProgress={true}
                maxCharacters={100}
                value={props.lastName}
                label={PowerLocalize.get('LastName')}
                onChange={(e, v) => props.onLastNameChange(v)}
            />
            <PwrSpacer/>
            <LimitedTextField
                hideProgress={true}
                maxCharacters={100}
                value={props.title || ''}
                label={PowerLocalize.get('Title.Singular')}
                onChange={(e, v) => props.onTitleChange(v)}
            />
            <PwrSpacer/>
            <PwrDatePicker
                onChange={props.onBirthDateChange}
                placeholderDate={!(props.birthDate) ? new Date() : props.birthDate}
                label={PowerLocalize.get('ConsultantEdit.BirthDate')}
                type={DatePickerType.FULL_DATE}
                disableOpenEnd
            />
            <PwrSpacer/>
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
        </PwrFormSection>
    </div>;
}
