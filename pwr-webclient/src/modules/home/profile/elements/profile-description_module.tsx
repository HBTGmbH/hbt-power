import * as React from 'react';
import {connect} from 'react-redux';
import LinearProgress from '@material-ui/core/LinearProgress/LinearProgress';
import TextField from '@material-ui/core/TextField/TextField';
import {BaseProfile, newBaseProfile} from '../../../../reducers/profile-new/profile/model/BaseProfile';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {isNullOrUndefined} from 'util';
import {ProfileDataAsyncActionCreator} from '../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../../model/PwrConstants';
import {setDescription} from '../../../../reducers/profile-new/profile/actions/ProfileActions';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';

interface ProfileDescriptionProps {
    description: string;
    maxCharacters: number;
}

interface ProfileDescriptionLocalProps {

}

interface ProfileDescriptionState {
    dirty: boolean;
}

interface ProfileDescriptionDispatch {
    saveDescription(description: string): void;
    setDescription(description: string): void;
}

class ProfileDescriptionModule extends React.Component<ProfileDescriptionProps & ProfileDescriptionLocalProps & ProfileDescriptionDispatch, ProfileDescriptionState> {

    constructor(props: ProfileDescriptionProps & ProfileDescriptionLocalProps & ProfileDescriptionDispatch) {
        super(props);
        this.state = {
            dirty: false
        }
    }

    public static mapStateToProps(state: ApplicationState, localProps: ProfileDescriptionLocalProps): ProfileDescriptionProps {
        const description = "n/a" && state.profileStore.profile.description;
        return {
            description: description,
            maxCharacters: PROFILE_DESCRIPTION_LENGTH,
        };
    }

    public static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileDescriptionDispatch {
        return {
            saveDescription: description => dispatch(ProfileDataAsyncActionCreator.saveDescription(description)),
            setDescription: description => dispatch(setDescription(description))
        };
    }

    private handleSave = () => {
        if (this.state.dirty) {
            this.props.saveDescription(this.props.description);
            // We'll just assume that the save is always successful (for now).
            this.setState({
                dirty: false
            })
        }
    };

    private handleTextBlur = () => {
        this.handleSave();
    };

    private handleTextChange = (event: React.FormEvent<HTMLSelectElement>) => {
        let charCount: number = event.currentTarget.value.length;
        let newString: string = event.currentTarget.value.substring(0, this.props.maxCharacters);
        this.props.setDescription(newString);
        this.setState({
            dirty: true
        })
    };

    private progressValue = () => {
        return (this.props.description.length / this.props.maxCharacters) * 100;
    };


    render() {
        return (
            <div>
                <TextField
                    label={'Werbetext'}
                    fullWidth={true}
                    multiline={true}
                    rows={10}
                    onBlur={this.handleTextBlur}
                    onChange={(e: any) => this.handleTextChange(e)}
                    value={this.props.description}
                />
                <LinearProgress
                    value={this.progressValue()}
                    variant='determinate'
                    color='primary'
                />
                <div>{PowerLocalize.getFormatted('Profile.Description.AllowedCharacterText', this.props.description.length, this.props.maxCharacters)}</div>
            </div>
        );
    }
}

export const ProfileDescription: React.ComponentClass<ProfileDescriptionLocalProps> = connect(ProfileDescriptionModule.mapStateToProps, ProfileDescriptionModule.mapDispatchToProps)(ProfileDescriptionModule);
