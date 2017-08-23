import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {ExportDocument} from '../../../model/ExportDocument';
import * as Immutable from 'immutable';
import {IconButton, Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui';
import {StringUtils} from '../../../utils/StringUtil';
import trimURL = StringUtils.trimURL;

interface ExportDocumentListProps {
    exportDocuments: Immutable.List<ExportDocument>;
}

interface ExportDocumentListLocalProps {

}

interface ExportDocumentListLocalState {

}

interface ExportDocumentListDispatch {

}

class ExportDocumentListModule extends React.Component<
    ExportDocumentListProps
    & ExportDocumentListLocalProps
    & ExportDocumentListDispatch, ExportDocumentListLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ExportDocumentListLocalProps): ExportDocumentListProps {
        return {
            exportDocuments: state.databaseReducer.exportDocuments()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ExportDocumentListDispatch {
        return {}
    }

    private openDoc = (location: string) => {
        window.open(location, "_blank");
    };

    private renderTableRow = (exportDocument: ExportDocument) => {
      return (
          <TableRow key={trimURL(exportDocument.location())}>
              <TableRowColumn style={{width: "80px"}}>
                  <IconButton iconClassName="material-icons" onClick={() => this.openDoc(exportDocument.location())}>open_in_new</IconButton>
              </TableRowColumn>
              <TableRowColumn>{trimURL(exportDocument.location())}</TableRowColumn>
        </TableRow>)
    };

    render() {
        return (<div>
            <Table>
                <TableHeader displaySelectAll={false}>
                    <TableRow>
                        <TableHeaderColumn/>
                        <TableHeaderColumn>Name</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {
                        this.props.exportDocuments.map(exportDocument => this.renderTableRow(exportDocument)).toArray()
                    }
                </TableBody>
            </Table>
        </div>);
    }
}

/**
 * @see ExportDocumentListModule
 * @author nt
 * @since 26.06.2017
 */
export const ExportDocumentList: React.ComponentClass<ExportDocumentListLocalProps> = connect(ExportDocumentListModule.mapStateToProps, ExportDocumentListModule.mapDispatchToProps)(ExportDocumentListModule);