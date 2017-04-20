
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, CareerStep} from '../../Store';
import {CardHeader, CardMedia, DatePicker, List} from 'material-ui';
import {Card, Divider, TextField} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';

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

            <div className="row" key={"Career." + index}>
                <div className="col-md-3">
                    Start: <DatePicker container="inline"  value={careerStep.startDate}/>
                </div>
                <div className="col-md-3">
                    Ende: <DatePicker container="inline"  value={careerStep.endDate}/>
                </div>
                <div className="col-md-6">
                   Bezeichner: <TextField value={careerStep.name}  fullWidth={true} disabled={true}/>
                </div>
            </div>

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
            <Card>
                <CardHeader actAsExpander={true}
                            title={PowerLocalize.get("Career.Qualifier")}
                            subtitle={this.props.career.length + ' ' + PowerLocalize.get("CareerStep.Qualifier")}
                >
                </CardHeader>
                <Divider/>
                <CardMedia expandable={true}>
                    <div className="row">
                        <div className="col-md-1"/>
                        <div className="col-md-10">
                            <List>
                                {this.props.career.map(CareerModule.renderSingleStep)}
                            </List>
                        </div>
                        <div className="col-md-1"/>
                    </div>
                </CardMedia>
            </Card>
        );
    }
}

export const Career: React.ComponentClass<CareerLocalProps> = connect(CareerModule.mapStateToProps, CareerModule.mapDispatchToProps)(CareerModule);