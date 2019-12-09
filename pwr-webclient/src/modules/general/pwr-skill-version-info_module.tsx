import TextField from '@material-ui/core/TextField';
import {PwrIconButton} from './pwr-icon-button';
import Popover from '@material-ui/core/Popover';
import * as React from 'react';
import {ApplicationState} from '../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {Grid} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/icons/Add';
import {SkillVersionActionCreator} from '../../reducers/profile-skill/SkillVersionActionCreator';
import {KeyboardEvent} from 'react';
import {PowerLocalize} from '../../localization/PowerLocalizer';

interface PwrSkillVersionInfoProps {
    initials: string;
    serviceSkillId: number;
    allVersions: string[];
}

interface PwrSkillVersionInfoLocalProps {
    skillName: string;

    profileVersions?: string[];

    handleVersionToggle?(version: string): void;
}

interface PwrSkillVersionInfoDispatch {
    addNewVersion(skillId: number, newVersion: string): void;

    loadVersions(skillName: string): void;

    deleteVersion(skillId: number, versionToDelete: string): void;
}

interface PwrSkillVersionInfoState {
    anchorEl: any;
    newVersionText: string;
}

class PwrSkillVersionInfoModule extends React.Component<PwrSkillVersionInfoProps & PwrSkillVersionInfoLocalProps & PwrSkillVersionInfoDispatch, PwrSkillVersionInfoState> {

    constructor(props: PwrSkillVersionInfoProps & PwrSkillVersionInfoLocalProps & PwrSkillVersionInfoDispatch) {
        super(props);
        this.state = {
            newVersionText: '',
            anchorEl: null,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: PwrSkillVersionInfoLocalProps): PwrSkillVersionInfoProps {
        const initials = state.profileStore.consultant != null ? state.profileStore.consultant.initials : 'error';
        const versions = state.skillVersionStore.currentVersions ? state.skillVersionStore.currentVersions : [];
        const skillId = state.skillVersionStore.serviceSkillId;
        return {
            initials: initials,
            allVersions: versions,
            serviceSkillId: skillId,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PwrSkillVersionInfoDispatch {
        return {
            addNewVersion: (skillId: number, newVersion: string) => dispatch(SkillVersionActionCreator.AsyncAddSkillVersion(skillId, newVersion)),
            loadVersions: (skillName: string) => dispatch(SkillVersionActionCreator.AsyncGetSkillVersions(skillName)),
            deleteVersion: (skillId: number, versionToDelete: string) => dispatch(SkillVersionActionCreator.AsyncDeleteSkillVersion(skillId, versionToDelete))
        };
    }

    componentDidMount(): void {
        this.loadSkillData();
    }

    componentDidUpdate(prevProps: Readonly<PwrSkillVersionInfoProps & PwrSkillVersionInfoLocalProps & PwrSkillVersionInfoDispatch>,
                       prevState: Readonly<PwrSkillVersionInfoState>, snapshot?: any): void {
        if (this.props.skillName != prevProps.skillName || this.props.profileVersions != prevProps.profileVersions) {
            this.loadSkillData();
        }
    }

    private loadSkillData = () => {
        this.props.loadVersions(this.props.skillName);
    };


    private handleAddNewVersion = () => {
        if (this.props.serviceSkillId >= 0 && this.state.newVersionText) {
            this.props.addNewVersion(this.props.serviceSkillId, this.state.newVersionText);
            this.setState({
                anchorEl: null,
                newVersionText: ''
            });
        }
    };

    private handleNewVersionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        this.setState({
            anchorEl: event.currentTarget
        });
    };

    private handleDelete = (versionName: string) => {
        if (this.props.serviceSkillId >= 0 && versionName) {
            this.props.deleteVersion(this.props.serviceSkillId, versionName);
        }
    };

    private handleEnterButton = (event: KeyboardEvent) => {
        if (event.key == 'Enter') {
            this.setState({anchorEl: null});
            this.handleAddNewVersion();
        }
    };

    private mapVersions = () => {
        let result: JSX.Element[];
        if (this.props.handleVersionToggle && this.props.profileVersions) {
            result = this.props.allVersions.sort((a, b) => a.localeCompare(b))
                .map((value, index) =>
                    <Chip key={index}
                          color={this.props.profileVersions.indexOf(value) >= 0 ?
                              'primary' : 'default'} label={value}
                          onClick={() => this.props.handleVersionToggle(value)}
                    />);
        } else {
            result = this.props.allVersions.sort((a, b) => a.localeCompare(b))
                .map((value, index) => <Chip key={index} label={value} onDelete={() => this.handleDelete(value)}/>);
        }

        result.push(<Chip key={'newVersion'} icon={<AddIcon/>} label={PowerLocalize.get('Action.New')}
                          color={'secondary'}
                          onClick={this.handleNewVersionClick}/>);
        return result;
    };

    render() {
        return (<Grid>
            <Popover
                anchorEl={this.state.anchorEl}
                open={Boolean(this.state.anchorEl)}
                anchorOrigin={{vertical: 'top', horizontal: 'center',}}
                transformOrigin={{vertical: 'bottom', horizontal: 'center',}}
                onClose={() => this.setState({anchorEl: null})}
            >
                <div style={{margin: '5px'}} onKeyDown={this.handleEnterButton}>
                    <TextField label={PowerLocalize.get('Version.New')} placeholder={PowerLocalize.get('Version.New')}
                               value={this.state.newVersionText}
                               onChange={event => this.setState({newVersionText: event.target.value})}

                    />
                    <PwrIconButton iconName={'add'} tooltip={PowerLocalize.get('Action.Add')} onClick={() => {
                        this.handleAddNewVersion();
                    }}/>
                </div>
            </Popover>
            <div>{this.props.allVersions ? this.mapVersions() : ''}</div>
        </Grid>);
    }
}

export const PwrSkillVersionInfo: React.ComponentClass<PwrSkillVersionInfoLocalProps> = connect(PwrSkillVersionInfoModule.mapStateToProps, PwrSkillVersionInfoModule.mapDispatchToProps)(PwrSkillVersionInfoModule);
