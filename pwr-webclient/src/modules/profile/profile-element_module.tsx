import * as React from 'react';
import {
    Card, CardHeader, CardMedia, Divider, FontIcon, IconButton, List, Table, TableBody, TableHeader, Toolbar,
    ToolbarTitle
} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Color} from '../../utils/ColorUtil';

interface ProfileElementLocalProps {
    title: string;
    subtitleCountedName: string;
    tableHeader: JSX.Element;

}

/**
 * Wraps around a single profile element (such as career steps) to display them in the same style.
 *
 * This is intended to be used with any >listable< profile element.
 */
export class ProfileElement extends React.Component<ProfileElementLocalProps, {}> {


    private readonly cardHeaderStyle = {
       'background-color' : Color.HBTSilver.toCSSRGBString()
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

                    </CardMedia>


                </Card>
            </div>
        );
    }
}