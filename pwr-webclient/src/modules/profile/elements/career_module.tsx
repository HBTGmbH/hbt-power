
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../../Store';
import {CardHeader, CardMedia, DatePicker, List, TableHeader, TableHeaderColumn} from 'material-ui';
import {Card, Divider, TextField, TableRow, TableRowColumn} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ProfileElement} from '../profile-element_module';
import {CareerElement} from '../../../model/CareerElement';
import {CareerPosition} from '../../../model/CareerPosition';

interface CareerProps {
    /**
     * Associative array that maps an id(number) to a CareerElement
     */
    careerById: Array<CareerElement>;
    /**
     * Associative array that maps an id(number) to a CareerPosition
     */
    careerPositionsById: Array<CareerPosition>;
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

    private renderSingleStep = (careerElement: CareerElement, index:number) => {
        console.log("index:" + index, careerElement);
        return (
            <tr key={'Career.' + index} >
                <td>
                    <DatePicker id={'C.DatePick.Start' + index} container="inline"  value={careerElement.startDate}/>
                </td>
                <td>
                    <DatePicker id={'C.DatePick.End' + index} container="inline"  value={careerElement.endDate}/>
                </td>
                <td>
                    <TextField id={'Career.TextField.' + index}
                               value={this.props.careerPositionsById[careerElement.careerPositionId].position}
                               disabled={true}
                    />
                </td>
            </tr>
        );
    };

    private static renderHeader() : JSX.Element {
        return (
            <tr>
                <th>{PowerLocalize.get("CareerModule.StartDate")}</th>
                <th>{PowerLocalize.get("CareerModule.EndDate")}</th>
                <th>{PowerLocalize.get("Qualifier.Singular")}</th>
            </tr>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: CareerLocalProps) : CareerProps {
        return {
            careerById: state.databaseReducer.careerById,
            careerPositionsById: state.databaseReducer.careerPositionsById
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
                {this.props.careerById.map(this.renderSingleStep)}
            </ProfileElement>
        );
    }
}

export const Career: React.ComponentClass<CareerLocalProps> = connect(CareerModule.mapStateToProps, CareerModule.mapDispatchToProps)(CareerModule);