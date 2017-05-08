import * as React from 'react';
import {Card, CardActions, CardHeader, IconButton} from 'material-ui';
import {Project} from '../../../../model/Project';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProjectDialog} from './project-dialog_module';

interface ProjectModuleProps {
    project: Project;
    onSave(project: Project): void;
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
        }
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

    private handleSaveRequest = (project: Project) => {
        this.props.onSave(project);
        this.closeDialog();
    };

    private deleteButtonPress = () => {
        this.props.onDelete(this.props.project.id());
    };

    render () {
        return (
            <Card>
                <CardHeader
                    title={this.props.project.name() + ' für ' + this.props.project.endCustomer()}
                    subtitle={'Tätig als ' + this.props.project.role()}
                />
                <ProjectDialog key={"projectDialog." + this.props.project.id()}
                    open={this.state.dialogIsOpen}
                    project={this.props.project}
                    onClose={this.closeDialog}
                    onSave={this.handleSaveRequest}
                />
                <CardActions>
                    <IconButton size={20} iconClassName="material-icons" onClick={this.openDialog}
                                tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                    <IconButton size={20} iconClassName="material-icons" onClick={this.deleteButtonPress}
                                tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                </CardActions>
            </Card>
        )
    }
}