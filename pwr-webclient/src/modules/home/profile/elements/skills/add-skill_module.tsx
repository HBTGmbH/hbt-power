import * as React from 'react';
import {KeyboardEvent, RefObject} from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {StarRating} from '../../../../star-rating_module.';
import Button from '@material-ui/core/Button/Button';
import Typography from '@material-ui/core/Typography/Typography';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import {getSearchSkill} from '../../../../../API_CONFIG';
import axios, {AxiosResponse} from 'axios';
import {isNullOrUndefined} from 'util';
import * as Immutable from 'immutable';
import {SkillActionCreator} from '../../../../../reducers/skill/SkillActionCreator';

interface AddSkill_ModuleProps {
    histories: Immutable.Map<string, string>;
}

interface AddSkill_ModuleLocalProps {

}

interface AddSkill_ModuleDispatch {
    onAddSkill(name: string, category: string): void;

    requestSkillHierarchy(name: string): void;
}

interface AddSkill_ModuleState {
    skills: Array<string>
    skillRating: number;
    skillName: string;
    skillCategory: string;
    progressState: number;
    skillTextFieldElement: RefObject<any>;
    skillRatingElement: RefObject<any>;
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
            skillTextFieldElement: React.createRef(),
            skillRatingElement: React.createRef(),
        };

    }

    public static mapStateToProps(state: ApplicationState, localProps: AddSkill_ModuleLocalProps): AddSkill_ModuleProps {
        return {
            histories: state.skillReducer.categorieHierarchiesBySkillName(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AddSkill_ModuleDispatch {
        return {
            onAddSkill: (name: string) => dispatch(SkillActionCreator.AsyncAddSkill(name)),
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
            progressState: 0,
            skillCategory: '',
        });
    };

    private onAddSkill = () => {
        console.log('onAddSkill');
        this.props.onAddSkill(this.state.skillName, 'a');
        this.resetState();
    };

    private focusTextField = () => {
        document.getElementById('addSkillTextField').focus();
    };

    private handleKeyPress = (event: KeyboardEvent) => {
        if (this.state.progressState == 0 && event.key == 'Enter' && !isNullOrUndefined(this.state.skillName)) {
            // skill wurde ausgesucht
            // TODO category suchen
            /*this.props.histories.forEach((value,key) => console.log(key+"   ----    "+value));

            console.log("contains?  "+this.state.skillName);
            let x = this.props.histories.findKey((value, key) => key==this.state.skillName);
            console.log(x);*/
            if (this.props.histories.has(this.state.skillName)) {
                let history = this.props.histories.get(this.state.skillName);
                console.log(history);
                this.setState({skillCategory: history});
            } else {

                this.requestSkillCategory();
            }
            console.log('Progress zu 1');
            this.setState({progressState: 1});
            (document.activeElement as HTMLElement).blur();
            console.log((document.getElementById('addSkillMain') as HTMLElement));
            document.getElementById('addSkillMain').focus();
        }
        else if (this.state.progressState == 1) {
            if (event.keyCode == 37) {
                let val: number = this.state.skillRating == 1 ? 1 : (this.state.skillRating - 1);
                this.setState({
                    skillRating: val
                });
                console.log('leftArrow');
            } else if (event.keyCode == 39) {
                let val: number = this.state.skillRating == 5 ? 5 : (this.state.skillRating + 1);
                this.setState({
                    skillRating: val
                });
                console.log('leftArrow');
            } else if (event.key == 'Enter') {
                this.onAddSkill();


            }
        }

        if (event.key == 'Escape') {
            this.resetState();
        }
    };

    render() {
        return <div
            onKeyDown={this.handleKeyPress}
            id={"addSkillMain"}
        >
            <div id={'addSkillTextField'} onClick={() => this.setState({progressState: 0})}>
                <PwrAutoComplete
                    label={'Skill'}
                    id={'addSkillTextField'}
                    data={this.state.skills}
                    searchTerm={this.state.skillName}
                    onSearchChange={this.handleOnChange}
                />
            </div>
            <Typography>{this.state.skillCategory}</Typography>
            <div id={'addSkillRatingSelect'}>
                <StarRating rating={this.state.skillRating} onRatingChange={this.handleRatingChange}/>
            </div>
            <Button variant={'contained'} onClick={this.onAddSkill}>
                Bestätigen
            </Button>

        </div>;
    }
}


export const AddSkill: React.ComponentClass<AddSkill_ModuleLocalProps> = connect(AddSkill_Module.mapStateToProps, AddSkill_Module.mapDispatchToProps)(AddSkill_Module);