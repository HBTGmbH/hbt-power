import * as React from 'react';
import {
    Card, CardHeader, CardMedia, Divider, FontIcon, IconButton, List, Table, TableBody, TableHeader, Toolbar,
    ToolbarTitle, TouchTapEvent
} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Color} from '../../utils/ColorUtil';

interface ProfileElementLocalProps {
    /**
     * Title of the card header
     */
    title: string;

    /**
     * Represents the header of the table that is constructed by the child JSX elements.
     *
     * The header column and children column count has to be the same: If the children have 2 columns, the header
     * has to have two columsn, and so on.
     */
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
 * This is intended to be used with any >listable< profile element and represents them in a table. Each element will
 * have to render the table rows themselves. The elements are then added via the 'children' field of a react component.
 *
 * This component also adds a generic 'add' {@link IconButton} component to the bottom of the table. When this button is clicked, the
 * {@link ProfileElementLocalProps.onAddElement} callback will be invoked.
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
                        </div>
                        <div style={{textAlign: "center"}}>
                            <IconButton style={{display:"inline-block"}} iconClassName="material-icons" onClick={this.props.onAddElement} tooltip={PowerLocalize.get('Action.New')}>add</IconButton>
                        </div>
                    </CardMedia>
                </Card>
            </div>
        );
    }
}