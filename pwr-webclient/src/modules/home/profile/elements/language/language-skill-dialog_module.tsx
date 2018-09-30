///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Dialog, MenuItem, Select} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {LanguageSkill} from '../../../../../model/LanguageSkill';
import {isNullOrUndefined} from 'util';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import FormControl from '@material-ui/core/FormControl/FormControl';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import AutoSuggest from '../../../../general/auto-suggest_module';
import {PwrIconButton} from '../../../../general/pwr-icon-button';


interface EducationEntryDialogLocalProps {

    languageSkill: LanguageSkill;

    languages: Immutable.Map<string, NameEntity>;

    languageLevels: Array<string>;

    open: boolean;

    /**
     * Invoked when the save button is pressed.
     * @param skill
     * @param nameEntity
     */
    onSave(skill: LanguageSkill, nameEntity: NameEntity): void;

    /**
     * Invoked when that thing is supposed to be closed.
     */
    onClose(): void;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface EducationEntryDialogLocalState {
    languageAutoCompleteValue: string;
    languageSkill: LanguageSkill;
}


export class LanguageSkillDialog extends React.Component<EducationEntryDialogLocalProps, EducationEntryDialogLocalState> {

    constructor(props: EducationEntryDialogLocalProps) {
        super(props);
        this.state = {
            languageAutoCompleteValue: this.getLanguageName(),
            languageSkill: this.props.languageSkill,
        };
    }

    private static renderSingleDropDownElement(languageLevel: string, idx: number) {
        return (<MenuItem value={languageLevel}
                          key={languageLevel}>{PowerLocalize.langLevelToLocalizedString(languageLevel)}</MenuItem>);
    }

    private getLanguageName = () => {
        let id: string = this.props.languageSkill.languageId();
        return id == null ? '' : this.props.languages.get(id).name();
    };


    private closeDialog = () => {
        this.props.onClose();
    };


    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     */
    private handleLanguageFieldInput = (searchText: string) => {
        this.setState({languageAutoCompleteValue: searchText});
    };

    private handleLanguageFieldRequest = (chosenRequest: any) => {
        this.setState({languageAutoCompleteValue: chosenRequest});
    };

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };


    private handleSaveButtonPress = () => {
        let name: string = this.state.languageAutoCompleteValue;
        let language: NameEntity = ProfileStore.findNameEntityByName(name, this.props.languages);
        let languageSkill: LanguageSkill = this.state.languageSkill;
        if (isNullOrUndefined(language)) {
            language = NameEntity.createNew(name);
        }
        languageSkill = languageSkill.languageId(language.id());
        this.props.onSave(languageSkill, language);
        this.closeDialog();
    };

    private handleLevelChange = (event) => {
        let value: string = event.target.value;
        let skill: LanguageSkill = this.state.languageSkill;
        skill = skill.level(value);
        this.setState({
            languageSkill: skill
        });
    };


    render() {
        return (
            <Dialog
                open={this.props.open}
                fullWidth
                onClose={this.closeDialog}
                scroll={'paper'}
                title={PowerLocalize.get('LanguageSkill.EditSkill.Title')}
            >
                <DialogTitle>
                    <Typography>{PowerLocalize.get('LanguageSkill.EditSkill.Title')}</Typography>
                </DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                            <FormControl>
                                <InputLabel>{PowerLocalize.get('LanguageLevel.Singular')}</InputLabel>
                                <Select
                                    id={"LangSkill.Dialog.Level"}
                                    value={this.state.languageSkill.level()}
                                    onChange={this.handleLevelChange}
                                >
                                    {
                                        this.props.languageLevels.map(LanguageSkillDialog.renderSingleDropDownElement)
                                    }
                                </Select>
                            </FormControl>
                        </div>
                        <div style={{marginTop: '30px'}}>
                            <AutoSuggest
                                label={PowerLocalize.get('Language.Singular')}
                                id={'LangSkill.Dialog.Autocomplete.' + this.props.languageSkill.id()}
                                data={this.props.languages.map(NameEntityUtil.mapToName).toArray()}
                                searchTerm={this.state.languageAutoCompleteValue}
                                onSelect={this.handleLanguageFieldRequest}
                                closeOnSelect={true}
                                onSearchChange={this.handleLanguageFieldInput}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <PwrIconButton iconName={"save"} tooltip={PowerLocalize.get('Action.Save')} onClick={this.handleSaveButtonPress}/>
                    <PwrIconButton iconName={"close"} tooltip={PowerLocalize.get('Action.Exit')} onClick={this.handleCloseButtonPress}/>
                </DialogActions>
            </Dialog>
        );
    }
}

