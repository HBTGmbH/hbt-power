import * as React from 'react';
import {CardActions, IconButton} from '@material-ui/core';
import {Project} from '../../../../../model/Project';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {ProjectDialog, ProjectDialogState} from './project-dialog_module';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {Profile} from '../../../../../model/Profile';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography/Typography';

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
        return <ExpansionPanel
            defaultExpanded
            style={{
                backgroundColor: this.props.backgroundColor,
                width: '100%',
                height: '100%'
            }} //initiallyExpanded={true}
        >
            <ExpansionPanelSummary
                title={this.props.project.name() + ' für ' + this.getEndCustomerName()}
            >
                <div>
                    <Typography variant={'headline'}>{this.props.project.name() + ' für ' + this.getEndCustomerName()}</Typography>
                    <Typography variant={'caption'}>{this.renderTitle()}</Typography>
                </div>
            </ExpansionPanelSummary>
            <ProjectDialog key={'projectDialog.' + this.props.project.id()}
                           open={this.state.dialogIsOpen}
                           project={this.props.project}
                           onClose={this.closeDialog}
                           onSave={this.handleSaveRequest}
                           companies={this.props.companies}
                           projectRoles={this.props.projectRoles}
                           profile={this.props.profile}
            />
            <ExpansionPanelDetails>
                <label>Kurzbeschreibung</label><br/>
                {this.props.project.description()}
            </ExpansionPanelDetails>
            <CardActions >
                <Tooltip title={PowerLocalize.get('Action.Edit')} // FIXME BUG https://github.com/gregnb/mui-datatables/issues/100
                    >
                    <IconButton className="material-icons icon-size-20" onClick={this.openDialog}>edit</IconButton>
                </Tooltip>

                <Tooltip title={PowerLocalize.get('Action.Delete')}>
                    <IconButton className="material-icons icon-size-20" onClick={this.deleteButtonPress}>delete</IconButton>
                </Tooltip>
            </CardActions>
        </ExpansionPanel>;
    }
}