import TextField from '@material-ui/core/TextField';
import {PwrIconButton} from './pwr-icon-button';
import Popover from '@material-ui/core/Popover';
import * as React from 'react';
import {ApplicationState} from '../../reducers/reducerIndex';
import * as redux from 'redux';
import {SkillActionCreator} from '../../reducers/skill/SkillActionCreator';
import {connect} from 'react-redux';
import {Grid} from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import AddIcon from '@material-ui/core/SvgIcon/SvgIcon';
import {ProfileSkill} from '../../reducers/profile-new/profile/model/ProfileSkill';
import {SkillServiceSkill} from '../../model/skill/SkillServiceSkill';

interface PwrSkillVersionInfoProps {
    initials: string;
}

interface PwrSkillVersionInfoLocalProps {
    skillId: number;
    selectedSkill?: ProfileSkill;

    serviceSkill?: SkillServiceSkill;

    handleVersionToggle?(version: string): void;
}

interface PwrSkillVersionInfoDispatch {
    addNewVersion(skillId: number, newVersion: string): void;
}

interface PwrSkillVersionInfoState {
    allVersions: string[];
    anchorEl: any;
    newVersionText: string;
}

class PwrSkillVersionInfoModule extends React.Component<PwrSkillVersionInfoProps & PwrSkillVersionInfoLocalProps & PwrSkillVersionInfoDispatch, PwrSkillVersionInfoState> {

    constructor(props: PwrSkillVersionInfoProps & PwrSkillVersionInfoLocalProps & PwrSkillVersionInfoDispatch) {
        super(props);
        this.state = {
            allVersions: [],
            newVersionText: '',
            anchorEl: null,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: PwrSkillVersionInfoLocalProps): PwrSkillVersionInfoProps {
        const initials = state.profileStore.consultant != null ? state.profileStore.consultant.initials : 'error';
        return {
            initials: initials,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): PwrSkillVersionInfoDispatch {
        return {
            addNewVersion: (skillId: number, newVersion: string) => dispatch(SkillActionCreator.Skill.AsyncAddVersion(skillId, newVersion))
        };
    }

    private handleAddNewVersion = () => {
        this.props.addNewVersion(this.props.skillId, this.state.newVersionText);
    };

    private handleNewVersionClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        this.setState({
            anchorEl: event.currentTarget
        });
    };

    private mapVersions = () => {
        let result: JSX.Element[];
        if (this.props.selectedSkill) {
            result = this.state.allVersions.sort((a, b) => a.localeCompare(b))
                .map((value, index) =>
                    <Chip key={index}
                          color={this.props.selectedSkill.versions.indexOf(value) >= 0 ?
                              'primary' : 'secondary'} label={value}
                          onClick={() => this.props.handleVersionToggle(value)}
                    />);
        } else {
            result = this.state.allVersions.sort((a, b) => a.localeCompare(b))
                .map((value, index) => <Chip key={index} label={value}/>);
        }

        result.push(<Chip key={'newVersion'} icon={<AddIcon/>} label={'Neu'} onClick={this.handleNewVersionClick}/>);
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
                <div style={{margin: '5px'}}>
                    <TextField label={'New Version'} placeholder={'New Version'} value={this.state.newVersionText}
                               onChange={event => this.setState({newVersionText: event.target.value})}/>
                    <PwrIconButton iconName={'add'} tooltip={'Submit'} onClick={() => {
                        this.handleAddNewVersion();
                    }}/>
                </div>
            </Popover>
            <div>Versions: {this.state.allVersions ? this.mapVersions() : ''}</div>
        </Grid>);
    }
}

export const PwrSkillVersionInfo: React.ComponentClass<PwrSkillVersionInfoLocalProps> = connect(PwrSkillVersionInfoModule.mapStateToProps, PwrSkillVersionInfoModule.mapDispatchToProps)(PwrSkillVersionInfoModule);
