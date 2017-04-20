import {Consultant, ConsultantProps} from './consultant_module';
import * as React from 'react';
import {Col, Grid, Row} from 'react-flexbox-grid';
import {Divider, Drawer, List, ListItem, MenuItem, Subheader} from 'material-ui';
import {ApplicationState, AllConsultantsState} from '../Store';
import {connect} from 'react-redux';
import * as redux from 'redux';
import {ConsultantReImporter} from './reimport_consultants_module';

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

}

function mapStateToProps(state: ApplicationState, props: ConsultantDashboardLocalProps) : ConsultantDashboardProps  {
    var result = {
        consultantProperties: state.updateConsultant.consultants,
    };
    console.log("Result:", result);
    return result;
}

function mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ConsultantDashboardDispatch {
    return {
    };
}


class ConsultantDashboardModule extends React.Component<ConsultantDashboardLocalProps & ConsultantDashboardProps & ConsultantDashboardDispatch, {}> {



    render() {
        console.log("render ConsultantDashboardModule", this.props);
        return (
            <Grid fluid>
                <Row>
                    <Col md={2} lg={2}>

                        <List>
                            <Subheader>Berater</Subheader>
                            <Divider />
                            {this.props.consultantProperties.map((consultant) =>
                                <MenuItem key={consultant.initials}>
                                    <Link to={consultant.initials}>
                                        {consultant.firstName + " " + consultant.lastName}
                                    </Link>
                                </MenuItem>
                            )}
                            <ConsultantReImporter buttonReimportName="Aktualisieren"/>

                        </List>

                    </Col>
                    <Col md={10} lg={10}>
                        <Grid>
                            <Row>
                                <Col md={1}/>
                                <Col md={11}>
                                    <List>
                                        {this.props.consultantProperties.map((consultant, idx) =>
                                            <Element name={consultant.initials} key={consultant.initials}>
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
                    </Col>
                </Row>
            </Grid>
        );
    }
}

export const ConsultantDashboard: React.ComponentClass<ConsultantDashboardLocalProps> = connect(mapStateToProps, mapDispatchToProps)(ConsultantDashboardModule);