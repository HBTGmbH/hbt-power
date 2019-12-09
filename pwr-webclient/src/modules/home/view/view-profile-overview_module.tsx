import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {isNullOrUndefined} from 'util';
import {Button, Dialog, Icon, Paper, Tab, Tabs} from '@material-ui/core';
import {ViewProfileEntriesOverview} from './view-profile-entries-overview_module';
import {ViewProfileProjectsOverview} from './view-profile-projects-overview_module';
import {ProfileGenerator} from './view-profile-generator_module';
import {ViewProfileSkillOverview} from './view-profile-skill-overview_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../model/PwrConstants';
import Grid from '@material-ui/core/Grid';
import ReplayIcon from '@material-ui/icons/Replay';
import {ViewProfileUpdateDialog} from './view-profile-update-dialog_module';
import TextField from '@material-ui/core/TextField';


interface ViewProfileOverviewProps {
    viewProfile: ViewProfile;
    isInProgress: boolean;
}


interface ViewProfileOverviewLocalProps {
    match?: any;
}

interface ViewProfileOverviewLocalState {
    currentDescription: string;
    descriptionDisabled: boolean;
    generatorOpen: boolean;
    updateDialogOpen: boolean;
    tabValue: number;
}

interface ViewProfileOverviewDispatch {
    generate(viewProfileId: string, templateId: string): void;

    setDescription(description: string, viewProfileId: string): void;
}

class ViewProfileOverviewModule extends React.Component<ViewProfileOverviewProps
    & ViewProfileOverviewLocalProps
    & ViewProfileOverviewDispatch, ViewProfileOverviewLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileOverviewLocalProps): ViewProfileOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles().get(localProps.match.params.id),
            isInProgress: state.viewProfileSlice.sortInProgress()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewProfileOverviewDispatch {
        return {
            generate: viewProfileId => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId, '2')),
            setDescription: (description, viewProfileId) => dispatch(ViewProfileActionCreator.AsyncSetDescription(description, viewProfileId))
        };
    }

    constructor(props: ViewProfileOverviewProps & ViewProfileOverviewLocalProps & ViewProfileOverviewDispatch) {
        super(props);
        this.state = {
            currentDescription: !isNullOrUndefined(props.viewProfile) ? props.viewProfile.description : '',
            descriptionDisabled: true,
            generatorOpen: false,
            updateDialogOpen: false,
            tabValue: 0,
        };
    }

    public componentDidUpdate(prevProps: ViewProfileOverviewProps & ViewProfileOverviewLocalProps & ViewProfileOverviewDispatch) {
        if (prevProps.viewProfile !== this.props.viewProfile) {
            this.setState({
                currentDescription: !isNullOrUndefined(this.props.viewProfile) ? this.props.viewProfile.description : ''
            });
        }

    }

    private handleToggleEdit = (enabled: boolean) => {
        this.setState({
            descriptionDisabled: enabled
        });
        if (enabled) {
            this.props.setDescription(this.state.currentDescription, this.props.viewProfile.id);
        }
    };

    private setGeneratorOpen(open: boolean) {
        this.setState({
            generatorOpen: open
        });
    }

    private toggleUpdateDialog() {
        this.setState({
            updateDialogOpen: !this.state.updateDialogOpen
        });
    }

    render() {
        if (isNullOrUndefined(this.props.viewProfile)) {
            return <div>Does not exist</div>;
        } else {
            let viewProfileId = this.props.match.params.id;
            return (<div>
                <Dialog
                    open={this.props.isInProgress}
                    style={{color: 'rgb(255, 255, 255, 0)', opacity: 0}}
                >
                    <span style={{color: 'white', opacity: 1}}>Loading...</span>
                </Dialog>
                <ProfileGenerator
                    open={this.state.generatorOpen}
                    onClose={() => this.setGeneratorOpen(false)}
                    viewProfileId={this.props.viewProfile.id}
                />
                <ViewProfileUpdateDialog
                    open={this.state.updateDialogOpen}
                    onClose={() => this.toggleUpdateDialog()}
                    viewProfileId={this.props.viewProfile.id}
                />

                <Paper className="row padding-8px" style={{margin: '1px'}}>
                    <div className="col-md-6">
                        <LimitedTextField
                            disabled={this.state.descriptionDisabled}
                            onToggleEdit={this.handleToggleEdit}
                            useToggleEditButton={true}
                            maxCharacters={PROFILE_DESCRIPTION_LENGTH}
                            label={PowerLocalize.get('Profile.Description')}
                            value={this.state.currentDescription}
                            fullWidth={true}
                            rows={5}
                            multiLine={true}
                            onChange={(e, v) => {
                                this.setState({currentDescription: v});
                            }}
                        />
                    </div>
                    <div className="col-md-6">
                        <Grid container direction={'column'} spacing={16}>
                            <Grid item>
                                <Button
                                    variant={'contained'}
                                    className="mui-margin float-right"
                                    color={'primary'}
                                    onClick={() => this.setGeneratorOpen(true)}
                                >
                                    <Icon className="material-icons">open_in_new</Icon>
                                    {PowerLocalize.get('Action.Generate.Word')}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant={'contained'}
                                    className="mui-margin float-right"
                                    color={'primary'}
                                    onClick={() => this.toggleUpdateDialog()}
                                >
                                    <ReplayIcon/>
                                    Aktualisieren
                                </Button>
                            </Grid>
                        </Grid>
                    </div>
                </Paper>

                <Tabs
                    value={this.state.tabValue}
                    onChange={(e: any, v: number) => this.setState({tabValue: v})}
                    centered

                >
                    <Tab value={0} label={PowerLocalize.get('ViewProfileOveview.Entries')}/>
                    <Tab value={1} label={PowerLocalize.get('ViewProfileOveview.Projects')}/>
                    <Tab value={2} label={PowerLocalize.get('ViewProfileOveview.Skills')}/>
                </Tabs>
                <div>
                    {this.state.tabValue === 0 &&
                    <ViewProfileEntriesOverview
                        viewProfileId={viewProfileId}
                    />
                    }
                    {this.state.tabValue === 1 &&
                    <ViewProfileProjectsOverview
                        viewProfileId={viewProfileId}
                    />
                    }
                    {this.state.tabValue === 2 &&
                    <ViewProfileSkillOverview
                        viewProfileId={viewProfileId}
                    />
                    }
                </div>
            </div>);
        }
    }
}

/**
 * @see ViewProfileOverviewModule
 * @author nt
 * @since 11.09.2017
 */
export const ViewProfileOverview: React.ComponentClass<ViewProfileOverviewLocalProps> = connect(ViewProfileOverviewModule.mapStateToProps, ViewProfileOverviewModule.mapDispatchToProps)(ViewProfileOverviewModule);