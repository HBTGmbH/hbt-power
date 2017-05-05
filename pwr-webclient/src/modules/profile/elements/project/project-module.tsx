import * as React from 'react';
import {Card, CardHeader, CardMedia, DatePicker, Paper, TextField} from 'material-ui';
import {Project} from '../../../../model/Project';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';

interface ProjectModuleProps {
    project: Project;
}

interface ProjectModuleState {

}

export class ProjectCard extends React.Component<ProjectModuleProps, ProjectModuleState> {

    render () {
        return (
            <Card>
                <CardHeader
                    title={this.props.project.name() + " für " + this.props.project.endCustomer()}
                    subtitle={"Tätig als " + this.props.project.role()}
                    actAsExpander={true}
                />
                <CardMedia expandable={true}>
                    <div className="row">
                        <div className="col-md-3 col-sm-6 col-md-offset-1">
                            <TextField
                                floatingLabelText={PowerLocalize.get("ProjectName.Singular")}
                                value={this.props.project.name()}
                                id={"Project.Name." + this.props.project.id}
                            />
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <TextField
                                floatingLabelText={PowerLocalize.get("Customer.Singular")}
                                value={this.props.project.endCustomer()}
                                id={"Project.Customer." + this.props.project.id}
                            />
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <TextField
                                floatingLabelText={PowerLocalize.get("Broker.Singular")}
                                value={this.props.project.broker()}
                                id={"Project.Broker." + this.props.project.id}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-3 col-sm-6 col-md-offset-1">
                            <DatePicker floatingLabelText={PowerLocalize.get("Project.StartDate")}
                                        value={this.props.project.startDate()}
                            />
                        </div>
                        <div className="col-md-3 col-sm-6 ">
                            <DatePicker floatingLabelText={PowerLocalize.get("Project.EndDate")}
                                        value={this.props.project.endDate()}
                            />
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <TextField
                                floatingLabelText={PowerLocalize.get("ProjectRole.Singular")}
                                value={this.props.project.role()}
                                id={"Project.Role." + this.props.project.id}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-offset-1 col-md-8">
                            <TextField
                                floatingLabelText={PowerLocalize.get("Project.Card.Description")}
                                fullWidth = {true}
                                multiLine={true}
                                rows={8}
                                value={this.props.project.description()}
                                id={"Project.Description." + this.props.project.id}
                            />
                        </div>
                    </div>
                </CardMedia>
            </Card>
        )
    }
}