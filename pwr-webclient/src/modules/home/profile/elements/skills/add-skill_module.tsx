import * as React from 'react';
import {KeyboardEvent} from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {StarRating} from '../../../../star-rating_module.';
import Button from '@material-ui/core/Button/Button';
import Typography from '@material-ui/core/Typography/Typography';
import {getSearchSkill} from '../../../../../API_CONFIG';
import axios, {AxiosResponse} from 'axios';
import {isNullOrUndefined} from 'util';
import * as Immutable from 'immutable';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';
import {SkillSearcher} from '../../../../general/skill-search_module';
import ArrowRight from '@material-ui/icons/ArrowRight';
import ArrowLeft from '@material-ui/icons/ArrowLeft';
import Stepper from '@material-ui/core/Stepper/Stepper';
import Step from '@material-ui/core/Step/Step';
import StepLabel from '@material-ui/core/StepLabel/StepLabel';
import StepContent from '@material-ui/core/StepContent/StepContent';
import HelpOutline from '@material-ui/icons/HelpOutline'

interface AddSkill_ModuleProps {
    histories: Immutable.Map<string, string>;
}

interface AddSkill_ModuleLocalProps {
    projectId?: string;
}

interface AddSkill_ModuleDispatch {
    onAddSkill(name: string, rating: number, projectId: string): void;

    requestSkillHierarchy(name: string): void;
}

interface AddSkill_ModuleState {
    skills: Array<string>
    skillRating: number;
    skillName: string;
    skillCategory: string;
    progressState: number;
    showHelp: boolean;

}

export class AddSkill_Module extends React.Component<AddSkill_ModuleProps & AddSkill_ModuleLocalProps & AddSkill_ModuleDispatch, AddSkill_ModuleState> {


    constructor(props: AddSkill_ModuleProps & AddSkill_ModuleLocalProps & AddSkill_ModuleDispatch) {
        super(props);
        this.state = {
            skills: [],
            skillRating: 1,
            skillName: '',
            skillCategory: '',
            progressState: 0,
            showHelp: false,
        };

    }

    public static mapStateToProps(state: ApplicationState, localProps: AddSkill_ModuleLocalProps): AddSkill_ModuleProps {
        return {
            histories: state.skillReducer.categorieHierarchiesBySkillName(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AddSkill_ModuleDispatch {
        return {
            onAddSkill: (name: string, rating: number, projectId: string) => dispatch(SkillActionCreator.AsyncAddSkill(name, rating, projectId)),
            requestSkillHierarchy: (name: string) => dispatch(SkillActionCreator.AsyncRequestSkillHierarchy(name)),
        };
    }

    private handleOnChange = (data: string) => {
        this.setState({
            skillName: data,
            skillCategory: ''
        });
        if (!isNullOrUndefined(data) && data.trim().length > 0) {
            let reqParams = {
                maxResults: 10,
                searchterm: data
            };
            axios.get(getSearchSkill(), {params: reqParams}).then((response: AxiosResponse) => {
                if (response.status === 200) {
                    this.setState({
                        skills: response.data
                    });
                } else if (response.status === 204) {
                    this.setState({
                        skills: []
                    });
                }
            }).catch((error: any) => {
                console.error((error));
            });
            this.requestSkillCategory();
        }
    };


    private requestSkillCategory = () => {
        this.state.skills.forEach(value => this.props.requestSkillHierarchy(value));
        this.props.requestSkillHierarchy(this.state.skillName);
    };

    private handleRatingChange = (value: number) => {
        this.setState({
            skillRating: value,
        });
    };

    private resetState = () => {
        this.focusTextField();
        this.setState({
            skillRating: 1,
            skillName: '',
            skillCategory: '',
            progressState: 0,
            showHelp: false,
        });
    };

    private onAddSkill = () => {
        // console.log('onAddSkill');
        this.props.onAddSkill(this.state.skillName, this.state.skillRating, this.props.projectId);
        this.resetState();
    };

    private focusTextField = () => {
        document.getElementById('testName_inputField').focus();
    };

    private handleKeyPress = (event: KeyboardEvent) => {
        if (this.state.progressState == 0 && event.key == 'Enter' && !isNullOrUndefined(this.state.skillName)) {
            if (this.props.histories.has(this.state.skillName)) {
                let history = this.props.histories.get(this.state.skillName);
               // console.log(history);
                this.setState({skillCategory: history});
            } else {

                this.requestSkillCategory();
            }
            //console.log('Progress zu 1');
            this.setState({progressState: 1});
            // TODO remove focus from Textfield
            document.getElementById('addSkillMain').focus();
        }
        else if (this.state.progressState == 1) {
            if (event.keyCode == 37) {
                let val: number = this.state.skillRating == 1 ? 1 : (this.state.skillRating - 1);
                this.handleRatingChange(val);
                //console.debug('leftArrow');
            } else if (event.keyCode == 39) {
                let val: number = this.state.skillRating == 5 ? 5 : (this.state.skillRating + 1);
                this.handleRatingChange(val);
                //console.debug('leftArrow');
            } else if (event.key == 'Enter') {
                this.onAddSkill();
            }
        }
        if (event.key == 'Escape') {
            this.resetState();
        }
    };

    private toggleShowHelp = () => {
        this.setState({
            showHelp: !this.state.showHelp,
        });
    };

    render() {
        return <div
            onKeyDown={this.handleKeyPress}
            id={'addSkillMain'}
        >
            <div>
                <Button onClick={this.toggleShowHelp}><HelpOutline/></Button>
                {!this.state.showHelp ? <></> :
                    <Stepper activeStep={this.state.progressState}>
                        <Step key={'Step0'}>
                            <StepLabel>Text eingeben</StepLabel>
                            <StepContent>
                            Nach einem Skill suchen und mit Enter bestätigen
                            </StepContent>
                        </Step>
                        <Step key={'Step1'}>
                            <StepLabel>Level anpassen</StepLabel>
                            <StepContent>
                                Kategorie überprüfen. <br/>
                                Mit den Pfeiltasten links/rechts das Level einstellen und mit Enter bestätigen
                            </StepContent>
                        </Step>

                    </Stepper>}

            </div>
            <div style={{minHeight: '49px'}}>
                <div id={'addSkillTextField'} onClick={() => this.setState({progressState: 0})} style={{float: 'left', width:'45%'}}>
                    <SkillSearcher
                        id={'testName'}
                        label={'Skill'}
                        value={this.state.skillName}
                        onValueChange={this.handleOnChange}
                    />
                </div>
                <div>
                    <div id={'addSkillRatingSelect'} style={{float: 'left'}}>
                        {this.state.progressState == 1 ? <ArrowLeft/> : <></>}
                        <StarRating rating={this.state.skillRating} onRatingChange={this.handleRatingChange}/>
                        {this.state.progressState == 1 ? <ArrowRight/> : <></>}
                    </div>
                    <Button variant={'contained'} onClick={this.onAddSkill}>
                        {this.state.progressState == 1 ? 'Enter' : 'Bestätigen'}
                    </Button>
                </div>
            </div>
            <div>
                <Typography>{this.state.skillCategory != '' ? 'Kategorie: ' + this.state.skillCategory : 'Keine Kategorie gefunden'}</Typography>
            </div>
        </div>;
    }
}


export const AddSkill: React.ComponentClass<AddSkill_ModuleLocalProps> =
    connect(AddSkill_Module.mapStateToProps, AddSkill_Module.mapDispatchToProps)(AddSkill_Module);
;