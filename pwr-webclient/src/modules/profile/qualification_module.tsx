import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, Qualification} from '../../Store';
import {Card, CardHeader, CardMedia, Divider, List, DatePicker, TextField} from 'material-ui';

interface QualificationProps {
    qualifications: Array<Qualification>;
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


    private static renderSingleQualification(qualification: Qualification, index: number) {
        return (
        <div className="row">
            <div className="col-md-3">
                Datum: <DatePicker container="inline"  value={qualification.date}/>
            </div>
            <div className="col-md-6">
                Bezeichner: <TextField value={qualification.name} key={index} fullWidth={true} disabled={true}/>
            </div>
        </div>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: QualificationLocalProps) : QualificationProps {
        return {
            qualifications : state.singleProfile.profile.qualifications
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : QualificationDispatch {
        return {

        };
    }

    render() {
        return(
            <Card>
                <CardHeader actAsExpander={true}
                            title="Zusatzqualifikationen"
                            subtitle={this.props.qualifications.length + ' Zusatzqualifikationen'}
                >
                </CardHeader>
                <Divider/>
                <CardMedia expandable={true}>
                    <div className="row">
                        <div className="col-md-1"/>
                        <div className="col-md-10">
                            <List>
                                {this.props.qualifications.map(QualificationModule.renderSingleQualification)}
                            </List>
                        </div>
                        <div className="col-md-1"/>
                    </div>
                </CardMedia>
            </Card>
        );
    }
}

export const Qualifications: React.ComponentClass<QualificationLocalProps> = connect(QualificationModule.mapStateToProps, QualificationModule.mapDispatchToProps)(QualificationModule);