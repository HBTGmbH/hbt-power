import * as React from 'react';
import * as NameEntityNew from '../../../../../reducers/profile-new/profile/model/NameEntity';
import {newNameEntity} from '../../../../../reducers/profile-new/profile/model/NameEntity';
import * as redux from 'redux';
import {ProfileDataAsyncActionCreator} from '../../../../../reducers/profile-new/profile/ProfileDataAsyncActionCreator';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import {Language, newLanguage} from '../../../../../reducers/profile-new/profile/model/Language';
import {connect} from 'react-redux';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';
import Select from '@material-ui/core/Select/Select';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import FormControl from '@material-ui/core/FormControl/FormControl';
import MenuItem from '@material-ui/core/MenuItem/MenuItem';
import {LanguageLevel, toLanguageLevel} from '../../../../../reducers/profile-new/profile/model/LanguageLevel';
import {NameEntityType} from '../../../../../reducers/profile-new/profile/model/NameEntityType';
import {PwrDeleteConfirm} from '../../../../general/pwr-delete-confirm';
import {ProfileEntryType} from '../../../../../reducers/profile-new/profile/model/ProfileEntryType';

interface LanguageProps {
    profileLanguages: Array<Language>,
    suggestions: Array<string>,
    level: Array<LanguageLevel>,
    initials: string,
}

interface LanguageLocalProps {

}

interface LanguageLocalState {
    selectId: number;
    addNew: boolean;
    deleteConfirm: boolean;
    languageSearchText: string;
    selectLevel: LanguageLevel;
    editId: number;
    selectLanguage: Language;
}

interface LanguageDispatch {

    deleteLanguageSkill(initials: string, id: number): void;

    saveLanguageSkill(initials: string, id: number, name: NameEntityNew.NameEntity, level: LanguageLevel): void;
}

class Language_module extends React.Component<LanguageProps & LanguageLocalProps & LanguageDispatch, LanguageLocalState> {
    constructor(props) {
        super(props);
        this.resetState();
    }

