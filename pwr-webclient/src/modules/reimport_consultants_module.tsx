import {AsyncActions} from '../reducers/consultants/consultant_actions';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../Store';
import * as React from 'react';
import {Col, Grid, Row} from 'react-flexbox-grid';
import {LinearProgress, RaisedButton} from 'material-ui';
import {connect} from 'react-redux';


/**
 * Properties that are managed by redux. Properties that are inserted here also
 * need to be introduces in the mapStateToProps method to allow redux to manage these
 * properties.
 * <p>
 *     Properties not introduced in mapStateToProps should go to local props
 */
interface ReimportConsultantsProps {
    requestingConsultants: boolean;
}

/**
 * Local properties of this module. These properties are not managed by redux
 */
interface ReimportConsultantsLocalProps {
    buttonReimportName: string;
}

/**
 * Dispatched methods for redux.
 */
interface ReimportConsultantsDispatch {
    /**
     * Invokes a reimport of all consultants.
     */
    reImportAll: () => void;
}


/**
 * Component used to allow async re-importing of consultant data.
 */
class ReimportConsultantsModule extends
    React.Component<ReimportConsultantsProps & ReimportConsultantsLocalProps & ReimportConsultantsDispatch, {}> {



    // Arrow notation to bind context.
    handleReImportAll = () => {
        this.props.reImportAll();
    };

    static mapStateToProps(state: ApplicationState, props: ReimportConsultantsLocalProps) : ReimportConsultantsProps  {
        return {
            requestingConsultants: state.updateConsultant.requestingConsultants
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ReimportConsultantsDispatch {
        return {
            reImportAll: function() {
                dispatch(AsyncActions.fetchConsultants())
            }
        };
    }

    /*
     */
    render()  {
        return(
            <Grid fluid>
                <Row>
                    <Col md={10}>
                        <div  style={{display: this.props.requestingConsultants ? "block" : "none"}}>
                            <LinearProgress  mode="indeterminate"/>
                        </div>
                    </Col>
                </Row>
                <br/>
                <Row>
                    <Col md={10}>
                        <RaisedButton label={this.props.buttonReimportName} style={{width:"100%"}} onClick={this.handleReImportAll}/>
                    </Col>
                </Row>
            </Grid>
        )
    }
}

export const ConsultantReImporter : React.ComponentClass<ReimportConsultantsLocalProps>
    = connect(ReimportConsultantsModule.mapStateToProps, ReimportConsultantsModule.mapDispatchToProps)(ReimportConsultantsModule);