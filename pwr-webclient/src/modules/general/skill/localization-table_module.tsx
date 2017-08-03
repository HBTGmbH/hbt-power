import * as React from 'react';
import * as Immutable from 'immutable';
import {LocalizedQualifier} from '../../../model/skill/LocalizedQualifier';
import {
    Dialog,
    FlatButton,
    FontIcon,
    IconButton,
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
    TextField
} from 'material-ui';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {LanguageUtils} from '../../../utils/LanguageUtils';
import {LocalizationSearcher} from './localization-searcher_module';
import ISOData = LanguageUtils.ISO639_2DataSet;

interface LocalizationTableProps {
    localizations: Immutable.List<LocalizedQualifier>;
    termToLocalize: string;
    onLocaleAdd?(locale: string, qualifier: string): void;
    onLocaleDelete?(locale: string): void;
}

interface LocalizationTableState {
    addOpen: boolean;
    locale: string;
    qualifier: string;
    searcherOpen: boolean;
}

export class LocalizationTable extends React.Component<LocalizationTableProps, LocalizationTableState> {

    public static defaultProps: Partial<LocalizationTableProps> = {
        onLocaleAdd: (locale, qualifier) => {},
        onLocaleDelete: (locale) => {}
    };

    constructor(props: LocalizationTableProps) {
        super(props);
        this.state = {
            addOpen: false,
            locale: '',
            qualifier: '',
            searcherOpen: false
        };
    }

    private mapLocalizedRow = (localizedQualifier: LocalizedQualifier) => {
        return <TableRow
            key={localizedQualifier.id()}
        >
            <TableRowColumn>{localizedQualifier.locale()}</TableRowColumn>
            <TableRowColumn>{localizedQualifier.qualifier()}</TableRowColumn>
            <TableRowColumn>
                <div>
                    <IconButton
                        iconClassName="material-icons"
                        onClick={() => this.props.onLocaleDelete(localizedQualifier.locale())}
                    >
                        delete
                    </IconButton>
                </div>
            </TableRowColumn>
        </TableRow>;
    };

    private closeDialog = () => {
        this.setState({
            addOpen: false,
            locale: '',
            qualifier: ''
        });
    };

    private openDialog = () => {
        this.setState({
            addOpen: true
        });
    };

    private setLocale = (val: string) => {
        this.setState({
            locale: val
        });
    };

    private setQualifier = (val: string) => {
        this.setState({
            qualifier: val
        });
    };

    private invokeAdd = () => {
        console.log(LanguageUtils.getISO639_2LanguageCode(this.state.locale));
        this.props.onLocaleAdd(this.state.locale, this.state.qualifier);
        this.closeDialog();
    };

    private closeSearcher = () => {
        this.setState({
            searcherOpen: false
        });
    };

    private openSearcher = () => {
        this.setState({
            searcherOpen: true
        });
    };

    private handleSearcherSelect = (data: ISOData) => {
        this.setState({
            locale: data.code
        });
        this.closeSearcher();
    };

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.addOpen}
                    onRequestClose={this.closeDialog}
                    title={PowerLocalize.getFormatted('LocalizationTable.Title.Template', this.props.termToLocalize)}
                    actions={[
                        <FlatButton
                            primary={true}
                            label={PowerLocalize.get('Action.OK')}
                            onClick={this.invokeAdd}

                        />,
                        <FlatButton
                            secondary={true}
                            label={PowerLocalize.get('Action.Close')}
                            onClick={this.closeDialog}
                        />
                    ]}
                >
                    <LocalizationSearcher
                        open={this.state.searcherOpen}
                        onRequestClose={this.closeSearcher}
                        onSelectIsoData={this.handleSearcherSelect}
                    />
                    {PowerLocalize.get('LocalizationTable.Content.Description')}<br/>
                    <FlatButton
                        label={PowerLocalize.get('LocalizationTable.Content.LocalesLinkName')}
                        labelPosition="before"
                        primary={true}
                        onClick={() => window.open("https://www.loc.gov/standards/iso639-2/php/code_list.php")}
                        icon={<FontIcon className="material-icons">open_in_new</FontIcon>}
                    /><br/>
                    {PowerLocalize.get('LocalizationTable.Content.LocalizationRemarks')}
                    <div>
                        <div>
                            <TextField
                                floatingLabelText={PowerLocalize.get('LocalizationTable.Input.Language')}
                                value={this.state.locale}
                                onChange={(e, v) => this.setLocale(v)}
                            />
                            <IconButton
                                iconClassName="material-icons"
                                tooltip={PowerLocalize.get('Action.Search')}
                                onClick={this.openSearcher}
                            >
                                search
                            </IconButton>
                        </div>
                        <div>
                            <TextField
                                floatingLabelText={PowerLocalize.get('LocalizationTable.Input.Qualifier')}
                                value={this.state.qualifier}
                                onChange={(e, v) => this.setQualifier(v)}
                            />
                        </div>
                    </div>
                </Dialog>
                <Table>
                    <TableHeader
                        displaySelectAll={false}
                        adjustForCheckbox={false}
                    >
                        <TableRow>
                            <TableHeaderColumn>ISO-3 Language Code</TableHeaderColumn>
                            <TableHeaderColumn>Qualifier</TableHeaderColumn>
                            <TableHeaderColumn/>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {this.props.localizations.map(this.mapLocalizedRow)}
                    </TableBody>
                </Table>
                <div className="vertical-align fullWidth">
                    <IconButton
                        iconClassName="material-icons"
                        onClick={this.openDialog}
                        tooltip={PowerLocalize.get('Action.Add')}
                    >
                        add
                    </IconButton>
                </div>
            </div>
        );
    }
}
