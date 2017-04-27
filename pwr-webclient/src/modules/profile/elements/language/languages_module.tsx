import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../../../Store';
import {SingleLanguage} from './singleLanguage_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileElement} from '../../profile-element_module';
import {LanguageSkill} from '../../../../model/LanguageSkill';
import * as Immutable from 'immutable';
import {TouchTapEvent} from 'material-ui';
import {Language} from '../../../../model/Language';
import {ProfileAsyncActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';

interface LanguageProps {
    languageSkills: Immutable.Map<number, LanguageSkill>;
    languages: Immutable.Map<number, Language>;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface LanguageLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface LanguageLocalState {

}

interface LanguageDispatch {
    addLanguageSkill(level: string, languageId: number, languages: Immutable.Map<number, Language>): void;
}

class LanguagesModule extends React.Component<LanguageProps & LanguageLocalProps & LanguageDispatch, LanguageLocalState> {

    private static renderSingleLanguage(language: LanguageSkill, id: number) {
        return(<SingleLanguage id={id} key={id}/>);
    }

    private static renderHeader() {
        return (
            <tr>
                <th>{PowerLocalize.get("Language.Level.Singular")}</th>
                <th>{PowerLocalize.get("Qualifier.Singular")}</th>
            </tr>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: LanguageLocalProps) : LanguageProps {
        return {
            languageSkills: state.databaseReducer.profile.languageSkills,
            languages: state.databaseReducer.languages
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : LanguageDispatch {
        return {
            addLanguageSkill: function(level: string, languageId: number, languages: Immutable.Map<number, Language>) {
                dispatch(ProfileAsyncActionCreator.saveLanguageSkill("nt", LanguageSkill.createWithoutId(level,languageId), languages));
            }
        };
    }

    private handleAddElement = (event: TouchTapEvent) => {
        this.props.addLanguageSkill("", this.props.languages.first().id, this.props.languages);
    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Language.Singular')}
                subtitleCountedName={PowerLocalize.get('Language.Plural')}
                tableHeader={LanguagesModule.renderHeader()}
                onAddElement={this.handleAddElement}
            >
                {this.props.languageSkills.map(LanguagesModule.renderSingleLanguage).toArray()}
            </ProfileElement>
        );
    }
}

export const LanguageSkills: React.ComponentClass<LanguageLocalProps> = connect(LanguagesModule.mapStateToProps, LanguagesModule.mapDispatchToProps)(LanguagesModule);