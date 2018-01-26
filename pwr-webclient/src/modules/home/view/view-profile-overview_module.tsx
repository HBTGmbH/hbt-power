import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {isNullOrUndefined} from 'util';
import {Dialog, FontIcon, Paper, RaisedButton, Tab, Tabs} from 'material-ui';
import {ViewProfileEntriesOverview} from './view-profile-entries-overview_module';
import {ViewProfileProjectsOverview} from './view-profile-projects-overview_module';
import {ViewProfileSkillOverview} from './view-profile-skill-overview_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {LimitedTextField} from '../../general/limited-text-field-module';

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
}

interface ViewProfileOverviewDispatch {
    generate(viewProfileId: string): void;
    setDescription(description: string, viewProfileId: string): void;
}

class ViewProfileOverviewModule extends React.Component<
    ViewProfileOverviewProps
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
            generate: viewProfileId => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId)),
            setDescription: (description, viewProfileId) => dispatch(ViewProfileActionCreator.AsyncSetDescription(description, viewProfileId))
        };
    }

    constructor(props: ViewProfileOverviewProps & ViewProfileOverviewLocalProps & ViewProfileOverviewDispatch) {
        super(props);
        this.state = {
            currentDescription: !isNullOrUndefined(props.viewProfile) ? props.viewProfile.description : "",
            descriptionDisabled: true
        }
    }

    public componentDidUpdate(prevProps: ViewProfileOverviewProps & ViewProfileOverviewLocalProps & ViewProfileOverviewDispatch) {
        if(prevProps.viewProfile !== this.props.viewProfile) {
            this.setState({
                currentDescription: !isNullOrUndefined(this.props.viewProfile) ? this.props.viewProfile.description : ""
            })
        }

    }

    private handleToggleEdit = (enabled: boolean) => {
        this.setState({
            descriptionDisabled: enabled
        });
        if(enabled) {
            this.props.setDescription(this.state.currentDescription, this.props.viewProfile.id);
        }
    };

    render() {
        if (isNullOrUndefined(this.props.viewProfile)) {
            return <div>Does not exist</div>;
        } else {
            let viewProfileId = this.props.match.params.id;
            return (<div>
                <Dialog
                    open={this.props.isInProgress}
                    contentStyle={{color: 'rgb(255, 255, 255, 0)', opacity: 0}}
                    overlayStyle={{backgroundColor: 'rgba(0, 0, 0, 0.4)'}}
                    modal={true}
                >
                    <span style={{color: 'white', opacity: 1}}>Loading...</span>
                </Dialog>

                <Paper className="row padding-8px" style={{margin: "1px"}}>
                    <div className="col-md-6">
                        <LimitedTextField
                            disabled={this.state.descriptionDisabled}
                            onToggleEdit={this.handleToggleEdit}
                            useToggleEditButton={true}
                            maxCharacters={500}
                            floatingLabelText={PowerLocalize.get("Profile.Description")}
                            value={this.state.currentDescription}
                            fullWidth={true}
                            rows={5}
                            multiLine={true}
                            onChange={(e, v) => {this.setState({currentDescription: v})}}
                        />
                    </div>
                    <div className="col-md-6">
                        <RaisedButton
                            className="mui-margin float-right"
                            primary={true}
                            label={PowerLocalize.get("Action.Generate.Word")}
                            onClick={() => this.props.generate(this.props.viewProfile.id)}
                            icon={<FontIcon className="material-icons">open_in_new</FontIcon>}
                        />
                    </div>

                </Paper>

                <Tabs>
                    <Tab label={PowerLocalize.get("ViewProfileOveview.Entries")}>
                        <ViewProfileEntriesOverview
                            viewProfileId={viewProfileId}
                        />
                    </Tab>
                    <Tab label={PowerLocalize.get("ViewProfileOveview.Projects")}>
                        <ViewProfileProjectsOverview
                            viewProfileId={viewProfileId}
                        />
                    </Tab>
                    <Tab label={PowerLocalize.get("ViewProfileOveview.Skills")}>
                        <ViewProfileSkillOverview
                            viewProfileId={viewProfileId}
                        />
                    </Tab>
                </Tabs>
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