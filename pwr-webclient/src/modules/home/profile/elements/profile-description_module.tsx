import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {ProfileDataAsyncActionCreator} from '../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../../model/PwrConstants';
import {setDescription} from '../../../../reducers/profile-new/profile/actions/ProfileActions';
import {LimitedTextField} from '../../../general/limited-text-field-module';
import {ThunkDispatch} from 'redux-thunk';
import {isProfileReadOnly} from '../../../../reducers/profile-new/ProfileAccess';
import {PwrFormSubCaption} from '../../../general/pwr-typography';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import Typography from '@material-ui/core/Typography';

interface ProfileDescriptionProps {
    description: string;
    maxCharacters: number;
    /** The profile of a colleague (#350) */
    readOnly: boolean;
}

interface ProfileDescriptionLocalProps {

}

interface ProfileDescriptionDispatch {
    saveDescription(description: string): void;

    setDescription(description: string): void;
}

class ProfileDescriptionModule extends React.Component<ProfileDescriptionProps & ProfileDescriptionLocalProps & ProfileDescriptionDispatch> {

    /**
     * No state: a setState while typing renders the field again before react-redux passes the new text down, with the
     * old one, and the cursor jumps to the end (#354)
     */
    private dirty = false;

    public static mapStateToProps(state: ApplicationState, localProps: ProfileDescriptionLocalProps): ProfileDescriptionProps {
        const description = 'n/a' && state.profileStore.profile.description;
        return {
            description: description,
            maxCharacters: PROFILE_DESCRIPTION_LENGTH,
            readOnly: isProfileReadOnly(state),
        };
    }

    public static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ProfileDescriptionDispatch {
        return {
            saveDescription: description => dispatch(ProfileDataAsyncActionCreator.saveDescription(description)),
            setDescription: description => dispatch(setDescription(description))
        };
    }

    private handleSave = () => {
        if (this.dirty) {
            this.props.saveDescription(this.props.description);
            // We'll just assume that the save is always successful (for now).
            this.dirty = false;
        }
    };

    private handleTextBlur = () => {
        this.handleSave();
    };

    private handleTextChange = (value: string) => {
        this.props.setDescription(value);
        this.dirty = true;
    };

    private progressValue = () => {
        return (this.props.description.length / this.props.maxCharacters) * 100;
    };


    render() {
        if (this.props.readOnly) {
            // Text, no field: a colleague reads it (#350)
            return <div>
                <PwrFormSubCaption>{PowerLocalize.get('Profile.Description')}</PwrFormSubCaption>
                <Typography style={{whiteSpace: 'pre-wrap'}}>
                    {this.props.description || PowerLocalize.get('Profile.Entries.NotAvailable')}
                </Typography>
            </div>;
        }
        return (
            <div onBlur={this.handleTextBlur}>
                <LimitedTextField
                    label={'Werbetext'}
                    fullWidth={true}
                    multiLine={true}
                    maxCharacters={PROFILE_DESCRIPTION_LENGTH}
                    rows={6}
                    onChange={(e: any, v) => this.handleTextChange(v)}
                    value={this.props.description}
                />
            </div>
        );
    }
}

export const ProfileDescription = connect(ProfileDescriptionModule.mapStateToProps, ProfileDescriptionModule.mapDispatchToProps)(ProfileDescriptionModule);
