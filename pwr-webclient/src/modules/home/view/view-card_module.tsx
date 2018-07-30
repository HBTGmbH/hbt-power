import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {Card, CardActions, CardHeader, Icon, Button} from '@material-ui/core';
import {formatFullLocalizedDate} from '../../../utils/DateUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileDialog} from './view-profile-dialog_module';
import {ProfileGenerator} from './view-profile-generator_module';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../../Paths';
import {orange} from '@material-ui/core/colors';

interface ViewCardProps {
    viewProfile: ViewProfile;
}

interface ViewCardLocalProps {
    viewProfileId: string;
}

interface ViewCardLocalState {
    dialogOpen: boolean;
    generatorOpen: boolean;
}

interface ViewCardDispatch {
    deleteViewProfile(id: string): void;
    navigateTo(target: string): void;
    //generate(viewProfileId: string, templateId: string): void;
    updateViewProfile(viewProfileId: string, name: string, description: string, charsPerLine: number): void;
}

class ViewCardModule extends React.Component<
    ViewCardProps
    & ViewCardLocalProps
    & ViewCardDispatch, ViewCardLocalState> {

    constructor(props: ViewCardLocalProps & ViewCardProps & ViewCardDispatch) {
        super(props);
        this.state = {
            dialogOpen: false,
            generatorOpen : false,

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
            //generate: (viewProfileId, templateId) => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId, templateId)),
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
    private setGeneratorOpen(open : boolean){
        this.setState({
            generatorOpen: open
        })
    }

    private handleUpdate = (name: string, description: string, charsPerLine: number) => {
        this.props.updateViewProfile(this.props.viewProfileId, name, description, charsPerLine);
        this.setDialogOpen(false);
        this.setGeneratorOpen(false);
    };


    render() {
        return (
        <Card className="fullWidth">
            <ViewProfileDialog
                viewProfile={this.props.viewProfile}
                onClose={() => this.setDialogOpen(false)}
                onSave={this.handleUpdate}
                open={this.state.dialogOpen}
            />

            <ProfileGenerator
                open={this.state.generatorOpen}
                onClose={() => this.setGeneratorOpen(false)}
                viewProfileId={this.props.viewProfile.id}
            />
            <CardHeader
                title={this.props.viewProfile.viewProfileInfo.name}
                subheader={PowerLocalize.get("ViewProfileCard.Subtitle") + formatFullLocalizedDate(this.props.viewProfile.viewProfileInfo.creationDate)}
            />
            <h6 className="padding-left-16px">{this.props.viewProfile.viewProfileInfo.viewDescription}</h6>
            <CardActions>
                <div>
                    <Button
                        style={{marginLeft:'8px',marginTop:'5px'}}
                        variant={'raised'}
                        className="mui-margin"
                        onClick={() => this.setDialogOpen(true)}
                    >
                        <Icon className="material-icons">info</Icon>
                        {PowerLocalize.get("ViewProfileCard.Action.EditInfo")}
                    </Button>
                    <Button
                        style={{marginLeft:'8px', marginTop:'5px'}}
                        variant={'raised'}
                        className="mui-margin"
                        onClick={() => this.props.navigateTo(Paths.USER_VIEW_PROFILE.replace(":id", this.props.viewProfileId))}
                    >
                        <Icon className="material-icons">edit</Icon>
                        {PowerLocalize.get("ViewProfileCard.Action.Edit")}
                    </Button>
                    <Button
                        style={{marginLeft:'8px', marginTop:'5px'}}
                        variant={'raised'}
                        className="mui-margin"
                        color={'secondary'}

                        onClick={() => this.props.deleteViewProfile(this.props.viewProfileId)}
                    >
                        <Icon className="material-icons">delete</Icon>
                        {PowerLocalize.get("Action.Delete")}
                    </Button>
                    <Button
                        style={{marginLeft:'8px', marginTop:'5px'}}
                        variant={'raised'}
                        className="mui-margin"
                        color={'primary'}
                        onClick={() => this.setGeneratorOpen(true)}
                    >
                        <Icon className="material-icons">open_in_new</Icon>
                        {PowerLocalize.get("Action.Generate.Word")}
                    </Button>
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

