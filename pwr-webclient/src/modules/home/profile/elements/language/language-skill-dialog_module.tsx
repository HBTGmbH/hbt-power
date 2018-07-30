///<reference path="../../../../../../node_modules/immutable/dist/immutable.d.ts"/>
import * as React from 'react';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {Dialog, IconButton, MenuItem, Select} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {NameEntity} from '../../../../../model/NameEntity';
import * as Immutable from 'immutable';
import {LanguageSkill} from '../../../../../model/LanguageSkill';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import FormControl from '@material-ui/core/FormControl/FormControl';
import InputLabel from '@material-ui/core/InputLabel/InputLabel';
import TextField from '@material-ui/core/TextField/TextField';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import Popover from '@material-ui/core/Popover/Popover';



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
        return (<MenuItem value={languageLevel} key={languageLevel}>{PowerLocalize.langLevelToLocalizedString(languageLevel)}</MenuItem>);
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
     * @param dataSource useless
     */
    private handleLanguageFieldInput = (searchText: string, dataSource: Array<string>) => {
        this.setState({languageAutoCompleteValue: searchText});
    };

    private handleLanguageFieldRequest = (chosenRequest: any, index: number) => {
        this.setState({languageAutoCompleteValue: chosenRequest});
    };

    private handleCloseButtonPress = () => {
        this.closeDialog();
    };


    private handleSaveButtonPress = () => {
        let name: string = this.state.languageAutoCompleteValue;
        let language: NameEntity = ProfileStore.findNameEntityByName(name, this.props.languages);
        let languageSkill: LanguageSkill = this.state.languageSkill;
        if(isNullOrUndefined(language)) {
            language = NameEntity.createNew(name);
        }
        languageSkill = languageSkill.languageId(language.id());
        this.props.onSave(languageSkill, language);
        this.closeDialog();
    };

    private handleLevelChange = (ignoredEvent: any, index: number, value: string) => {
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
                //modal={false}
                onClose={this.closeDialog}
                scroll={'paper'}
                title={PowerLocalize.get('LanguageSkill.EditSkill.Title')}
            >
                <DialogTitle>
                    <Typography >{PowerLocalize.get('LanguageSkill.EditSkill.Title')}</Typography>
                </DialogTitle>
                <DialogContent>
                <div className="row">
                    <div //className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0"
                    >
                        <FormControl>
                            <InputLabel>{PowerLocalize.get('LanguageLevel.Singular')}</InputLabel>
                                <Select
                                    value={this.state.languageSkill.level()}
                                    onChange={() => this.handleLevelChange}
                                >
                                {
                                    this.props.languageLevels.map(LanguageSkillDialog.renderSingleDropDownElement)
                                }
                            </Select>
                        </FormControl>
                    </div>
                    {/*TODO <AutoComplete
                            label={PowerLocalize.get('Language.Singular')}
                            id={'LangSkill.Dialog.Autocomplete.' + this.props.languageSkill.id()}
                            value={this.state.languageAutoCompleteValue}
                            searchText={this.state.languageAutoCompleteValue}
                            dataSource={this.props.languages.map(NameEntityUtil.mapToName).toArray()}
                            onUpdateInput={this.handleLanguageFieldInput}
                            onNewRequest={this.handleLanguageFieldRequest}
                            filter={AutoComplete.fuzzyFilter}
                        />*/}
                        <div style={{marginTop:'30px'}}>
                            <TextField
                                id={'LangSkill.Dialog.Autocomplete.' + this.props.languageSkill.id()}
                                label={PowerLocalize.get('Language.Singular')}
                                value={this.state.languageAutoCompleteValue}
                            />
                            <Popover
                                open={this.state.languageAutoCompleteValue !== ""}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'center',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'center',
                                }}

                            >
                                {/* TODO latest autocomplete weiter machen */}
                            </Popover>
                        </div>
                </div>
                </DialogContent>
                <DialogActions>
                    <Tooltip title={PowerLocalize.get('Action.Save')}>
                        <IconButton className="material-icons icon-size-20" onClick={this.handleSaveButtonPress} >save</IconButton>
                    </Tooltip>
                    <Tooltip title={PowerLocalize.get('Action.Exit')}>
                        <IconButton className="material-icons icon-size-20" onClick={this.handleCloseButtonPress}>close</IconButton>
                    </Tooltip>
                </DialogActions>
            </Dialog>
        );
    }
}

