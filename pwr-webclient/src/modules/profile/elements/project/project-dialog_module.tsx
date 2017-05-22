import * as React from 'react';
import {
    AutoComplete,
    Card,
    CardActions,
    CardHeader,
    CardMedia,
    Chip,
    DatePicker,
    Dialog, Divider,
    IconButton,
    TextField, Subheader
} from 'material-ui';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {Project} from '../../../../model/Project';
import {NameEntity} from '../../../../model/NameEntity';
import * as Immutable from 'immutable';
// Documentation: https://github.com/TeamWertarbyte/material-ui-chip-input
import ChipInput from './../../../../external_libs/ChipInput';
import {InternalDatabase} from '../../../../model/InternalDatabase';
import {isNullOrUndefined} from 'util';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import {SkillSearcher} from '../../../general/skill-search_module';
import {Skill} from '../../../../model/Skill';
import {Profile} from '../../../../model/Profile';
import {LEVENSHTEIN_FILTER_LEVEL} from '../../../../model/PwrConstants';

interface ProjectDialogProps {
    open: boolean;
    project: Project;
    projectRoles: Immutable.Map<string, NameEntity>;
    companies: Immutable.Map<string, NameEntity>;
    profile: Profile;
    onClose(): void;
    onSave(state: ProjectDialogState): void;
}

export interface ProjectDialogState {
    project: Project;
    roles: Immutable.List<string>;
    rawSkills: Immutable.Set<string>;
    clientACValue: string; // Autocomplete value of the client field
    brokerACValue: string; // Autocomplete value of the broker field
}

export class ProjectDialog extends React.Component<ProjectDialogProps, ProjectDialogState> {


    public constructor(props: ProjectDialogProps) {
        super(props);
        this.forceReset(props);
    }

    private updateProject(project: Project) {
        this.setState({
            project: project
        });
    }

    private forceReset(props: ProjectDialogProps) {
        let roles: Array<string> = [];
        props.project.roleIds().forEach(id => {
            roles.push(NameEntityUtil.getNullTolerantName(id, props.projectRoles));
        });
        let rawSkills = Immutable.Set<string>();
        props.project.skillIDs().forEach(id => {
            rawSkills = rawSkills.add(this.props.profile.getSkillName(id));
        });
        this.state = {
            project: props.project,
            roles: Immutable.List<string>(roles),
            clientACValue: NameEntityUtil.getNullTolerantName(props.project.endCustomerId(), props.companies),
            brokerACValue: NameEntityUtil.getNullTolerantName(props.project.brokerId(), props.companies),
            rawSkills: rawSkills
        };
    }

    private componentWillReceiveProps(props: ProjectDialogProps) {
        if(this.props.open == false && props.open == true) {
            this.forceReset(props);
        }
    }

    private renderSkills = () => {
        return this.state.rawSkills.map(skill => {
           return (<Chip key={'SkillChip_' + skill} style={{margin: 4}}>{skill}</Chip>);
        });
    };

    private changeStartDate = (n: undefined, date: Date) => {
        this.updateProject(this.state.project.startDate(date));
    };

    private changeEndDate = (n: undefined, date: Date) => {
        this.updateProject(this.state.project.endDate(date));
    };

