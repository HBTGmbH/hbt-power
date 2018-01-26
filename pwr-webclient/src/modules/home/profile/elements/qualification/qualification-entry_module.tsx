import * as React from 'react';
import {IconButton} from 'material-ui';
import {QualificationEntry} from '../../../../../model/QualificationEntry';
import * as Immutable from 'immutable';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {formatToYear} from '../../../../../utils/DateUtil';
import {NameEntity} from '../../../../../model/NameEntity';
import {QualificationEntryDialog} from './qualification-entry-dialog_module';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';


/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface QualificationEntryLocalProps {
    /**
     * The element that is rendered in this module.
     */
    qualificationEntry: QualificationEntry;

    /**
     * Array of possible educations by their ID.
     */
    qualifications: Immutable.Map<string, NameEntity>;

    /**
     * Callback that is invoked when this modules DatePicker's value changes to a new date.
     * Also gives back the ID to of the {@link EducationEntry} given to this module.
     * @param newDate
     * @param id
     */
    onDelete(qualificationEntryId: string): void;

    onSave(qualificationEntry: QualificationEntry, qualification: NameEntity): void;

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface QualificationEntryState {
    dialogOpen: boolean;
}


export class SingleQualificationEntry extends React.Component<QualificationEntryLocalProps, QualificationEntryState> {


    constructor(props: QualificationEntryLocalProps) {
        super(props);
        this.state = {
            dialogOpen: props.qualificationEntry.isNew()
        };
    }

    private getQualificationName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.qualificationEntry.qualificationId(), this.props.qualifications);
    };

    private handleFieldTouchClick = () => {
        this.setState({
            dialogOpen: true
        });
    };

    private handleDeleteButtonClick = () => {
        this.props.onDelete(this.props.qualificationEntry.id());
    };

    private handleEditButtonClick = () => {
        this.setState({
            dialogOpen: true
        })
    };

    private handleSaveRequest = (entry: QualificationEntry, name: NameEntity) => {
        this.props.onSave(entry, name);
        this.setState({
            dialogOpen: false
        })
    };

    private handleCloseRequest = () => {
        this.setState({
            dialogOpen: false
        });
    };

    render() {
        return(
            <tr>
                <td>
                    <IconButton iconClassName="material-icons icon-size-20" onClick={this.handleEditButtonClick} tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                    <IconButton iconClassName="material-icons icon-size-20" onClick={this.handleDeleteButtonClick} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                    <QualificationEntryDialog
                        qualificationEntry={this.props.qualificationEntry}
                        qualifications={this.props.qualifications}
                        open={this.state.dialogOpen}
                        onSave={this.handleSaveRequest}
                        onClose={this.handleCloseRequest}
                    />
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleFieldTouchClick}>
                    {formatToYear(this.props.qualificationEntry.date())}
                    </div>
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleFieldTouchClick}>
                        {this.getQualificationName()}
                    </div>
                </td>
            </tr>
        );
    }
}
