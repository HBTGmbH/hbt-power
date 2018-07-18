import * as React from 'react';
import {Card, CardHeader, CardMedia, Divider, IconButton} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';

interface ProfileElementLocalProps {
    /**
     * Title of the card header
     */
    title: string;

    subtitle?: string;

    /**
     * Callback that is executed when the add button onClick event is invoked.
     * @param event
     */
    onAddElement(): void;

    header?: JSX.Element;
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


    public static defaultProps: Partial<ProfileElementLocalProps> = {
        subtitle: null
    };

    private readonly cardHeaderStyle = {
       'backgroundColor' : 'rgb(255, 204, 102)'
    };


    render() {
        return(
            <div  style={{width:"100%"}}>
                <br/>
                <Card>
                    <CardHeader
                        //actAsExpander={true}
                        title={this.props.title}
                        subheader={this.props.subtitle}
                    >
                    </CardHeader>
                    <Divider/>
                    <CardMedia //expandable={true}
                    >
                        <div className="table-responsive">
                            <table className="table table-striped table-condensed">
                                {this.props.header}
                                <tbody>
                                {this.props.children}
                                </tbody>
                            </table>
                        </div>
                        <div style={{textAlign: "center"}}>
                            <Tooltip title={PowerLocalize.get('Action.New')}>
                                <IconButton style={{display:"inline-block"}} className="material-icons" onClick={this.props.onAddElement} >
                                    add
                                </IconButton>
                            </Tooltip>
                        </div>
                    </CardMedia>
                </Card>
            </div>
        );
    }
}