import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, CareerStep, EducationStep} from '../../Store';
import {Card, List, CardMedia, CardHeader, Divider, DatePicker, TextField} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';

interface EducationProps {
    education: Array<EducationStep>;
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

}

class EducationModule extends React.Component<EducationProps & EducationLocalProps & EducationDispatch, EducationLocalState> {

    private static renderSingleEducationStep(step: EducationStep, index: number) {
        return (
            <div className="row" key={"EducationModule." + index} >
                <div className="col-md-3">
                    Datum: <DatePicker container="inline"  value={step.date}/>
                </div>
                <div className="col-md-6">
                    Bezeichner: <TextField value={step.name} fullWidth={true} disabled={true}/>
                </div>
            </div>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: EducationLocalProps) : EducationProps {
        return {
            education : state.singleProfile.profile.education
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : EducationDispatch {
        return {

        };
    }

    render() {
        return(
            <Card>
                <CardHeader actAsExpander={true}
                            title={PowerLocalize.get("Education.Singular")}
                            subtitle={this.props.education.length + ' ' + PowerLocalize.get("EducationStep.Plural")}
                >
                </CardHeader>
                <Divider/>
                <CardMedia expandable={true}>
                    <div className="row">
                        <div className="col-md-1"/>
                        <div className="col-md-10">
                            <List>
                                {this.props.education.map(EducationModule.renderSingleEducationStep)}
                            </List>
                        </div>
                        <div className="col-md-1"/>
                    </div>
                </CardMedia>
            </Card>
        );
    }
}

export const Education: React.ComponentClass<EducationLocalProps> = connect(EducationModule.mapStateToProps, EducationModule.mapDispatchToProps)(EducationModule);