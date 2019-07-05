///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {Dialog, MenuItem, Select} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {LanguageSkill} from '../../../../../model/LanguageSkill';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import FormControl from '@material-ui/core/FormControl/FormControl';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import {NameEntity, newNameEntity} from '../../../../../reducers/profile-new/model/NameEntity';
import {NameEntityType} from '../../../../../reducers/profile-new/model/NameEntityType';


interface LanguageDialogLocalProps {
    languageName: string;
    languageLevel: string;
    availableLanguages: Array<string>;
    availableLevels: Array<string>;
    open: boolean;

    onSave(languageName: NameEntity, languageLevel: string): void;

    onClose(): void;
}

interface LanguageDialogLocalState {
    currentLanguageName: string;
    currentLanguageLevel: string;
}


export class LanguageSkillDialog extends React.Component<LanguageDialogLocalProps, LanguageDialogLocalState> {

    constructor(props: LanguageDialogLocalProps) {
        super(props);
        this.state = {
            currentLanguageName: props.languageName,
            currentLanguageLevel: props.languageLevel
        };
    }

    private static renderSingleDropDownElement(languageLevel: string, idx: number) {
        return (<MenuItem value={languageLevel}
                          key={languageLevel}>{PowerLocalize.langLevelToLocalizedString(languageLevel)}</MenuItem>);
    }

    private closeDialog = () => {
        this.props.onClose();
    };


    /**
     * Handles update of the auto complete components input field.
     * @param searchText the text that had been typed into the autocomplete
     */
    private handleLanguageFieldInput = (searchText: string) => {
        this.setState({currentLanguageName: searchText});
    };

    private handleLanguageFieldRequest = (chosenRequest: any) => {
        this.setState({currentLanguageName: chosenRequest});
    };

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };


    private handleSaveButtonPress = () => {
        this.props.onSave(newNameEntity(null, this.state.currentLanguageName, NameEntityType.LANGUAGE), this.state.currentLanguageLevel);
        this.closeDialog();
    };

    private handleLevelChange = (event) => {
        this.setState({
            currentLanguageLevel: event.target.value
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
                id="LanguageSkill.Dialog"
                aria-labelledby="LanguageSkill.Dialog.Title"
            >
                <DialogTitle
                    id="LanguageSkill.Dialog.Title">{PowerLocalize.get('LanguageSkill.EditSkill.Title')}</DialogTitle>
                <DialogContent>
                    <div className="row">
                        <div className="col-md-5">
                            <FormControl>
                                <InputLabel>{PowerLocalize.get('LanguageLevel.Singular')}</InputLabel>
                                <Select
                                    id={'LangSkill.Dialog.Level'}
                                    value={this.state.currentLanguageLevel}
                                    onChange={this.handleLevelChange}

                                >
                                    {
                                        this.props.availableLevels.map(LanguageSkillDialog.renderSingleDropDownElement)
                                    }
                                </Select>
                            </FormControl>
                        </div>
                        <div className="col-md-5">
                            <PwrAutoComplete
                                label={PowerLocalize.get('Language.Singular')}
                                id={'Language.Dialog.AutoComplete.Language'}
                                data={this.props.availableLanguages}
                                searchTerm={this.state.currentLanguageName}
                                onSearchChange={this.handleLanguageFieldInput}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <PwrIconButton id="Language.Dialog.Save" iconName={'save'}
                                   tooltip={PowerLocalize.get('Action.Save')}
                                   onClick={this.handleSaveButtonPress}/>
                    <PwrIconButton id="Language.Dialog.Close" iconName={'close'}
                                   tooltip={PowerLocalize.get('Action.Exit')}
                                   onClick={this.handleCloseButtonPress}/>
                </DialogActions>
            </Dialog>
        );
    }
}

