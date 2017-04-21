/**
 * Created by nt on 20.04.2017.
 */

import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, LanguageLevel, LanguageSkill, SingleProfile} from '../../../Store';
import {AutoComplete, MenuItem, SelectField, TouchTapEvent} from 'material-ui';
import {LanguageLevelUtil} from '../../../utils/LanguageLevelUtil';
import {ProfileActionCreator} from '../../../reducers/singleProfile/singleProfileActions';
import {connect} from 'react-redux';
import {Col, Grid, Row} from 'react-flexbox-grid';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

interface SingleLanguageProps {
    languageSkill: LanguageSkill;
    /**
     * Languages used for auto-completion.
     */
    possibleLanguages: string[];
}

interface SingleLanguageLocalProps {
    /**
     * The index given to this single language module. This is necessary to
     * get the correct language from the global state.
     */
    index: number;
}

interface SingleLanguageDispatch {
    changeLanguage: (languageSkill: LanguageSkill, index: number) => void;
}

interface SingleLanguageLocalState {
    nameAutoCompleteValue: string;

    backgroundColor: string;
}

class SingleLanguageModule extends React.Component<SingleLanguageLocalProps & SingleLanguageProps & SingleLanguageDispatch, SingleLanguageLocalState> {

    constructor(props: SingleLanguageLocalProps & SingleLanguageProps & SingleLanguageDispatch) {
        super(props);
        this.state = {
            nameAutoCompleteValue: props.languageSkill.name,
            backgroundColor: "initial"
        }
    }

    private static renderSingleDropDownElement(languageLevel: LanguageLevel, idx: number) {
        return (<MenuItem value={idx} primaryText={LanguageLevel[languageLevel]} key={idx}/>);
    }

    public static mapStateToProps(state: ApplicationState, props: SingleLanguageLocalProps) : SingleLanguageProps {
        return {
            languageSkill: state.singleProfile.profile.languages[props.index],
            possibleLanguages: state.singleProfile.possibleLanguageNames
        };
    }

    public static mapDispatchToProps(dispatch: redux.Dispatch<SingleProfile>) : SingleLanguageDispatch {
        return {
            changeLanguage: function(languageSkill: LanguageSkill, index: number): void {
                dispatch(ProfileActionCreator.changeLanguageSkill(languageSkill, index));
            }
        };
    }

    private handleLanguageRequest = (value: string) => {
        // Make sure the language name exists in the list of allowed languages. .
        if(this.props.possibleLanguages.indexOf(value) >= 0) {
            let newSkill:  LanguageSkill = {
                name: value,
                languageLevel: this.props.languageSkill.languageLevel
            };
            this.props.changeLanguage(newSkill, this.props.index);
            this.setState({backgroundColor: 'initial'});
        } else {
            // If the language name does not exist, display an error.
            this.setState({backgroundColor: 'red'});
        }

    };

    /**
     *
     * @param value
     */
    private handleAutoCompleteChange = (value: string) => {
        this.setState({
            nameAutoCompleteValue: value
        })
    };

    private handleLevelChange = (event: TouchTapEvent, index: number, value: string) => {
        let newSkill: LanguageSkill = {
            name: this.props.languageSkill.name,
            languageLevel: LanguageLevelUtil.getLevel(index)
        };
        this.props.changeLanguage(newSkill, this.props.index);
    };

    render() {
        return(
        <tr>
            <td>
                <SelectField
                    value={this.props.languageSkill.languageLevel}
                    onChange={this.handleLevelChange}
                    style={{"width": "10em"}}
                >
                    {
                        LanguageLevelUtil.getValues().map(SingleLanguageModule.renderSingleDropDownElement)
                    }
                </SelectField>
            </td>
            <td>
                <AutoComplete
                    hintText={PowerLocalize.get("Language.Singular")}
                    value={this.state.nameAutoCompleteValue}
                    dataSource={this.props.possibleLanguages}
                    onUpdateInput={this.handleAutoCompleteChange}
                    onNewRequest={this.handleLanguageRequest}
                    style={{"backgroundColor":this.state.backgroundColor}}
                />
            </td>
        </tr>
        );
    }
}

export const SingleLanguage: React.ComponentClass<SingleLanguageLocalProps> = connect(SingleLanguageModule.mapStateToProps, SingleLanguageModule.mapDispatchToProps)(SingleLanguageModule);