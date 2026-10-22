import * as React from 'react';
import {Dialog} from '@material-ui/core';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PwrFormSection, PwrRow} from '../../general/pwr-form-section';
import Fab from '@material-ui/core/Fab/Fab';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../model/PwrConstants';
import {LocalizationSelect} from './localization-select_module';


interface ViewProfileDialogProps {
    open: boolean;
    viewProfile?: ViewProfile;
    type?: 'edit' | 'new';

    onClose(): void;

    /** The language only when creating (#174); a view profile changes it on its page */
    onSave?(name: string, description: string, charsPerLine: number, localization: string | null): void;
}

interface ViewProfileDialogState {
    name: string;
    description: string;
    charsPerLine: number;
    localization: string | null;
}

export class ViewProfileDialog extends React.Component<ViewProfileDialogProps, ViewProfileDialogState> {

    public static defaultProps: Partial<ViewProfileDialogProps> = {
        type: 'edit'
    };

    constructor(props: ViewProfileDialogProps) {
        super(props);
        this.state = this.initialState(props);
    }

    private initialState = (props: ViewProfileDialogProps): ViewProfileDialogState => {
        return {
            name: !(props.viewProfile) || !(props.viewProfile.viewProfileInfo.name) ? '' : props.viewProfile.viewProfileInfo.name,
            description: !(props.viewProfile) || !(props.viewProfile.viewProfileInfo.viewDescription) ? '' : props.viewProfile.viewProfileInfo.viewDescription,
            charsPerLine: !(props.viewProfile) || !(props.viewProfile.viewProfileInfo.charsPerLine) ? 45 : props.viewProfile.viewProfileInfo.charsPerLine,
            localization: !(props.viewProfile) ? null : props.viewProfile.localization
        };
    };

    private setField = (field: string, value: any) => {
        let obj = {};
        obj[field] = value;
        this.setState(obj);
    };

    private changeName = (e: any, name: string) => {
        this.setField('name', name);
    };

    private changeDescription = (e: any, description: string) => {
        this.setField('description', description);
    };

    private changeCharsPerLine = (charsPerLine: number) => {
        this.setField('charsPerLine', charsPerLine);
    };

    private changeLocalization = (localization: string | null) => {
        this.setField('localization', localization);
    };

    private closeAndReset = () => {
        this.setState(this.initialState(this.props));
        this.props.onClose();
    };

    private closeAndSave = () => {
        if (!!(this.props.onSave)) {
            this.props.onSave(this.state.name, this.state.description, this.state.charsPerLine, this.state.localization);
        }
        if (this.props.type !== 'edit') {
            // The next view profile starts empty again
            this.setState(this.initialState(this.props));
        }
    };

    private renderTitle = () => {
        if (this.props.type === 'edit') {
            return PowerLocalize.get('ViewProfileDialog.Title.Edit');
        } else {
            return PowerLocalize.get('ViewProfileDialog.Title.Create');
        }
    };

    render() {
        return <Dialog
            title={this.renderTitle()}
            open={this.props.open}
            onClose={this.closeAndReset}
            fullWidth
        >
            <DialogTitle>{this.renderTitle()}</DialogTitle>
            <DialogContent>
                <LimitedTextField onChange={this.changeName}
                                  maxCharacters={250}
                                  value={this.state.name}
                                  fullWidth={true}
                                  label={PowerLocalize.get('ViewProfileDialog.Name')}
                />
                <PwrSpacer/>
                <LimitedTextField onChange={this.changeDescription}
                                  maxCharacters={PROFILE_DESCRIPTION_LENGTH}
                                  value={this.state.description}
                                  fullWidth={true}
                                  multiLine={true}
                                  rows={4}
                                  label={PowerLocalize.get('ViewProfileDialog.Description')}
                />
                {this.props.type !== 'edit' && <>
                    <PwrSpacer/>
                    <LocalizationSelect value={this.state.localization} onChange={this.changeLocalization}
                                        className="pwr-view-localization-select"/>
                </>}
                <PwrFormSection title={PowerLocalize.get('ViewProfileDialog.CharsPerLine')}>
                    <PwrRow>
                        <Fab
                            size={'small'}
                            color={'primary'}
                            onClick={() => this.changeCharsPerLine((this.state.charsPerLine > 0) ? (this.state.charsPerLine - 1) : 0)}
                        >
                            <RemoveIcon/>

                        </Fab>
                        {this.state.charsPerLine}
                        <Fab
                            size={'small'}
                            color={'primary'}
                            onClick={() => this.changeCharsPerLine((this.state.charsPerLine < 100) ? (this.state.charsPerLine + 1) : 100)}
                        >
                            <AddIcon/>
                        </Fab>
                    </PwrRow>
                </PwrFormSection>
            </DialogContent>
            <DialogActions>
                {/* The same button bar as the forms (#41) */}
                <PwrFormActions editing noSpace
                                saveText={PowerLocalize.get(this.props.type === 'edit' ? 'Action.Save' : 'Action.Create')}
                                saveIcon={this.props.type === 'edit' ? 'save' : 'add'}
                                onSave={this.closeAndSave}
                                onCancel={this.closeAndReset}/>
            </DialogActions>
        </Dialog>;
    }
}
