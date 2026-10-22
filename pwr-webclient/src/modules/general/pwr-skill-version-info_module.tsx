import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import {KeyboardEvent} from 'react';
import {ApplicationState} from '../../reducers/reducerIndex';
import {connect} from 'react-redux';
import {Grid} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import {SkillVersionActionCreator} from '../../reducers/profile-skill/SkillVersionActionCreator';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {NON_PERSISTENT_ID} from '../../model/PwrConstants';
import {ThunkDispatch} from 'redux-thunk';
import {PwrSpacer} from './pwr-spacer_module';
import {PwrRow} from './pwr-form-section';

interface PwrSkillVersionInfoProps {
    serviceSkillId: number;
    allVersions: string[];
}

interface PwrSkillVersionInfoLocalProps {
    skillName: string;
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

    static mapStateToProps(state: ApplicationState): PwrSkillVersionInfoProps {
        const versions = state.skillVersionStore.currentVersions ? state.skillVersionStore.currentVersions : [];
        const skillId = state.skillVersionStore.serviceSkillId;
        return {
            allVersions: versions,
            serviceSkillId: skillId,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): PwrSkillVersionInfoDispatch {
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
        if (this.props.skillName != prevProps.skillName) {
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
        if (this.props.serviceSkillId >= 0 && versionName) {
            this.props.deleteVersion(this.props.serviceSkillId, versionName);
        }
    };

    private handleEnterButton = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            this.setState({anchorEl: null});
            this.handleAddNewVersion();
        }
    };

    private mapVersions = () => {
        return [...this.props.allVersions].sort((a, b) => a.localeCompare(b, undefined, {numeric: true}))
            .map(value => <Chip key={value} label={value} onDelete={() => this.handleDelete(value)}/>);
    };

    render() {
        const versions = this.props.allVersions ? this.mapVersions() : [];
        return (<Grid>
              <TextField label={PowerLocalize.get('Version.New')} fullWidth
                         value={this.state.newVersionText}
                         onChange={event => this.setState({newVersionText: event.target.value})}
                         onKeyPress={event => {this.handleEnterButton(event)}}
              />
              {versions.length > 0 && <>
                  <PwrSpacer size="tight"/>
                  <PwrRow>{versions}</PwrRow>
              </>}
        </Grid>);
    }
}

export const PwrSkillVersionInfo = connect(PwrSkillVersionInfoModule.mapStateToProps, PwrSkillVersionInfoModule.mapDispatchToProps)(PwrSkillVersionInfoModule);
