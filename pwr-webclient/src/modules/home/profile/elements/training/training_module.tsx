import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ProfileElementType} from '../../../../../Store';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {ProfileElement} from '../../profile-element_module';
import {TrainingEntry} from '../../../../../model/TrainingEntry';
import {SingleTrainingEntry} from './training-entry_module';
import * as Immutable from 'immutable';
import {NameEntity} from '../../../../../model/NameEntity';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {ApplicationState} from '../../../../../reducers/reducerIndex';

interface TrainingEntriesProps {
    trainingEntries: Immutable.Map<string, TrainingEntry>;
    trainings: Immutable.Map<string, NameEntity>;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for display, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface TrainingEntriesLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface TrainingEntriesState {

}

interface TrainingEntryDispatch {
    saveTrainingEntry(trainingEntry: TrainingEntry, training: NameEntity): void;

    removeCareerElement(id: string): void;

    addCareerElement(): void;

}

class TrainingEntriesModule extends React.Component<TrainingEntriesProps & TrainingEntriesLocalProps & TrainingEntryDispatch, TrainingEntriesState> {

    private static renderHeader(): JSX.Element {
        return (
            <td>TODO</td>
        );
    }


    static mapStateToProps(state: ApplicationState, localProps: TrainingEntriesProps): TrainingEntriesProps {
        return {
            trainingEntries: state.databaseReducer.profile().trainingEntries(),
            trainings: state.databaseReducer.trainings(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): TrainingEntryDispatch {
        return {
            saveTrainingEntry: function (trainingEntry: TrainingEntry, training: NameEntity) {
                dispatch(ProfileActionCreator.saveEntry(trainingEntry, training, ProfileElementType.TrainingEntry));
            },
            removeCareerElement: function (id: string) {
                dispatch(ProfileActionCreator.deleteEntry(id, ProfileElementType.TrainingEntry));
            },
            addCareerElement: function () {
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.TrainingEntry));
            }
        };
    }


    private handleAddElement = () => {
        this.props.addCareerElement();
    };

    render() {
        return (
            <ProfileElement
                title={PowerLocalize.get('TrainingEntries.Qualifier')}
                subtitle={PowerLocalize.get('TrainingEntry.Description')}
                onAddElement={this.handleAddElement}
            >
                {
                    this.props.trainingEntries.map((value, key, index) => {
                        return (
                            <SingleTrainingEntry
                                key={'TrainingEntry.' + key}
                                trainingEntry={value}
                                trainings={this.props.trainings}
                                onDelete={this.props.removeCareerElement}
                                onSave={this.props.saveTrainingEntry}
                            />
                        );
                    }).toArray()
                }
            </ProfileElement>

        );
    }
}

export const TrainingEntries: React.ComponentClass<TrainingEntriesLocalProps> = connect(TrainingEntriesModule.mapStateToProps, TrainingEntriesModule.mapDispatchToProps)(TrainingEntriesModule);