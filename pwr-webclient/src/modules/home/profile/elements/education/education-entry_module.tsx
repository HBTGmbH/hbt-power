import * as React from 'react';
import {IconButton, TouchTapEvent} from 'material-ui';
import {EducationEntry} from '../../../../../model/EducationEntry';
import * as Immutable from 'immutable';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {formatToShortDisplay, formatToYear} from '../../../../../utils/DateUtil';
import {NameEntity} from '../../../../../model/NameEntity';
import {EducationEntryDialogModule} from './education-entry-dialog_module';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {isNullOrUndefined} from 'util';


/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface EducationEntryLocalProps {
    /**
     * The element that is rendered in this module.
     */
    educationEntry: EducationEntry;

    /**
     * All possible educations by their ids.
     */
    educations: Immutable.Map<string, NameEntity>;

    degrees: Immutable.List<string>;

    /**
     * Invoked when the {@link EducationEntry} associated with this module is supposed to be deleted.
     * @param id {@link EducationEntry.id} of the entry that is supposed to be deleted.
     */
    onDelete(id: string): void;

    onSave(entry: EducationEntry, nameEntity: NameEntity): void;

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface EducationEntryState {
    dialogOpen: boolean;
}


export class SingleEducationElement extends React.Component<EducationEntryLocalProps, EducationEntryState> {

    constructor(props: EducationEntryLocalProps) {
        super(props);
        this.state = {
            dialogOpen: false
        }
    }


    private getEducationEntryName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.educationEntry.nameEntityId(), this.props.educations);
    };



    private handleFieldTouchClick = (event: TouchTapEvent) => {
        this.setState({
            dialogOpen: true
        });
    };

    private handleEditButtonPress = (event: TouchTapEvent) => {
        this.setState({
            dialogOpen: true
        });
    };

    private closeDialog = () => {
        this.setState({
            dialogOpen: false
        });
    };

    private handleSaveRequest = (entry: EducationEntry, name: NameEntity) => {
        this.closeDialog();
        this.props.onSave(entry, name);
    };

    private handleDeleteButtonPress = (event: TouchTapEvent) => {
        this.props.onDelete(this.props.educationEntry.id());
    };



    render() {
        return(
            <tr>
                <td>
                    <IconButton size={20} iconClassName="material-icons" onClick={this.handleEditButtonPress} tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                    <IconButton size={20} iconClassName="material-icons" onClick={this.handleDeleteButtonPress} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                    <EducationEntryDialogModule
                        open={this.state.dialogOpen}
                        educationEntry={this.props.educationEntry}
                        educations={this.props.educations}
                        degrees={this.props.degrees}
                        onClose={this.closeDialog}
                        onSave={this.handleSaveRequest}
                    />
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleFieldTouchClick}>
                        {formatToYear(this.props.educationEntry.startDate())}
                    </div>
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleFieldTouchClick}>
                    {formatToYear(this.props.educationEntry.endDate())}
                    </div>
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleFieldTouchClick}>
                    {isNullOrUndefined(this.props.educationEntry.degree()) ? "---": this.props.educationEntry.degree()}
                    </div>
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleFieldTouchClick}>
                    {this.getEducationEntryName()}
                    </div>
                </td>
            </tr>
        );
    }
}
