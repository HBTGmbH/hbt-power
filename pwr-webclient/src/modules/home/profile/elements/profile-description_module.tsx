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

interface ProfileDescriptionProps {
    description: string;
    maxCharacters: number;
    baseProfile: BaseProfile;
    initials: string;
}

interface ProfileDescriptionLocalProps {

}

interface ProfileDescriptionState {
    text: string;
    edit: boolean;
}

interface ProfileDescriptionDispatch {
    saveProfile(initials: string, description: string): void;
}

class ProfileDescriptionModule extends React.Component<ProfileDescriptionProps & ProfileDescriptionLocalProps & ProfileDescriptionDispatch, ProfileDescriptionState> {

    constructor(props) {
        super(props);
        this.state = {
            text: '',
            edit: false
        };
    }

    public static mapStateToProps(state: ApplicationState, localProps: ProfileDescriptionLocalProps): ProfileDescriptionProps {
        const description = !isNullOrUndefined(state.profileStore.profile) ? state.profileStore.profile.description : 'Not Found';
        let baseProfile: BaseProfile = null;
        if (!isNullOrUndefined(state.profileStore.profile)) {
            baseProfile = newBaseProfile(state.profileStore.profile.id, state.profileStore.profile.description, state.profileStore.profile.lastEdited);
        }
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';

        return {
            description: description,
            maxCharacters: PROFILE_DESCRIPTION_LENGTH,
            baseProfile: baseProfile,
            initials: initials
        };
    }

    public static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ProfileDescriptionDispatch {
        return {
            saveProfile: (initials, description) => dispatch(ProfileDataAsyncActionCreator.saveDescription(initials, description)) //TODO
        };
    }

    private handleSave = () => {
        this.props.saveProfile(this.props.initials, this.state.text);
    };

    private handleTextBlur = () => {
        if (this.props.description != this.state.text) {
            this.handleSave();
        }
    };

    private handleTextChange = (event: React.FormEvent<HTMLSelectElement>) => {
        let charCount: number = event.currentTarget.value.length;
        let newString: string = event.currentTarget.value.substring(0, this.props.maxCharacters);
        this.setState({
            text: newString
        });
    };

    private progressValue = () => {
        return (this.state.text.length / this.props.maxCharacters) * 100;
    };

    private handleOnClick = () => {
        this.setState({
            text: this.props.description,
            edit: true
        });
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
                    value={this.state.edit ? this.state.text : this.props.description}
                    onClick={() => {
                        this.handleOnClick();
                    }}
                />
                <LinearProgress
                    value={this.progressValue()}
                    variant='determinate'
                    color='primary'
                />
                <div>Zeichen: {this.state.text.length}/{this.props.maxCharacters}</div>
            </div>
        );
    }
}

export const ProfileDescription: React.ComponentClass<ProfileDescriptionLocalProps> = connect(ProfileDescriptionModule.mapStateToProps, ProfileDescriptionModule.mapDispatchToProps)(ProfileDescriptionModule);
