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

    private countChildCategories = (category: SkillCategory) => {
        let count = 1;
        category.categories().forEach(child => {
            count += this.countChildCategories(child);
        });
        return count;
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
            {this.countChildCategories(this.props.category)} child categories?
        </Dialog>);
    }
}
