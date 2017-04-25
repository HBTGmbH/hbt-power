import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, DateFieldType} from '../../../../Store';
import {DatePicker, TextField} from 'material-ui';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {Qualification} from '../../../../model/Qualification';
import {QualificationEntry} from '../../../../model/QualificationEntry';
import {SingleQualificationEntry} from './qualification-entry_module';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';

interface QualificationProps {
    qualificationEntriesById: Array<QualificationEntry>;
    qualificationsById: Array<Qualification>;
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
            qualificationEntriesById : state.databaseReducer.qualificationEntriesById,
            qualificationsById: state.databaseReducer.qualificationById
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : QualificationDispatch {
        return {
            onDateChange: function(newDate, id: number) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.QualificationDate));
            }
        };
    }

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Qualification.Plural')}
                subtitleCountedName={PowerLocalize.get('Qualification.Plural')}
                tableHeader={QualificationModule.renderHeader()}
            >
                {this.props.qualificationEntriesById.map((q, index) => {
                    return (
                        <SingleQualificationEntry
                            qualificationEntry={q}
                            qualificationsById={this.props.qualificationsById}
                            onDateChange={this.props.onDateChange}
                        />
                    )
                })}
            </ProfileElement>
        );
    }
}

export const Qualifications: React.ComponentClass<QualificationLocalProps> = connect(QualificationModule.mapStateToProps, QualificationModule.mapDispatchToProps)(QualificationModule);