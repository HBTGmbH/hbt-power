import * as React from 'react';
import {Card, CardHeader, CardMedia, Divider, List, Table, TableBody, TableHeader} from 'material-ui';
import {PowerLocalize} from '../../localization/PowerLocalizer';

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

    render() {
        return(
            <Card>
                <CardHeader actAsExpander={true}
                            title={this.props.title}
                            subtitle={React.Children.count(this.props.children) + " " + this.props.subtitleCountedName}
                >
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
        );
    }
}