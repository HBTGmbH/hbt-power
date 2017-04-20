
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../Store';
import {Card, CardHeader, CardMedia, Divider, List, TextField} from 'material-ui';

interface SectorsProps {
    sectors: string[];
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface SectorsLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface SectorsLocalState {

}

interface SectorsDispatch {

}

class SectorsModule extends React.Component<SectorsProps & SectorsLocalProps & SectorsDispatch, SectorsLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: SectorsLocalProps) : SectorsProps {
        return {
            sectors: state.singleProfile.profile.possibleSectors
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : SectorsDispatch {
        return {

        };
    }

    static renderSingleListElement(sector: string, index:number) {
        return (<TextField value={sector} key={index} fullWidth={true} disabled={true}/>);
    }

    render() {
        return(
        <Card>
            <CardHeader actAsExpander={true}
                        title="Sprachen"
                        subtitle={this.props.sectors.length + ' Sectors'}
            >
            </CardHeader>
            <Divider/>
            <CardMedia expandable={true}>
                <div className="row">
                    <div className="col-md-1"/>
                    <div className="col-md-10">
                        <List>
                            {this.props.sectors.map(SectorsModule.renderSingleListElement)}
                        </List>
                    </div>
                    <div className="col-md-1"/>
                </div>
            </CardMedia>
        </Card>
        );
    }
}

export const Sectors: React.ComponentClass<SectorsLocalProps> = connect(SectorsModule.mapStateToProps, SectorsModule.mapDispatchToProps)(SectorsModule);