import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, DateFieldType, ProfileElementType} from '../../../../Store';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {Qualification} from '../../../../model/Qualification';
import {QualificationEntry} from '../../../../model/QualificationEntry';
import {SingleQualificationEntry} from './qualification-entry_module';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';
import * as Immutable from 'immutable';
import {TouchTapEvent} from 'material-ui';

interface QualificationProps {
    qualificationEntries: Immutable.Map<number, QualificationEntry>;
    qualifications: Immutable.Map<number,Qualification>;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface QualificationLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface QualificationLocalState {

}

interface QualificationDispatch {
    onDateChange(newDate: Date, id: number): void;
    onQualificationChange(newQualificationId: number, entryId: number): void;

}

class QualificationModule extends React.Component<QualificationProps & QualificationProps & QualificationDispatch, QualificationLocalState> {

    private static renderHeader() {
        return (
            <tr>
                <th>{PowerLocalize.get('Date.Singular')}</th>
                <th>{PowerLocalize.get('Qualification.Plural')}</th>
            </tr>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: QualificationLocalProps) : QualificationProps {
        return {
            qualificationEntries : state.databaseReducer.profile.qualificationEntries,
            qualifications: state.databaseReducer.qualifications
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : QualificationDispatch {
        return {
            onDateChange: function(newDate, id: number) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.QualificationDate));
            },
            onQualificationChange: function(newQualificationId: number, entryId: number) {
                dispatch(ProfileActionCreator.changeItemId(newQualificationId, entryId, ProfileElementType.QualificationEntry));
            }
        };
    }

    private handleAddElement = (event: TouchTapEvent) => {
        //TODO implement

    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Qualification.Plural')}
                subtitleCountedName={PowerLocalize.get('Qualification.Plural')}
                tableHeader={QualificationModule.renderHeader()}
                onAddElement={this.handleAddElement}
            >
                {this.props.qualificationEntries.map((q, key) => {
                    return (
                        <SingleQualificationEntry
                            key={'Qualification.SingleEntry.' + key}
                            qualificationEntry={q}
                            qualifications={this.props.qualifications}
                            onDateChange={this.props.onDateChange}
                            onQualificationChange={this.props.onQualificationChange}
                        />
                    );
                }).toArray()}
            </ProfileElement>
        );
    }
}

export const Qualifications: React.ComponentClass<QualificationLocalProps> = connect(QualificationModule.mapStateToProps, QualificationModule.mapDispatchToProps)(QualificationModule);