import * as React from 'react';
import {IconButton} from 'material-ui';
import * as Immutable from 'immutable';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../utils/DateUtil';
import {TrainingEntry} from '../../../../model/TrainingEntry';
import {NameEntity} from '../../../../model/NameEntity';
import {TrainingEntryDialog} from './training-entry-dialog_module';
import {NameEntityUtil} from '../../../../utils/NameEntityUtil';

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface TrainingEntryLocalProps {
    /**
     * The element that is rendered in this module.
     */
    trainingEntry: TrainingEntry;

    /**
     * Array of possible {@link Training} by their ID.
     */
    trainings: Immutable.Map<string, NameEntity>;


    /**
     * Callback given to this module to be called whenever the delete button is being pressed.
     * @param elementId the {@link TrainingEntry.id} of the element associated with this module.
     */
    onDelete(elementId: string): void;

    onSave(trainignEntry: TrainingEntry, training: NameEntity): void;
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface TrainingEntryState {
    dialogOpen: boolean;
}


/**
 * Represents a single {@link TrainingEntry> while providing ways to edit:
 * - the start date
 * - the end date
 * - the career name associated with the element by changing the ID.
 *
 * Dates may be changed at any time by usage of the date picker, which already provides a way to avoid unwanted modifications.
 *
 * The {@link Training} may be changing after pressing the edit symbol. Only one of the available {@link Training} may
 * be used as a replacement for an existing name.
 * If an invalid string is entered in the input field, and the input is finalized by pressing enter or disabling the edit mode,
 * the input fields value will hop back to the original value, and the input field will be disabled.
 * If a valid value is selected through all available means, the input field will be disabled and the value used as new
 * {@link Training}
 */
export class SingleTrainingEntry extends React.Component<TrainingEntryLocalProps, TrainingEntryState> {

    constructor(props: TrainingEntryLocalProps) {
        super(props);
        // only show the date picker when there is a date.
        let showDatePicker = props.trainingEntry.endDate != null;
        this.state = {
            dialogOpen: false
        };
    }


    /**
     * Null-tolerant accessor to the {@link Training.name} field of the career name
     * that is linked in {@link TrainingEntry.trainingId}
     * @returns the name or an empty string when no name exists.
     */
    private getTrainingName = () => {
        return NameEntityUtil.getNullTolerantName(this.props.trainingEntry.trainingId(), this.props.trainings);
    };


    private handleClickTapField = () => {
        this.setState({
            dialogOpen: true
        })
    };

    private handleEditButtonClick = () => {
        this.setState({
            dialogOpen: true
        });
    };

    private handleDeleteButtonClick = () => {
        this.props.onDelete(this.props.trainingEntry.id());
    };

    private handleSaveRequest = (entry: TrainingEntry, name: NameEntity) => {
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
                    <IconButton size={20} iconClassName="material-icons" onClick={this.handleEditButtonClick} tooltip={PowerLocalize.get('Action.Edit')}>edit</IconButton>
                    <IconButton size={20} iconClassName="material-icons" onClick={this.handleDeleteButtonClick} tooltip={PowerLocalize.get('Action.Delete')}>delete</IconButton>
                    <TrainingEntryDialog
                        trainingEntry={this.props.trainingEntry}
                        trainings={this.props.trainings}
                        open={this.state.dialogOpen}
                        onSave={this.handleSaveRequest}
                        onClose={this.handleCloseRequest}
                    />
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleClickTapField}>
                    {formatToShortDisplay(this.props.trainingEntry.startDate())}
                    </div>
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleClickTapField}>
                    {formatToShortDisplay(this.props.trainingEntry.endDate())}
                    </div>
                </td>
                <td>
                    <div className="fittingContainer" onClick={this.handleClickTapField}>
                    {this.getTrainingName()}
                    </div>
                </td>
            </tr>
        );
    }
}
