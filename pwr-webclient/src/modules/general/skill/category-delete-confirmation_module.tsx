import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {Dialog, DialogContent, DialogContentText, DialogTitle} from '@material-ui/core';
import {PwrConfirmActions} from '../pwr-form-actions';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';

interface CategoryDeleteConfirmationProps {
    category: SkillCategory;
    open: boolean;

    onAcceptDelete?(): void;

    onDeclineDelete?(): void;
}


export class CategoryDeleteConfirmation extends React.Component<CategoryDeleteConfirmationProps, {}> {

    public static defaultProps: Partial<CategoryDeleteConfirmationProps> = {
        onAcceptDelete: () => {
        },
        onDeclineDelete: () => {
        }
    };

    render() {
        return (
            <Dialog open={this.props.open} onClose={this.props.onDeclineDelete}>
                <DialogTitle>{PowerLocalize.get('CategoryDelete.Title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {PowerLocalize.getFormatted('CategoryDelete.Content', this.props.category.qualifier)}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <PwrConfirmActions destructive confirmText={PowerLocalize.get('Action.Delete')}
                                       onConfirm={this.props.onAcceptDelete} onReject={this.props.onDeclineDelete}/>
                </DialogActions>
            </Dialog>);
    }
}
