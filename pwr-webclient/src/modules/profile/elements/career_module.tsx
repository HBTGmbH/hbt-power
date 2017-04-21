
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, CareerStep} from '../../../Store';
import {CardHeader, CardMedia, DatePicker, List, TableHeader, TableHeaderColumn} from 'material-ui';
import {Card, Divider, TextField, TableRow, TableRowColumn} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ProfileElement} from '../profile-element_module';

interface CareerProps {
    career: Array<CareerStep>;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface CareerLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface CareerLocalState {

}

interface CareerDispatch {

}

class CareerModule extends React.Component<CareerProps & CareerLocalProps & CareerDispatch, CareerLocalState> {

    private static renderSingleStep(careerStep: CareerStep, index:number) {
        return (
            <tr key={'Career.' + index} >
                <td>
                    <DatePicker id={'C.DatePick.Start' + index} container="inline"  value={careerStep.startDate}/>
                </td>
                <td>
                    <DatePicker id={'C.DatePick.End' + index} container="inline"  value={careerStep.endDate}/>
                </td>
                <td>
                    <TextField id={'Career.TextField.' + index} value={careerStep.name}  disabled={true}/>
                </td>
            </tr>
        );
    }

    private static renderHeader() : JSX.Element {
        return (
            <tr>
                <th>Start</th>
                <th>Ende</th>
                <th>Bezeichner</th>
            </tr>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: CareerLocalProps) : CareerProps {
        return {
            career: state.singleProfile.profile.career
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : CareerDispatch {
        return {

        };
    }

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Career.Qualifier')}
                subtitleCountedName={PowerLocalize.get('CareerStep.Qualifier')}
                tableHeader={CareerModule.renderHeader()}
            >
                {this.props.career.map(CareerModule.renderSingleStep)}
            </ProfileElement>
        );
    }
}

export const Career: React.ComponentClass<CareerLocalProps> = connect(CareerModule.mapStateToProps, CareerModule.mapDispatchToProps)(CareerModule);