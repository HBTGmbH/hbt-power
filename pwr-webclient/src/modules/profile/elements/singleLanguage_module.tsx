/**
 * Created by nt on 20.04.2017.
 */

import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, SingleProfile} from '../../../Store';
import {AutoComplete, MenuItem, SelectField, TouchTapEvent} from 'material-ui';
import {ProfileActionCreator} from '../../../reducers/singleProfile/singleProfileActions';
import {connect} from 'react-redux';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {LanguageSkill} from '../../../model/LanguageSkill';

interface SingleLanguageProps {
    languageSkill: LanguageSkill;
    /**
     * Languages used for auto-completion.
     */
    possibleLanguages: string[];

    /**
     * Used to create the dropdown menu
     */
    possibleLanguageLevels: string[];
}

interface SingleLanguageLocalProps {
    /**
     * The index given to this single language module. This is necessary to
     * get the correct language from the global state.
     */
    index: number;
}

interface SingleLanguageDispatch {
    changeLangName: (newName: string, index: number) => void;
    changeLangLevel: (newLevel: string, index: number) => void;
}

interface SingleLanguageLocalState {
    nameAutoCompleteValue: string;

    backgroundColor: string;
}

class SingleLanguageModule extends React.Component<SingleLanguageLocalProps & SingleLanguageProps & SingleLanguageDispatch, SingleLanguageLocalState> {

    constructor(props: SingleLanguageLocalProps & SingleLanguageProps & SingleLanguageDispatch) {
        super(props);
        this.state = {
            nameAutoCompleteValue: props.languageSkill.language.name,
            backgroundColor: "initial"
        }
    }

    private static renderSingleDropDownElement(languageLevel: string, idx: number) {
        return (<MenuItem value={languageLevel} primaryText={languageLevel} key={languageLevel}/>);
    }

    public static mapStateToProps(state: ApplicationState, props: SingleLanguageLocalProps) : SingleLanguageProps {
        return {
            languageSkill: state.singleProfile.profile.languages[props.index],
            possibleLanguages: state.singleProfile.possibleLanguageNames,
            possibleLanguageLevels: state.singleProfile.possibleLanguageLevels
        };
    }

    public static mapDispatchToProps(dispatch: redux.Dispatch<SingleProfile>) : SingleLanguageDispatch {
        return {
            changeLangName: function(newName: string, index: number): void {
                dispatch(ProfileActionCreator.changeLanguageSkillName(newName, index));
            },
            changeLangLevel: function(newLevel: string, index: number): void {
                dispatch(ProfileActionCreator.changeLanguageSkillLevel(newLevel, index));
            }
        };
    }

    private handleLanguageRequest = (value: string) => {
        // Make sure the language name exists in the list of allowed languages. .
        if(this.props.possibleLanguages.indexOf(value) >= 0) {
            let newSkill:  LanguageSkill = {
                language: {name: value},
                level: this.props.languageSkill.level
            };
            this.props.changeLangName(value, this.props.index);
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
        this.props.changeLangLevel(value, this.props.index);
    };

    render() {
        return(
        <tr>
            <td>
                <SelectField
                    value={this.props.languageSkill.level}
                    onChange={this.handleLevelChange}
                    style={{"width": "10em"}}
                >
                    {
                        this.props.possibleLanguageLevels.map(SingleLanguageModule.renderSingleDropDownElement)
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