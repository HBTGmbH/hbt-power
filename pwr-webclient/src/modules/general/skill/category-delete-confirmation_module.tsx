import * as React from 'react';
import {SkillCategory} from '../../../model/skill/SkillCategory';
import {Dialog, FlatButton} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

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
            modal={true}
            actions={[
                <FlatButton
                    primary={true}
                    label={PowerLocalize.get("Action.No")}
                    onClick={this.props.onDeclineDelete}
                />,
                <FlatButton
                    secondary={true}
                    label={PowerLocalize.get("Action.Yes")}
                    onClick={this.props.onAcceptDelete}
                />
            ]}
        >
            Do you really want to delete <strong>{this.props.category.qualifier()}</strong> including its
            child categories?
        </Dialog>);
    }
}
