import {ConsultantLocalProps, Consultant, ConsultantProps} from './consultant_module';
import * as React from 'react';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {Drawer, List, ListItem, MenuItem, RaisedButton, TouchTapEvent} from 'material-ui';
import {PowerClientState} from './Store';
import {AbstractAction, AsyncActions} from './actions';
import {connect} from 'react-redux';
import * as redux from 'redux';

const Scroll = require('react-scroll');
const Element = Scroll.Element;
const Link = Scroll.Link;

/**
 * Properties to be passed to the React Redux container.
 * These properties will be managed by redux.
 *
 * In order for this to work, the mapStateToProps has to define a mapping from the state to
 * these properties.
 */
interface ConsultantDashboardProps {
    consultantProperties : ConsultantProps[];
}

/**
 * All local properties, properties that are only needed once and are not managed by redux,
 * are passed here.
 * These properties are filled with jsx while using this component.
 */
interface ConsultantDashboardLocalProps {

}

/**
 * Dispatches for redux.
 */
interface ConsultantDashboardDispatch {
    reimportAll: () => void;
}

function mapStateToProps(state: any, props: ConsultantDashboardProps) : ConsultantDashboardProps  {
    var result = {
        consultantProperties: state.updateConsultant.consultants
    };
    console.log("Result:", result);
    return result;
}

function mapDispatchToProps(dispatch: redux.Dispatch<PowerClientState>) : ConsultantDashboardDispatch {
    return {
        reimportAll: function() {
            dispatch(AsyncActions.fetchConsultants())
        }
    };
}


class ConsultantDashboardModule extends React.Component<ConsultantDashboardLocalProps & ConsultantDashboardProps & ConsultantDashboardDispatch, {}> {


    /**
     * Invokes re-reading of all consultants.
     */
    handleReimportAll = () =>  {
        this.props.reimportAll();

    };

    render() {
        console.log("render ConsultantDashboardModule", this.props);
        return (
            <div>
                <Drawer>
                    {this.props.consultantProperties.map((consultant) =>
                        <MenuItem>
                            <Link to={consultant.initials}>
                            {consultant.firstName + " " + consultant.lastName}
                            </Link>
                        </MenuItem>
                    )}
                    <div>
                        <br/>
                        <RaisedButton label="Reimport All" onClick={this.handleReimportAll}/>
                    </div>
                </Drawer>
                <Grid>
                    <Row>
                        <Col md={1}/>
                        <Col md={11}>
                            <List>
                                {this.props.consultantProperties.map((consultant, idx) =>
                                    <Element name={consultant.initials}>
                                        <ListItem>
                                            <Consultant
                                                index={idx}
                                                image_ref={"/img/crazy_lama.jpg"}
                                            />
                                        </ListItem>
                                    </Element>
                                )}
                            </List>
                        </Col>
                    </Row>
                </Grid>

            </div>
        );
    }
}

export const ConsultantDashboard: React.ComponentClass<ConsultantDashboardLocalProps> = connect(mapStateToProps, mapDispatchToProps)(ConsultantDashboardModule);