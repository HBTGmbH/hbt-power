import * as React from 'react';
import {Card, CardActions, CardHeader, CardText, IconButton, Paper} from 'material-ui';
import {Project} from '../../../../../model/Project';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {ProjectDialog, ProjectDialogState} from './project-dialog_module';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {Profile} from '../../../../../model/Profile';

interface ProjectModuleProps {
    project: Project;
    projectRoles: Immutable.Map<string, NameEntity>;
    companies: Immutable.Map<string, NameEntity>;
    profile: Profile;
    onSave(state: ProjectDialogState): void;
    onDelete(id: string): void;
}

interface ProjectModuleState {
    dialogIsOpen: boolean;
}

export class ProjectCard extends React.Component<ProjectModuleProps, ProjectModuleState> {

    public constructor(props: ProjectModuleProps) {
        super(props);
        this.state = {
            dialogIsOpen: false
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

    render () {
        return (
            <Paper zDepth={4}>
                <Card>
                    <CardHeader
                        title={this.props.project.name() + ' für ' + this.getEndCustomerName()}
                        subtitle={'Tätig als ' + this.getRoleNameList()}
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
                    <CardText>
                        <label>Kurzbeschreibung</label><br/>
                        {this.props.project.description()}
                    </CardText>
                    <CardActions>
                        <IconButton size={20} iconClassName="material-icons" onClick={this.openDialog}
                                    tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                        <IconButton size={20} iconClassName="material-icons" onClick={this.deleteButtonPress}
                                    tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                    </CardActions>
                    <br/>
                    <br/>
                </Card>
            </Paper>
        );
    }
}