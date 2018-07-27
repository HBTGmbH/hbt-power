import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {Dialog, Button} from '@material-ui/core';
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
        onAcceptDelete: () => {},
        onDeclineDelete: () => {}
    };

    render() {
        return (
        <Dialog
            open={this.props.open}
            //modal={true}
        >
            Do you really want to delete <strong>{this.props.category.qualifier()}</strong> including its
            child categories?

            <DialogActions>
                <Button
                    variant={'flat'}
                    color={'primary'}
                    onClick={this.props.onDeclineDelete}
                >{PowerLocalize.get("Action.No")}</Button>,
                <Button
                    variant={'flat'}
                    color={'secondary'}
                    onClick={this.props.onAcceptDelete}
                >{PowerLocalize.get("Action.Yes")}</Button>
            </DialogActions>
        </Dialog>);
    }
}
