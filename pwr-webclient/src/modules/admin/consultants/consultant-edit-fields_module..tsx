import * as React from 'react';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {FormControlLabel} from '@material-ui/core';
import {PwrDatePicker} from '../../general/pwr-date-picker_module';
import {DatePickerType} from '../../../model/DatePickerType';
import Checkbox from '@material-ui/core/Checkbox';
import {ConsultantEditProfilePicture} from './consultant-edit-profile-picture_module';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {makeStyles} from '@material-ui/core/styles';
import {PropsWithChildren} from "react";
import {LocalDate} from '../../../utils/DateUtil';

interface ConsultantEditFieldsProps extends PropsWithChildren {
    firstName: string;
    lastName: string;
    title: string;
    birthDate: LocalDate;
    active: boolean;
    profilePictureId: string;

    onFirstNameChange(val: string): void;

    onLastNameChange(val: string): void;

    onTitleChange(val: string): void;

    onBirthDateChange(val: LocalDate | null): void;

    onActiveChange(active: boolean): void;

    onProfilePictureIdChange(profilePictureId: string): void;
}

const useStyles = makeStyles(theme => ({
    // Picture left, fields right; on a narrow screen the picture above the fields
    columns: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: theme.spacing(4),
    },
    fields: {
        flex: '1 1 240px',
        minWidth: 0,
    },
}));

/**
 * Picture and personal data of a consultant, shared by the edit and the create dialog (#195). Further fields (the
 * initials when creating) come as children above the name, full width like the others.
 */
export function ConsultantEditFields(props: ConsultantEditFieldsProps) {
    const classes = useStyles();
    return <div className={classes.columns}>
        <ConsultantEditProfilePicture profilePictureId={props.profilePictureId}
                                      onProfilePictureIdChange={props.onProfilePictureIdChange}/>
        {/* Spacing scale (#40): fields 16 px apart */}
        <div className={classes.fields}>
            {props.children}
            {props.children && <PwrSpacer/>}
            <LimitedTextField
                fullWidth
                hideProgress={true}
                maxCharacters={100}
                value={props.firstName}
                label={PowerLocalize.get('FirstName')}
                onChange={(e, v) => props.onFirstNameChange(v)}
            />
            <PwrSpacer/>
            <LimitedTextField
                fullWidth
                hideProgress={true}
                maxCharacters={100}
                value={props.lastName}
                label={PowerLocalize.get('LastName')}
                onChange={(e, v) => props.onLastNameChange(v)}
            />
            <PwrSpacer/>
            <LimitedTextField
                fullWidth
                hideProgress={true}
                maxCharacters={100}
                value={props.title || ''}
                label={PowerLocalize.get('Title.Singular')}
                onChange={(e, v) => props.onTitleChange(v)}
            />
            <PwrSpacer/>
            <PwrDatePicker
                fullWidth
                onChange={props.onBirthDateChange}
                value={props.birthDate}
                label={PowerLocalize.get('ConsultantEdit.BirthDate')}
                type={DatePickerType.FULL_DATE}
                disableOpenEnd
            />
            <PwrSpacer size="tight"/>
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
        </div>
    </div>;
}
