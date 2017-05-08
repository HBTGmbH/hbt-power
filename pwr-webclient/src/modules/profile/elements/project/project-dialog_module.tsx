import * as React from 'react';
import {Card, CardActions, CardHeader, CardMedia, DatePicker, Dialog, IconButton, TextField} from 'material-ui';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {Project} from '../../../../model/Project';

interface ProjectDialogProps {
    open: boolean;
    project: Project;
    onClose(): void;
    onSave(project: Project): void;
}

interface ProjectDialogState {
    project: Project;
}

export class ProjectDialog extends React.Component<ProjectDialogProps, ProjectDialogState> {


    public constructor(props: ProjectDialogProps) {
        super(props);
        this.state = {
            project: props.project
        };
    }

    private updateProject(project: Project) {
        this.setState({
            project: project
        });
    }

    private componentWillReceiveProps(props: ProjectDialogProps) {
        if(this.props.open == false && props.open == true) {
            this.setState({project: props.project});
        }
    }

    private changeStartDate = (n: undefined, date: Date) => {
        this.updateProject(this.state.project.startDate(date));
    };

    private changeEndDate = (n: undefined, date: Date) => {
        this.updateProject(this.state.project.endDate(date));
    };

    private changeName = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.name(newValue));
    };

    private changeEndCustomer = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.endCustomer(newValue));
    };

    private changeBroker = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.broker(newValue));
    };

    private changeRole = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.role(newValue));
    };

    private changeDescription = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.description(newValue));
    };

    private handleSaveButtonPress = () => {
        this.props.onSave(this.state.project);
    };

    private handleCloseButtonPress = () => {
        // Revert state to original.
        this.props.onClose();
    };

    public render () {
        return (
            <Dialog
                open={this.props.open}
                modal={false}
                onRequestClose={this.props.onClose}
            >
                <Card>
                    <CardHeader
                        title={PowerLocalize.get('ProjectDialog.Title')}
                    />
                    <CardMedia>
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                <TextField
                                    floatingLabelText={PowerLocalize.get('ProjectName.Singular')}
                                    value={this.state.project.name()}
                                    id={'Project.Name.' + this.state.project.id}
                                    onChange={this.changeName}
                                    fullWidth={true}
                                />
                            </div>
                            <div className="col-md-5 col-sm-6">
                                <TextField
                                    floatingLabelText={PowerLocalize.get('Customer.Singular')}
                                    value={this.state.project.endCustomer()}
                                    id={'Project.Customer.' + this.state.project.id()}
                                    onChange={this.changeEndCustomer}
                                    fullWidth={true}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                <DatePicker floatingLabelText={PowerLocalize.get('Project.StartDate')}
                                            value={this.state.project.startDate()}
                                            onChange={this.changeStartDate}
                                            fullWidth={true}
                                />
                            </div>
                            <div className="col-md-5 col-sm-6 ">
                                <DatePicker floatingLabelText={PowerLocalize.get('Project.EndDate')}
                                            value={this.state.project.endDate()}
                                            onChange={this.changeEndDate}
                                            fullWidth={true}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                <TextField
                                    floatingLabelText={PowerLocalize.get('Broker.Singular')}
                                    value={this.state.project.broker()}
                                    id={'Project.Broker.' + this.state.project.id()}
                                    onChange={this.changeBroker}
                                    fullWidth={true}
                                />
                            </div>

                            <div className="col-md-5 col-sm-6 ">
                                <TextField
                                    floatingLabelText={PowerLocalize.get('ProjectRole.Singular')}
                                    value={this.state.project.role()}
                                    id={'Project.Role.' + this.state.project.id()}
                                    onChange={this.changeRole}
                                    fullWidth={true}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-8">
                                <TextField
                                    floatingLabelText={PowerLocalize.get('ProjectDialog.Description.LabelText')}
                                    fullWidth = {true}
                                    multiLine={true}
                                    rows={8}
                                    value={this.state.project.description()}
                                    id={'Project.Description.' + this.state.project.id()}
                                    onChange={this.changeDescription}
                                />
                            </div>
                        </div>
                    </CardMedia>
                    <CardActions>
                        <IconButton size={20} iconClassName="material-icons" onClick={this.handleSaveButtonPress} tooltip={PowerLocalize.get('Action.Save')}>save</IconButton>
                        <IconButton size={20} iconClassName="material-icons" onClick={this.handleCloseButtonPress} tooltip={PowerLocalize.get('Action.Exit')}>close</IconButton>
                    </CardActions>
                </Card>
            </Dialog>
        );
    }
}