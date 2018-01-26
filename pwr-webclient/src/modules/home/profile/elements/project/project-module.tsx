import * as React from 'react';
import {Card, CardActions, CardHeader, CardText, IconButton, Paper} from 'material-ui';
import {Project} from '../../../../../model/Project';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {ProjectDialog, ProjectDialogState} from './project-dialog_module';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {Profile} from '../../../../../model/Profile';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';

interface ProjectModuleProps {
    project: Project;
    projectRoles: Immutable.Map<string, NameEntity>;
    companies: Immutable.Map<string, NameEntity>;
    profile: Profile;
    onSave(state: ProjectDialogState): void;
    onDelete(id: string): void;
    backgroundColor?: string;
}

interface ProjectModuleState {
    dialogIsOpen: boolean;
}

export class ProjectCard extends React.Component<ProjectModuleProps, ProjectModuleState> {

    public constructor(props: ProjectModuleProps) {
        super(props);
        this.state = {
            dialogIsOpen: props.project.isNew()
        };
    }

    private closeDialog = () => {
        this.setState({
            dialogIsOpen: false
        });
    };

    private openDialog = () => {
        this.setState({
            dialogIsOpen: true
        });
    };

    private handleSaveRequest = (state: ProjectDialogState) => {
        this.props.onSave(state);
        this.closeDialog();
    };

    private deleteButtonPress = () => {
        this.props.onDelete(this.props.project.id());
    };

    private getEndCustomerName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.project.endCustomerId(), this.props.companies);
    };
    private getBrokerName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.project.brokerId(), this.props.companies);
    };

    private getRoleNameList = () => {
        let res: string = '';
        let prefix = '';
        this.props.project.roleIds().forEach( id => {
            res += prefix;
            res += NameEntityUtil.getNullTolerantName(id, this.props.projectRoles);
            prefix = ', ';
        });
        return res;
    };

    private renderTitle = () => {
        return "Tätig als " + this.getRoleNameList() + " von " + formatToShortDisplay(this.props.project.startDate())
            + " bis " + formatToShortDisplay(this.props.project.endDate());
    };

    render () {
        return (
            <Paper zDepth={1} style={{backgroundColor: this.props.backgroundColor, width: "100%", height: "100% "}}>
                <Card style={{backgroundColor: this.props.backgroundColor, width: "100%", height: "100% "}} initiallyExpanded={true}>
                    <CardHeader
                        title={this.props.project.name() + ' für ' + this.getEndCustomerName()}
                        subtitle={this.renderTitle()}
                        actAsExpander={true}
                    />
                    <ProjectDialog key={'projectDialog.' + this.props.project.id()}
                        open={this.state.dialogIsOpen}
                        project={this.props.project}
                        onClose={this.closeDialog}
                        onSave={this.handleSaveRequest}
                        companies={this.props.companies}
                        projectRoles={this.props.projectRoles}
                       profile={this.props.profile}
                    />
                    <CardText expandable={true} >
                        <label>Kurzbeschreibung</label><br/>
                        {this.props.project.description()}
                    </CardText>
                    <CardActions expandable={true}>
                        <IconButton iconClassName="material-icons icon-size-20" onClick={this.openDialog}
                                    tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                        <IconButton iconClassName="material-icons icon-size-20" onClick={this.deleteButtonPress}
                                    tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                    </CardActions>
                </Card>
            </Paper>
        );
    }
}