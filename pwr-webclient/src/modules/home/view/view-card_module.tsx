import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {Card, CardActions, CardHeader, Icon} from '@material-ui/core';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {PwrButton} from '../../general/pwr-button';
import {formatFullLocalizedDate} from '../../../utils/DateUtil';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileDialog} from './view-profile-dialog_module';
import {ProfileGenerator} from './view-profile-generator_module';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {Paths} from '../../../Paths';
import {ThunkDispatch} from 'redux-thunk';
import {withRouter} from 'react-router-dom';

interface ViewCardProps {
    viewProfile: ViewProfile;
}

interface ViewCardLocalProps {
    viewProfileId: string;
    match?: any; // From react-router connection
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

class ViewCardModule extends React.Component<ViewCardProps
    & ViewCardLocalProps
    & ViewCardDispatch, ViewCardLocalState> {

    constructor(props: ViewCardLocalProps & ViewCardProps & ViewCardDispatch) {
        super(props);
        this.state = {
            dialogOpen: false,
            generatorOpen: false,

        };
    }

    static mapStateToProps(state: ApplicationState, localProps: ViewCardLocalProps): ViewCardProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles.get(localProps.viewProfileId)
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ViewCardDispatch {
        return {
            deleteViewProfile: (id) => dispatch(ViewProfileActionCreator.AsyncDeleteViewProfile(id)),
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            //generate: (viewProfileId, templateId) => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId, templateId)),
            updateViewProfile: (viewProfileId, name, description, charsPerLine) => {
                dispatch(ViewProfileActionCreator.AsyncUpdateViewProfile(viewProfileId, description, name, charsPerLine));
            }
        };
    }

    private setDialogOpen(open: boolean) {
        this.setState({
            dialogOpen: open
        });
    }

    private setGeneratorOpen(open: boolean) {
        this.setState({
            generatorOpen: open
        });
    }

    private handleUpdate = (name: string, description: string, charsPerLine: number) => {
        this.props.updateViewProfile(this.props.viewProfileId, name, description, charsPerLine);
        this.setDialogOpen(false);
        this.setGeneratorOpen(false);
    };


    render() {
        const initials = this.props.match.params.initials;
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
                    subheader={PowerLocalize.get('ViewProfileCard.Subtitle') + formatFullLocalizedDate(this.props.viewProfile.viewProfileInfo.creationDate)}
                />
                <h6 className="padding-left-16px">{this.props.viewProfile.viewProfileInfo.viewDescription}</h6>
                {/* The button bar of the forms (#41): Generate highlighted (the export document is the goal of a view
                    profile), Edit and Edit info as text buttons, Delete set apart on the right with its question */}
                <CardActions>
                    <PwrFormActions editing={false} noSpace
                                    editText={PowerLocalize.get('Action.Generate.Word')} editIcon={'open_in_new'}
                                    onEdit={() => this.setGeneratorOpen(true)}
                                    onDelete={() => this.props.deleteViewProfile(this.props.viewProfileId)}>
                        <PwrButton color={'primary'} text={PowerLocalize.get('Action.Edit')}
                                   icon={<Icon className="material-icons">edit</Icon>}
                                   onClick={() => this.props.navigateTo(Paths.build(Paths.USER_VIEW_PROFILE, {id: this.props.viewProfileId, initials}))}/>
                        <PwrButton color={'primary'} text={PowerLocalize.get('ViewProfileCard.Action.EditInfo')}
                                   icon={<Icon className="material-icons">info</Icon>}
                                   onClick={() => this.setDialogOpen(true)}/>
                    </PwrFormActions>
                </CardActions>
            </Card>);
    }
}
const WithRouterComponent = withRouter((props: any) => <ViewCardModule {...props}/>);

/**
 * @see ViewCardModule
 * @author nt
 * @since 11.09.2017
 */
export const ViewCard: React.ComponentClass<ViewCardLocalProps> = connect(ViewCardModule.mapStateToProps, ViewCardModule.mapDispatchToProps)(WithRouterComponent) as any;
