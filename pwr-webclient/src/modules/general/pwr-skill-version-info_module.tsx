import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import {KeyboardEvent} from 'react';
import {ApplicationState} from '../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {Grid} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import {SkillVersionActionCreator} from '../../reducers/profile-skill/SkillVersionActionCreator';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {NON_PERSISTENT_ID} from '../../model/PwrConstants';

const ChipInput = require('material-ui-chip-input').default;

interface PwrSkillVersionInfoProps {
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
        const versions = state.skillVersionStore.currentVersions ? state.skillVersionStore.currentVersions : [];
        const skillId = state.skillVersionStore.serviceSkillId;
        return {
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
        if (this.props.serviceSkillId != NON_PERSISTENT_ID && this.state.newVersionText) {
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
        console.log("HandleDelete für: " + versionName);
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
        return result;
    };

    render() {
        return (<Grid>
              <TextField label={PowerLocalize.get('Version.New')} placeholder={PowerLocalize.get('Version.New')}
                         style={{marginBottom: '5px'}}
                         value={this.state.newVersionText}
                         onChange={event => this.setState({newVersionText: event.target.value})}
                         onKeyPress={event => {this.handleEnterButton(event)}}
              />
              <div style={{marginBottom: '5px'}}>
                  {this.props.allVersions ? this.mapVersions() : ''}
              </div>
        </Grid>);
    }
}

export const PwrSkillVersionInfo: React.ComponentClass<PwrSkillVersionInfoLocalProps> = connect(PwrSkillVersionInfoModule.mapStateToProps, PwrSkillVersionInfoModule.mapDispatchToProps)(PwrSkillVersionInfoModule);
