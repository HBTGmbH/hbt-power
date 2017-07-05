import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState, ProfileElementType} from '../../../Store';
import {
    Table, TableRow, TableHeader, TableHeaderColumn, TableBody, TableRowColumn, SelectField,
    MenuItem
} from 'material-ui';

interface NameEntityOverviewProps {

}

interface NameEntityOverviewLocalProps {

}

interface NameEntityOverviewLocalState {

}

interface NameEntityOverviewDispatch {

}

class NameEntityOverviewModule extends React.Component<
    NameEntityOverviewProps
    & NameEntityOverviewLocalProps
    & NameEntityOverviewDispatch, NameEntityOverviewLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: NameEntityOverviewLocalProps): NameEntityOverviewProps {
        return {};
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): NameEntityOverviewDispatch {
        return {};
    }

    render() {
        return (
            <div>
                <div style={{width: '100%'}}>
                    <SelectField
                        floatingLabelText="Frequency"
                    >
                        <MenuItem value={1} primaryText="Never" />
                        <MenuItem value={2} primaryText="Every Night" />
                        <MenuItem value={3} primaryText="Weeknights" />
                        <MenuItem value={4} primaryText="Weekends" />
                        <MenuItem value={5} primaryText="Weekly" />
                    </SelectField>
                </div>
                <div style={{width: '100%'}}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderColumn>Name</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableRowColumn>John Smith</TableRowColumn>
                            </TableRow>
                            <TableRow>
                                <TableRowColumn>Randal White</TableRowColumn>
                            </TableRow>
                            <TableRow>
                                <TableRowColumn>Stephanie Sanders</TableRowColumn>
                            </TableRow>
                            <TableRow>
                                <TableRowColumn>Steve Brown</TableRowColumn>
                            </TableRow>
                            <TableRow>
                                <TableRowColumn>Christopher Nolan</TableRowColumn>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>);
    }
}

/**
 * @see NameEntityOverviewModule
 * @author nt
 * @since 04.07.2017
 */
export const NameEntityOverview: React.ComponentClass<NameEntityOverviewLocalProps> = connect(NameEntityOverviewModule.mapStateToProps, NameEntityOverviewModule.mapDispatchToProps)(NameEntityOverviewModule);