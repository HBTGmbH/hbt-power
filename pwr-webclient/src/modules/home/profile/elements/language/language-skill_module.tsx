/**
 *
 */
import * as React from 'react';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {LanguageSkillDialog} from './language-skill-dialog_module';
import {PwrIconButton} from '../../../../general/pwr-icon-button';

interface SingleLanguageState {
    dialogOpen: boolean;
}

interface SingleLanguageProps {

    language: string;
    level: string;
    id: string;
    availableLanguages: Array<string>;
    availableLevels: Array<string>;
    onDelete(): void;
    onSave(languageName: string, languageSkill: string): void;
}

export class SingleLanguage extends React.Component<SingleLanguageProps, SingleLanguageState> {

    constructor(props: SingleLanguageProps) {
        super(props);
        this.state = {
            dialogOpen: false
        };
    }

    private handleDeleteButtonPress = () => {
        this.props.onDelete();
    };

    private handleSaveRequest = (languageName: string, languageLevel: string) => {
        this.props.onSave(languageName, languageLevel);
        this.closeDialog();
    };

    private setDialogOpen(open: boolean) {
        this.setState({dialogOpen: open});
    }

    private closeDialog = () => {
        this.setDialogOpen(false);
    };

    private openDialog = () => {
        this.setDialogOpen(true);
    };

    render() {
        return (
            <tr>
                <td>
                    <PwrIconButton iconName={'edit'} tooltip={PowerLocalize.get('Action.Edit')}
                                   onClick={this.openDialog}/>
                    <PwrIconButton iconName={'delete'} tooltip={PowerLocalize.get('Action.Delete')} isDeleteButton
                                   onClick={this.props.onDelete}/>
                    <LanguageSkillDialog
                        languageLevel={this.props.level}
                        languageName={this.props.language}
                        availableLanguages={this.props.availableLanguages}
                        availableLevels={this.props.availableLevels}
                        onSave={this.handleSaveRequest}
                        onClose={this.closeDialog}
                        open={this.state.dialogOpen}
                    />
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.openDialog}>
                        {PowerLocalize.langLevelToLocalizedString(this.props.level)}
                    </div>
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.openDialog}>
                        {this.props.language}
                    </div>
                </td>
            </tr>
        );
    }
}
