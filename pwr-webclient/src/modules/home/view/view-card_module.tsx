import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {Card, CardActions, CardHeader, FontIcon, RaisedButton} from 'material-ui';
import {formatFullLocalizedDate} from '../../../utils/DateUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileDialog} from './view-profile-dialog_module';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../../Paths';

interface ViewCardProps {
    viewProfile: ViewProfile;
}

interface ViewCardLocalProps {
    viewProfileId: string;
}

interface ViewCardLocalState {
    dialogOpen: boolean;
}

interface ViewCardDispatch {
    deleteViewProfile(id: string): void;
    navigateTo(target: string): void;
    generate(viewProfileId: string): void;
    updateViewProfile(viewProfileId: string, name: string, description: string, charsPerLine: number): void;
}

class ViewCardModule extends React.Component<
    ViewCardProps
    & ViewCardLocalProps
    & ViewCardDispatch, ViewCardLocalState> {

    constructor(props: ViewCardLocalProps & ViewCardProps & ViewCardDispatch) {
        super(props);
        this.state = {
            dialogOpen: false
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: ViewCardLocalProps): ViewCardProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles().get(localProps.viewProfileId)
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewCardDispatch {
        return {
            deleteViewProfile: (id) => dispatch(ViewProfileActionCreator.AsyncDeleteViewProfile(id)),
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            generate: viewProfileId => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId)),
            updateViewProfile: (viewProfileId, name, description, charsPerLine) => {
                dispatch(ViewProfileActionCreator.AsyncUpdateViewProfile(viewProfileId, description, name, charsPerLine))
            }
        };
    }

    private setDialogOpen(open: boolean) {
        this.setState({
            dialogOpen: open
        })
    }

    private handleUpdate = (name: string, description: string, charsPerLine: number) => {
        this.props.updateViewProfile(this.props.viewProfileId, name, description, charsPerLine);
        this.setDialogOpen(false);
    };

    render() {
        return (
        <Card className="fullWidth">
            <ViewProfileDialog
                viewProfile={this.props.viewProfile}
                onRequestClose={() => this.setDialogOpen(false)}
                onSave={this.handleUpdate}
                open={this.state.dialogOpen}
            />
            <CardHeader
                title={this.props.viewProfile.viewProfileInfo.name}
                subtitle={PowerLocalize.get("ViewProfileCard.Subtitle") + formatFullLocalizedDate(this.props.viewProfile.viewProfileInfo.creationDate)}
            />
            <h6 className="padding-left-16px">{this.props.viewProfile.viewProfileInfo.viewDescription}</h6>
            <CardActions>
                <div>
                    <RaisedButton
                        className="mui-margin"
                        onClick={() => this.setDialogOpen(true)}
                        label={PowerLocalize.get("ViewProfileCard.Action.EditInfo")}
                        icon={<FontIcon className="material-icons">info</FontIcon>}
                    />
                    <RaisedButton
                        className="mui-margin"
                        label={PowerLocalize.get("ViewProfileCard.Action.Edit")}
                        onClick={() => this.props.navigateTo(Paths.USER_VIEW_PROFILE.replace(":id", this.props.viewProfileId))}
                        icon={<FontIcon className="material-icons">edit</FontIcon>}
                    />
                    <RaisedButton
                        className="mui-margin"
                        label={PowerLocalize.get("Action.Delete")}
                        secondary={true}
                        icon={<FontIcon className="material-icons">delete</FontIcon>}
                        onClick={() => this.props.deleteViewProfile(this.props.viewProfileId)}
                    />
                    <RaisedButton
                        className="mui-margin"
                        primary={true}
                        label={PowerLocalize.get("Action.Generate.Word")}
                        onClick={() => this.props.generate(this.props.viewProfileId)}
                        icon={<FontIcon className="material-icons">open_in_new</FontIcon>}
                    />
                </div>
            </CardActions>
        </Card>);
    }
}

/**
 * @see ViewCardModule
 * @author nt
 * @since 11.09.2017
 */
export const ViewCard: React.ComponentClass<ViewCardLocalProps> = connect(ViewCardModule.mapStateToProps, ViewCardModule.mapDispatchToProps)(ViewCardModule);