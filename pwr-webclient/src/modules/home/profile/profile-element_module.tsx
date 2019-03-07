import * as React from 'react';
import {Divider, IconButton} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails/ExpansionPanelDetails';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions/ExpansionPanelActions';
import Typography from '@material-ui/core/Typography/Typography';
import Icon from '@material-ui/core/Icon/Icon';

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
        'backgroundColor': 'rgb(255, 204, 102)'
    };


    render() {
        return (
            <div style={{width: '100%'}}>
                <br/>
                <ExpansionPanel defaultExpanded={false}>
                    <ExpansionPanelSummary
                        //actAsExpander={true}
                        title={this.props.title}
                        expandIcon={<Icon className={'material-icon'}>keyboard_arrow_down</Icon>}
                    >
                        <div>
                            <Typography variant={'h5'}>{this.props.title}</Typography>
                            <Typography variant={'caption'}>{this.props.subtitle}</Typography>
                        </div>
                    </ExpansionPanelSummary>
                    <Divider/>
                    <ExpansionPanelDetails>
                        <div className="table-responsive" style={{width: '100%'}}>
                            <table className="table table-striped table-condensed">
                                {this.props.header}
                                <tbody>
                                {this.props.children}
                                </tbody>
                            </table>
                        </div>
                    </ExpansionPanelDetails>
                    <ExpansionPanelActions>
                        <div style={{textAlign: 'center'}}>
                            <Tooltip title={PowerLocalize.get('Action.New')}>
                                <IconButton style={{display: 'inline-block', flexGrow: 1}} className="material-icons"
                                            onClick={this.props.onAddElement}>
                                    add
                                </IconButton>
                            </Tooltip>
                        </div>
                    </ExpansionPanelActions>
                </ExpansionPanel>
            </div>
        );
    }
}