import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileElementType} from '../../../../../Store';
import {SingleLanguage} from './language-skill_module';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {LanguageSkill} from '../../../../../model/LanguageSkill';
import * as Immutable from 'immutable';
import {NameEntity} from '../../../../../model/NameEntity';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {ProfileElement} from '../../profile-element_module';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {LanguageSkillDialog} from './language-skill-dialog_module';
import {DEFAULT_LANG_LEVEL} from '../../../../../model/PwrConstants';
import {Language, newLanguage} from '../../../../../reducers/profile-new/model/Language';
import * as NameEntityNew from '../../../../../reducers/profile-new/model/NameEntity';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/ProfileDataAsyncActionCreator';

interface LanguageProps {
    languageSkills: Immutable.Map<string, LanguageSkill>;
    languageArray: Array<Language>;
    languages: Immutable.Map<string, NameEntity>;
    languageLevels: Array<string>;
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
    createOpen: boolean;
}

interface LanguageDispatch {
    addLanguageSkill(): void;

    deleteLanguageSkill(id: number): void;

    saveLanguageSkill(id: number, name: NameEntityNew.NameEntity, level: string): void;
}

class LanguagesModule extends React.Component<LanguageProps & LanguageLocalProps & LanguageDispatch, LanguageLocalState> {

    constructor(props) {
        super(props);
        this.state = {
            createOpen: false
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: LanguageLocalProps): LanguageProps {
        return {
            languageSkills: state.databaseReducer.profile().languageSkills(),
            languageArray: state.profile.profile.languages,
            languages: state.databaseReducer.languages(),
            languageLevels: state.databaseReducer.languageLevels()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): LanguageDispatch {
        return {
            addLanguageSkill: function () {
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.LanguageEntry));
            },
            deleteLanguageSkill: function (id: number) {
                dispatch(ProfileDataAsyncActionCreator.deleteLanguage("ppp",id)); // TODO initials
            },
            saveLanguageSkill: (id, name, level) =>  {
                dispatch(ProfileDataAsyncActionCreator.saveLanguage("ppp", newLanguage(id,name,level)))
            }
        };
    }

    private openCreate = () => {
        this.setCreateOpen(true);
    };

    private closeCreate = () => {
        this.setCreateOpen(false);
    };

    private setCreateOpen = (open: boolean) => {
        this.setState({createOpen: open});
    };

    private saveAsNew = (name: NameEntityNew.NameEntity, level: string) => {
        this.props.saveLanguageSkill(null, name, level);
        this.closeCreate();
    };

    private levels = () => {
        return this.props.languageLevels;
    };

    private languages = () => {
        return this.props.languages.toArray().map(NameEntityUtil.mapToName);
    };

    private handleAddElement = () => {
        this.openCreate();
    };

    private languageFrom = (languageId: string) => {
        return this.props.languages.get(languageId).name();
    };

    private saveLanguage = (id: number, languageName: NameEntityNew.NameEntity, languageLevel: string) => {
        this.props.saveLanguageSkill(id, languageName, languageLevel);
    };

    private renderSingleLanguage = (language: Language, id: number) => {
        return (
            <SingleLanguage
                key={language.id}
                id={language.id.toString()}
                level={language.level}
                language={language.nameEntity.name}
                availableLevels={this.levels()}
                availableLanguages={this.languages()}
                onSave={(name, level) => this.saveLanguage(id, name, level)}
                onDelete={() => this.props.deleteLanguageSkill(language.id)}
            />
        );
    };

    render() {
        return (
            <React.Fragment>
                <LanguageSkillDialog key="Dialog" languageName={''} languageLevel={DEFAULT_LANG_LEVEL}
                                     availableLanguages={this.languages()}
                                     availableLevels={this.levels()}
                                     open={this.state.createOpen}
                                     onSave={this.saveAsNew}
                                     onClose={this.closeCreate}
                />
                <ProfileElement key="Element"
                    title={PowerLocalize.get('Language.Singular')}
                    subtitle={PowerLocalize.get('LanguageSkill.Description')}
                    onAddElement={this.handleAddElement}
                >
                    {this.props.languageArray.map(this.renderSingleLanguage)}
                </ProfileElement>
            </React.Fragment>
        );
    }
}

export const LanguageSkills: React.ComponentClass<LanguageLocalProps> = connect(LanguagesModule.mapStateToProps, LanguagesModule.mapDispatchToProps)(LanguagesModule);