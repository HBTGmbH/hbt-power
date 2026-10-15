import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../reducers/reducerIndex';
import {ProfileDataAsyncActionCreator} from '../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../../model/PwrConstants';
import {setDescription} from '../../../../reducers/profile-new/profile/actions/ProfileActions';
import {LimitedTextField} from '../../../general/limited-text-field-module';
import {ThunkDispatch} from 'redux-thunk';

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
        };
    }

    public static mapStateToProps(state: ApplicationState, localProps: ProfileDescriptionLocalProps): ProfileDescriptionProps {
        const description = 'n/a' && state.profileStore.profile.description;
        return {
            description: description,
            maxCharacters: PROFILE_DESCRIPTION_LENGTH,
        };
    }

    public static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ProfileDescriptionDispatch {
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
            });
        }
    };

    private handleTextBlur = () => {
        this.handleSave();
    };

    private handleTextChange = (value: string) => {
        this.props.setDescription(value);
        this.setState({
            dirty: true
        });
    };

    private progressValue = () => {
        return (this.props.description.length / this.props.maxCharacters) * 100;
    };


    render() {
        return (
            <div onBlur={this.handleTextBlur}>
                <LimitedTextField
                    label={'Werbetext'}
                    fullWidth={true}
                    multiLine={true}
                    maxCharacters={PROFILE_DESCRIPTION_LENGTH}
                    rows={10}
                    onChange={(e: any, v) => this.handleTextChange(v)}
                    value={this.props.description}
                />
            </div>
        );
    }
}

export const ProfileDescription = connect(ProfileDescriptionModule.mapStateToProps, ProfileDescriptionModule.mapDispatchToProps)(ProfileDescriptionModule);
