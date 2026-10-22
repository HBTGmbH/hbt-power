import * as React from 'react';
import {Dialog} from '@material-ui/core';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../model/PwrConstants';
import {LocalizationSelect} from './localization-select_module';


interface ViewProfileDialogProps {
    open: boolean;

    onClose(): void;

    onSave(name: string, description: string, localization: string | null): void;
}

interface ViewProfileDialogState {
    name: string;
    description: string;
    localization: string | null;
}

const EMPTY: ViewProfileDialogState = {name: '', description: '', localization: null};

/**
 * Creates a view profile: name, note and language (#174). Everything else, including name and note later on, is
 * changed on the page of the view profile (#179).
 */
export class ViewProfileDialog extends React.Component<ViewProfileDialogProps, ViewProfileDialogState> {

    constructor(props: ViewProfileDialogProps) {
        super(props);
        this.state = EMPTY;
    }

    private closeAndReset = () => {
        this.setState(EMPTY);
        this.props.onClose();
    };

    private closeAndSave = () => {
        this.props.onSave(this.state.name, this.state.description, this.state.localization);
        // The next view profile starts empty again
        this.setState(EMPTY);
    };

    render() {
        const title = PowerLocalize.get('ViewProfileDialog.Title.Create');
        return <Dialog
            title={title}
            open={this.props.open}
            onClose={this.closeAndReset}
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <LimitedTextField onChange={(e, name) => this.setState({name})}
                                  maxCharacters={250}
                                  value={this.state.name}
                                  fullWidth={true}
                                  label={PowerLocalize.get('ViewProfileDialog.Name')}
                />
                <PwrSpacer/>
                <LimitedTextField onChange={(e, description) => this.setState({description})}
                                  maxCharacters={PROFILE_DESCRIPTION_LENGTH}
                                  value={this.state.description}
                                  fullWidth={true}
                                  multiLine={true}
                                  rows={4}
                                  label={PowerLocalize.get('ViewProfileDialog.Description')}
                />
                <PwrSpacer/>
                <LocalizationSelect value={this.state.localization} onChange={localization => this.setState({localization})}
                                    className="pwr-view-localization-select"/>
            </DialogContent>
            <DialogActions>
                {/* The same button bar as the forms (#41) */}
                <PwrFormActions editing noSpace
                                saveText={PowerLocalize.get('Action.Create')} saveIcon="add"
                                saveDisabled={!this.state.name.trim()}
                                onSave={this.closeAndSave}
                                onCancel={this.closeAndReset}/>
            </DialogActions>
        </Dialog>;
    }
}
