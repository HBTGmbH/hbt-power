import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../../Store';
import {DatePicker, TextField} from 'material-ui';
import {ProfileElement} from '../profile-element_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {Qualification} from '../../../model/Qualification';
import {QualificationEntry} from '../../../model/QualificationEntry';

interface QualificationProps {
    qualification: Array<QualificationEntry>;
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

    private static renderSingleQualification(qualification: QualificationEntry, index: number) {
        return (
        <tr  key={'qualification.' + index}>
            <td>
                <DatePicker id={'Qualification.DatePicker.' + index } container="inline"  value={qualification.date}/>
            </td>
            <td>
                <TextField id={'Qualification.TextField.' + index } value={qualification.qualification.name} fullWidth={true} disabled={true}/>
            </td>
        </tr>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: QualificationLocalProps) : QualificationProps {
        return {
            qualification : state.singleProfile.profile.qualification
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : QualificationDispatch {
        return {

        };
    }

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Qualification.Plural')}
                subtitleCountedName={PowerLocalize.get('Qualification.Plural')}
                tableHeader={QualificationModule.renderHeader()}
            >
                {this.props.qualification.map(QualificationModule.renderSingleQualification)}
            </ProfileElement>
        );
    }
}

export const Qualifications: React.ComponentClass<QualificationLocalProps> = connect(QualificationModule.mapStateToProps, QualificationModule.mapDispatchToProps)(QualificationModule);