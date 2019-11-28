import {ProfileSkill} from '../../../../../reducers/profile-new/profile/model/ProfileSkill';
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {SkillServiceClient} from '../../../../../clients/SkillServiceClient';
import {AxiosError} from 'axios';
import {Grid} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import {StarRating} from '../../../../star-rating_module.';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';
import {PwrSkillVersionInfo} from '../../../../general/pwr-skill-version-info_module';


interface SkillInfoProps {
    initials: string;
}

interface SkillInfoLocalProps {
    selectedSkill: ProfileSkill;

    handleChangeRating(rating: number, skill: ProfileSkill): void;


}

interface SkillInfoDispatch {
    saveSkill(initials: string, skill: ProfileSkill): void;

}

interface SkillInfoState {
    allVersions: string[];
    skillServiceId: number;
    newVersionText: string;
    anchorEl: any;
}

class SkillInfoModule extends React.Component<SkillInfoProps & SkillInfoLocalProps & SkillInfoDispatch, SkillInfoState> {
    constructor(props: SkillInfoProps & SkillInfoLocalProps & SkillInfoDispatch) {
        super(props);
        this.state = {
            allVersions: [],
            skillServiceId: -1,
            newVersionText: '',
            anchorEl: null,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: SkillInfoLocalProps): SkillInfoProps {
        const initials = state.profileStore.consultant != null ? state.profileStore.consultant.initials : 'error';
        return {
            initials: initials,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): SkillInfoDispatch {
        return {
            saveSkill: (initials, skill) => dispatch(ProfileDataAsyncActionCreator.saveProfileSkill(initials, skill)),
        };
    }

    componentDidUpdate(prevProps: Readonly<SkillInfoProps & SkillInfoLocalProps & SkillInfoDispatch>,
                       prevState: Readonly<SkillInfoState>): void {
        if (this.props != prevProps) {
            if (this.props.selectedSkill != null) {
                this.loadSkillData(this.props.selectedSkill.name);
            }
        }
    }

    private loadSkillData = (name: string) => {
        if (this.props.selectedSkill != null) {

            SkillServiceClient.instance().getSkillByName(name).then(skill => {
                this.setState({
                    allVersions: skill.versions,
                    skillServiceId: skill.id
                });
            }).catch((error: AxiosError) => {
                console.error(error);
            });
        }
    };

    private handleVersionToggle = (version: string) => {
        let newVersions = this.props.selectedSkill.versions;
        if (this.props.selectedSkill.versions.indexOf(version) >= 0) {
            newVersions = newVersions.filter(value => value != version);
        } else {
            newVersions.push(version);
        }
        const skillToSave: ProfileSkill = {...this.props.selectedSkill, ...{versions: newVersions}};
        this.props.saveSkill(this.props.initials, skillToSave);
    };


    render() {
        return (
            <Grid container spacing={16}>

                {this.props.selectedSkill == null ? <></> :
                    <Grid item md={12}>
                        <Typography variant={'body1'}>{this.props.selectedSkill.name}</Typography>
                        <PwrSkillVersionInfo skillName={this.props.selectedSkill.name}
                                             handleVersionToggle={this.handleVersionToggle}
                                             profileVersions={this.props.selectedSkill.versions}/>
                        <StarRating rating={this.props.selectedSkill.rating}
                                    onRatingChange={newRating => this.props.handleChangeRating(newRating, this.props.selectedSkill)}/>
                    </Grid>
                }
            </Grid>
        );
    }
}

export const SkillInfo: React.ComponentClass<SkillInfoLocalProps> = connect(SkillInfoModule.mapStateToProps, SkillInfoModule.mapDispatchToProps)(SkillInfoModule);