    private resetState() {
        this.state = {
            selectId: -1,
            editId: -1,
            addNew: false,
            languageSearchText: '',
            selectLevel: LanguageLevel.BASIC,
            selectLanguage: null,
            deleteConfirm: false,
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: LanguageLocalProps): LanguageProps {
        const languages = (state.profileStore != null && state.profileStore.profile != null) ? state.profileStore.profile.languages : [];
        const strings = state.suggestionStore.allLanguages.map(e => e.name);
        const level = [LanguageLevel.BASIC, LanguageLevel.ADVANCED, LanguageLevel.BUSINESS_FLUENT, LanguageLevel.NATIVE];
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        return {
            profileLanguages: languages,
            suggestions: strings,
            level: level,
            initials: initials,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): LanguageDispatch {
        return {
            deleteLanguageSkill: (initials, id) => {
                dispatch(ProfileDataAsyncActionCreator.deleteLanguage(initials, id));
            },
            saveLanguageSkill: (initials, id, name, level) => {
                dispatch(ProfileDataAsyncActionCreator.saveLanguage(initials, newLanguage(id, name, level)));
            }
        };
    }

    private handleEditButton = (language: Language, id: number) => {
        this.setState({
            editId: this.state.editId == id ? -1 : id,
            languageSearchText: language.nameEntity.name,
            selectLevel: language.level,
            addNew: false,
        });
    };

    private singleLanguage = (language: Language, id: number) => {
        return (<Grid key={id} item container alignItems={'flex-end'} spacing={8}
                      onClick={() => this.setState({
                          selectId: id,
                          selectLanguage: language
                      })}
                      style={{minHeight: 48}}
            >
                <Grid item md={2} container spacing={0} style={{padding: 0}}>
                    {
                        id != this.state.selectId ? <></> : <Grid>
                            <PwrIconButton iconName={'delete'} tooltip={'Löschen'}
                                           onClick={() => this.setState({deleteConfirm: true})}/>

                            <PwrDeleteConfirm onClose={() => this.setState({deleteConfirm: false})}
                                              infoText={'Willst du \'' + language.nameEntity.name + '\' wirklich löschen?'}
                                              header={'Löschen Bestätigen'}
                                              open={this.state.deleteConfirm}
                                              onConfirm={() => this.props.deleteLanguageSkill(this.props.initials, this.state.selectLanguage.id)}/>

                            <PwrIconButton iconName={'create'} tooltip={'Bearbeiten'}
                                           onClick={() => this.handleEditButton(language, id)}/>
                        </Grid>
                    }
                </Grid>
                <Grid item>
                    {this.state.editId != id ?
                        <Typography variant={'h5'}> {language.nameEntity.name}</Typography>
                        :
                        <PwrAutoComplete
                            label={PowerLocalize.get('Language.Singular')}
                            id={'Language.Dialog.AutoComplete.Language'}
                            data={this.props.suggestions}
                            searchTerm={this.state.languageSearchText}
                            onSearchChange={(value) => this.setState({languageSearchText: value})}
                        />
                    }
                </Grid>
                <Grid item>
                    {this.state.editId != id ?
                        <Typography
                            variant={'body2'}>
                            {PowerLocalize.langLevelToLocalizedString(language.level)}
                        </Typography>
                        :
                        <FormControl>
                            <Select
                                value={this.state.selectLevel}
                                onChange={this.handleSelectChange}
                            >
                                {this.props.level.map(this.renderSelectElement)}
                            </Select>
                        </FormControl>
                    }
                </Grid>
            </Grid>
        );
    };

    private renderSelectElement = (level: LanguageLevel, id: number) => {
        return <MenuItem key={id} value={level}>
            {PowerLocalize.langLevelToLocalizedString(level)}
        </MenuItem>;
    };


    private renderAddEntry = () => {
        if (this.state.addNew) {
            return (
                <Grid key={'new'} item container spacing={8} alignItems={'flex-end'}>
                    <Grid item md={2}>
                        <PwrIconButton iconName={'save'} tooltip={'Löschen'}
                                       onClick={() => this.handleUpdateButton(true)}/>
                    </Grid>
                    <Grid item>
                        <PwrAutoComplete
                            label={PowerLocalize.get('Language.Singular')}
                            id={'Language.Dialog.AutoComplete.Language'}
                            data={this.props.suggestions}
                            searchTerm={this.state.languageSearchText}
                            onSearchChange={(value) => this.setState({languageSearchText: value})}
                        />
                    </Grid>
                    <Grid item>
                        <FormControl>
                            <Select
                                value={this.state.selectLevel}
                                onChange={this.handleSelectChange}
                            >
                                {this.props.level.map(this.renderSelectElement)}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            );
        } else return <></>;
    };

    private handleSelectChange = (event: React.ChangeEvent<{ name?: string; value: any }>) => {
        this.setState({
            selectLevel: toLanguageLevel(event.target.value)
        });
    };

    private handleAddButton = () => {
        this.setState({
            addNew: !this.state.addNew,
            selectId: -1,
            selectLanguage: null
        });
        if (this.state.addNew == false) {
            this.setState({
                languageSearchText: '',
                selectLevel: LanguageLevel.BASIC,
            });
        }
    };

    private handleUpdateButton = (isNew: boolean) => {
        this.props.saveLanguageSkill(
            this.props.initials,
            isNew ? null : this.state.selectLanguage.id,
            isNew ? newNameEntity(null, this.state.languageSearchText, NameEntityType.LANGUAGE) : this.state.selectLanguage.nameEntity,
            this.state.selectLevel
        );
    };

    render() {
        return (
            <div>
                <Grid container spacing={0} alignItems={'center'} style={{border: '1px'}}>
                    <Grid item md={9}>
                        <Typography variant={'h4'}>Sprachen</Typography>
                    </Grid>
                    <Grid item md={3}>
                        <Button variant={'outlined'}
                                onClick={this.handleAddButton}>NEU</Button>
                    </Grid>
                    <Grid item md={12}>
                        <hr style={{marginTop: '2px'}}/>
                    </Grid>
                    <Grid item container md={10}>
                        {
                            !isNullOrUndefined(this.props.profileLanguages) && this.props.profileLanguages.length > 0 ?
                                this.props.profileLanguages.map(this.singleLanguage) :
                                <Grid item> <Typography variant={'body1'} onClick={this.handleAddButton}>Füge eine
                                    Sprache hinzu</Typography></Grid>
                        }
                        {
                            this.renderAddEntry()
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const LanguageModule: React.ComponentClass<LanguageLocalProps> = connect(Language_module.mapStateToProps, Language_module.mapDispatchToProps)(Language_module);
