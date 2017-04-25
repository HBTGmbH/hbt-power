import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, DateFieldType} from '../../../../Store';
import {DatePicker, TextField} from 'material-ui';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {ProfileElement} from '../../profile-element_module';
import {EducationEntry} from '../../../../model/EducationEntry';
import {Education} from '../../../../model/Education';
import {SingleEducationElement} from './education-entry_module';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';

interface EducationProps {
    /**
     * Associative Array of education entries. number => EducationEntry
     */
    educationEntriesById: Array<EducationEntry>;

    educationById: Array<Education>;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface EducationLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface EducationLocalState {

}

interface EducationDispatch {
    onDateChange(newDate: Date, id: number): void;
}

class EducationModule extends React.Component<EducationProps & EducationLocalProps & EducationDispatch, EducationLocalState> {

    private static renderHeader() {
        return (
            <tr>
                <th>Datum</th>
                <th>Bezeichner</th>
            </tr>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: EducationLocalProps) : EducationProps {
        return {
            educationEntriesById : state.databaseReducer.educationEntriesById,
            educationById: state.databaseReducer.educationById
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : EducationDispatch {
        return {
            onDateChange: function(newDate: Date, id: number) {
                dispatch(ProfileActionCreator.changeDateField(id, newDate, DateFieldType.EducationDate));
            }
        };
    }

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Education.Singular')}
                subtitleCountedName={PowerLocalize.get('EducationStep.Plural')}
                tableHeader={EducationModule.renderHeader()}
            >
                {this.props.educationEntriesById.map((e, index) => {
                    return(
                    <SingleEducationElement
                        key={"SingleEducationElement." + index}
                        educationEntry={e}
                        educationsById={this.props.educationById}
                        onDateChange={this.props.onDateChange}
                    />);
                })}
            </ProfileElement>
        );
    }
}

export const EducationList: React.ComponentClass<EducationLocalProps> = connect(EducationModule.mapStateToProps, EducationModule.mapDispatchToProps)(EducationModule);