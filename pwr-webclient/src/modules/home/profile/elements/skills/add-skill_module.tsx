import * as React from 'react';
import {connect} from 'react-redux';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import * as redux from 'redux';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import {isNullOrUndefined} from "util";
import {SkillSearcher} from '../../../../general/skill-search_module';
import {StarRating} from '../../../../star-rating_module.';

interface AddSkill_ModuleProps {

}

interface AddSkill_ModuleLocalProps {

}

interface AddSkill_ModuleDispatch {

}

interface AddSkill_ModuleState {
    autoCompleteValue:string;
    currentSuggestSkills:Array<string>
}

export class AddSkill_Module extends React.Component<AddSkill_ModuleProps & AddSkill_ModuleLocalProps & AddSkill_ModuleDispatch, AddSkill_ModuleState> {


    constructor(props: AddSkill_ModuleProps & AddSkill_ModuleLocalProps & AddSkill_ModuleDispatch) {
        super(props);
        this.state = {
            autoCompleteValue:"",
            currentSuggestSkills:[],
        };
    }
    
    public static mapStateToProps(state: ApplicationState, localProps: AddSkill_ModuleLocalProps): AddSkill_ModuleProps {
        return {};
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): AddSkill_ModuleDispatch {
        return {};
    }

    private handleOnChange = (data: string) => {
    };

    private handleRatingChange = (value:number) => {

    };

    render() {
        return (<div>
            <SkillSearcher
                id={"AddSkill.Searcher"}
                onValueChange={this.handleOnChange}
                maxResults={10}
            />

            <StarRating rating={3} onRatingChange={this.handleRatingChange}/>

        </div>);
    }
}


export const AddSkill: React.ComponentClass<AddSkill_ModuleLocalProps> = connect(AddSkill_Module.mapStateToProps, AddSkill_Module.mapDispatchToProps)(AddSkill_Module);