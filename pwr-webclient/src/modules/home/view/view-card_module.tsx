import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {Card, CardActions, CardHeader, FlatButton} from 'material-ui';
import {formatFullLocalizedDate} from '../../../utils/DateUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileDialog} from './view-profile-dialog_module';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';

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
        <Card>
            <ViewProfileDialog
                viewProfile={this.props.viewProfile}
                onRequestClose={() => this.setDialogOpen(false)}
                onSave={this.handleUpdate}
                open={this.state.dialogOpen}
            />
            <CardHeader
                title={this.props.viewProfile.viewProfileInfo.name}
                subtitle={"Created on " + formatFullLocalizedDate(this.props.viewProfile.viewProfileInfo.creationDate)}
            />
            <h6 className="padding-left-16px">{this.props.viewProfile.viewProfileInfo.viewDescription}</h6>
            <CardActions>
                <FlatButton
                    onTouchTap={() => this.setDialogOpen(true)}
                    label={PowerLocalize.get("Action.Edit")}
                />
                <FlatButton
                    label={PowerLocalize.get("Action.Delete")}
                    onTouchTap={() => this.props.deleteViewProfile(this.props.viewProfileId)}
                />
                <FlatButton
                    label={PowerLocalize.get("Action.Show")}
                    onTouchTap={() => this.props.navigateTo("/app/view/" + this.props.viewProfileId)}
                />
                <FlatButton
                    label={PowerLocalize.get("Action.Generate.Word")}
                    onTouchTap={() => this.props.generate(this.props.viewProfileId)}
                />
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