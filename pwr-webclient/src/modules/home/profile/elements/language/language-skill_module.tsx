/**
 *
 */
import * as React from 'react';
import {IconButton} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {LanguageSkill} from '../../../../../model/LanguageSkill';
import * as Immutable from 'immutable';
import {NameEntity} from '../../../../../model/NameEntity';
import {LanguageSkillDialog} from './language-skill-dialog_module';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';

interface SingleLanguageState {
    dialogOpen: boolean;
}

interface SingleLanguageProps {

    onDelete(id: string): void;

    onSave(langSkill: LanguageSkill, language: NameEntity): void;

    languageSkill: LanguageSkill;

    languages: Immutable.Map<string, NameEntity>;

    languageLevels: Array<string>;
}

export class SingleLanguage extends React.Component<SingleLanguageProps, SingleLanguageState> {

    constructor(props: SingleLanguageProps) {
        super(props);
        this.state = {
            dialogOpen: props.languageSkill.isNew()
        }
    }

    private getLanguageName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.languageSkill.languageId(), this.props.languages);
    };


    private handleDeleteButtonPress = () => {
        this.props.onDelete(this.props.languageSkill.id());
    };

    private handleEditButtonPress = () => {
        this.setState({
            dialogOpen: true
        });
    };

    private handleSaveRequest = (langSkill: LanguageSkill, language: NameEntity) => {
        this.props.onSave(langSkill, language);
        this.closeDialog();
    };

    private closeDialog = () => {
        this.setState({
            dialogOpen: false
        });
    };

    private openDialog = () => {
        this.setState({
            dialogOpen: true
        })
    };

    render() {
        return(
        <tr>
            <td>
                <Tooltip title={PowerLocalize.get('Action.Edit')}>
                    <IconButton className="material-icons icon-size-20" onClick={this.handleEditButtonPress}>edit</IconButton>
                </Tooltip>
                <Tooltip title={PowerLocalize.get('Action.Delete')}>
                    <IconButton className="material-icons icon-size-20" onClick={this.handleDeleteButtonPress}>delete</IconButton>
                </Tooltip>

                <LanguageSkillDialog
                    languageSkill={this.props.languageSkill}
                    languages={this.props.languages}
                    languageLevels={this.props.languageLevels}
                    onSave={this.handleSaveRequest}
                    onClose={this.closeDialog}
                    open={this.state.dialogOpen}
                />
            </td>
            <td>
                <div className="fittingContainer" onClick={this.openDialog}>
                    {PowerLocalize.langLevelToLocalizedString(this.props.languageSkill.level())}
                </div>
            </td>
            <td>
                <div className="fittingContainer" onClick={this.openDialog}>
                    {this.getLanguageName()}
                </div>
            </td>
        </tr>
        );
    }
}
