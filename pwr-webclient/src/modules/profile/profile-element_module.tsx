import * as React from 'react';
import {
    Card, CardHeader, CardMedia, Divider, FontIcon, IconButton, List, Table, TableBody, TableHeader, Toolbar,
    ToolbarTitle, TouchTapEvent
} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Color} from '../../utils/ColorUtil';

interface ProfileElementLocalProps {
    title: string;
    subtitleCountedName: string;
    tableHeader: JSX.Element;

    /**
     * Callback that is executed when the add button onClick event is invoked.
     * @param event
     */
    onAddElement(event: TouchTapEvent): void;
}

/**
 * Wraps around a single profile element (such as career steps) to display them in the same style.
 *
 * This is intended to be used with any >listable< profile element.
 */
export class ProfileElement extends React.Component<ProfileElementLocalProps, {}> {


    private readonly cardHeaderStyle = {
       'backgroundColor' : Color.HBTSilver.toCSSRGBString()
    };


    render() {
        return(
            <div>
                <br/>
                <Card>
                    <CardHeader actAsExpander={true} title={this.props.title} style={this.cardHeaderStyle}>

                    </CardHeader>
                    <Divider/>

                    <CardMedia expandable={true}>
                        <div className="table-responsive">
                            <table className="table table-striped table-condensed">
                                <thead>
                                {this.props.tableHeader}
                                </thead>
                                <tbody>
                                {this.props.children}
                                </tbody>
                            </table>

                            <IconButton iconClassName="material-icons" onClick={this.props.onAddElement} tooltip={PowerLocalize.get('Action.New')}>add</IconButton>

                        </div>

                    </CardMedia>


                </Card>
            </div>
        );
    }
}