    private changeName = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.name(newValue));
    };

    private changeDescription = (event: Object, newValue: string) => {
        this.updateProject(this.state.project.description(newValue));
    };

    private handleSaveButtonPress = () => {
        this.props.onSave(this.state);
    };

    private handleCloseButtonPress = () => {
        // Revert state to original.
        this.props.onClose();
    };

    private handleAddRole = (value: string) => {
        if(this.state.roles.size < 3){ // TODO remove hardcoding
            this.setState({
                roles: this.state.roles.push(value)
            });
        }
    };

    private handleRemoveRole = (value: string) => {
        this.setState({
            roles: Immutable.List<string>(this.state.roles.filter(val => val != value))
        });
    };

    private handleEndCustomerRequest = (chosenRequest: string, index: number) => {
        this.setState({
            clientACValue: chosenRequest
        });
    };

    private handleEndCustomerInput = (text: string) => {
        this.setState({
            clientACValue: text
        });
    };

    private handleBrokerRequest = (chosenRequest: string, index: number) => {
        this.setState({
            brokerACValue: chosenRequest
        });
    };

    private handleBrokerInput = (text: string) => {
        this.setState({
            brokerACValue: text
        });
    };

    private handleSkillRequest = (qualifier: string) => {
        this.setState({
            rawSkills: this.state.rawSkills.add(qualifier)
        });

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

                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-5 col-md-offset-1">
                                <DatePicker floatingLabelText={PowerLocalize.get('Project.StartDate')}
                                            value={this.state.project.startDate()}
                                            onChange={this.changeStartDate}
                                            fullWidth={true}
                                            formatDate={formatToShortDisplay}
                                />
                            </div>
                            <div className="col-md-5 col-sm-5 ">
                                <DatePicker floatingLabelText={PowerLocalize.get('Project.EndDate')}
                                            value={this.state.project.endDate()}
                                            onChange={this.changeEndDate}
                                            fullWidth={true}
                                            formatDate={formatToShortDisplay}
                                />
                            </div>

                        </div>
                        <div className="row">
                            <div className="col-md-5 col-sm-6 col-md-offset-1">
                                <div className="col-md-5 col-sm-6">
                                    <AutoComplete
                                        id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                        floatingLabelText={PowerLocalize.get('Broker.Singular')}
                                        value={this.state.brokerACValue}
                                        dataSource={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                        onUpdateInput={this.handleBrokerInput}
                                        onNewRequest={this.handleBrokerRequest}
                                        filter={AutoComplete.levenshteinDistanceFilter(LEVENSHTEIN_FILTER_LEVEL)}

                                    />
                                </div>
                            </div>
                            <div className="col-md-5 col-sm-6">
                                <AutoComplete
                                    floatingLabelText={PowerLocalize.get('Customer.Singular')}
                                    id={'ProjectDialog.EndCustomer.' + this.props.project.id}
                                    value={this.state.clientACValue}
                                    dataSourceConfig={{text:'name', value:'id'}}
                                    dataSource={this.props.companies.map(NameEntityUtil.mapToName).toArray()}
                                    onUpdateInput={this.handleEndCustomerInput}
                                    onNewRequest={this.handleEndCustomerRequest}
                                    filter={AutoComplete.fuzzyFilter}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-10">
                                <ChipInput
                                    floatingLabelText={PowerLocalize.get('Project.Dialog.Roles.Title')}
                                    value={this.state.roles.toArray()}
                                    dataSource={this.props.projectRoles.toArray().map(NameEntityUtil.mapToName)}
                                    style={{'width': '100%'}}
                                    onRequestAdd={this.handleAddRole}
                                    onRequestDelete={this.handleRemoveRole}
                                    filter={AutoComplete.fuzzyFilter}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-10">
                                <TextField
                                    floatingLabelText={PowerLocalize.get('ProjectDialog.Description.LabelText')}
                                    fullWidth = {true}
                                    multiLine={true}
                                    rows={4}
                                    value={this.state.project.description()}
                                    id={'Project.Description.' + this.state.project.id()}
                                    onChange={this.changeDescription}
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-10  col-md-offset-1">
                                <SkillSearcher
                                    floatingLabelText={PowerLocalize.get('ProjectSkills.Label')}
                                    id={'ProjectDialog.SkillSearcher.' + this.props.project.id()}
                                    onNewRequest={this.handleSkillRequest}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-offset-1 col-md-10">
                                <div style={{display: 'flex', flexWrap: 'wrap'}}>
                                    {
                                        this.renderSkills()
                                    }
                                </div>
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