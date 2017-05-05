import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, ProfileElementType} from '../../../../Store';
import {SingleLanguage} from './singleLanguage_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileElement} from '../../profile-element_module';
import {LanguageSkill} from '../../../../model/LanguageSkill';
import * as Immutable from 'immutable';
import {TouchTapEvent} from 'material-ui';
import {ProfileActionCreator, ProfileAsyncActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';
import {NameEntity} from '../../../../model/NameEntity';

interface LanguageProps {
    languageSkills: Immutable.Map<string, LanguageSkill>;
    languages: Immutable.Map<string, NameEntity>;
    userInitials: string;
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
    addLanguageSkill(): void;
    deleteLanguageSkill(id: string): void;
}

class LanguagesModule extends React.Component<LanguageProps & LanguageLocalProps & LanguageDispatch, LanguageLocalState> {

    private renderSingleLanguage =(language: LanguageSkill, id: string) => {
        return(<SingleLanguage id={language.id} key={"SingleLanguage." + id} onDelete={this.props.deleteLanguageSkill}/>);
    };

    private static renderHeader() {
        return (
            <div></div>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: LanguageLocalProps) : LanguageProps {
        return {
            languageSkills: state.databaseReducer.profile.languageSkills,
            languages: state.databaseReducer.languages,
            userInitials: state.databaseReducer.loggedInUser
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : LanguageDispatch {
        return {
            addLanguageSkill: function() {
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.LanguageEntry));
            },
            deleteLanguageSkill: function(id: string) {
                dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.LanguageEntry));
            }
        };
    }

    private handleAddElement = (event: TouchTapEvent) => {
        this.props.addLanguageSkill();
    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Language.Singular')}
                tableHeader={LanguagesModule.renderHeader()}
                onAddElement={this.handleAddElement}
            >
                {this.props.languageSkills.map(this.renderSingleLanguage).toArray()}
            </ProfileElement>
        );
    }
}

export const LanguageSkills: React.ComponentClass<LanguageLocalProps> = connect(LanguagesModule.mapStateToProps, LanguagesModule.mapDispatchToProps)(LanguagesModule);