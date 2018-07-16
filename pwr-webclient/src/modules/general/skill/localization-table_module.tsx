import * as React from 'react';
import * as Immutable from 'immutable';
import {LocalizedQualifier} from '../../../model/skill/LocalizedQualifier';
import {
    Dialog,
    Button,
    Icon,
    IconButton,
    Table,
    TableBody,
    TableHead,
    TableCell,
    TableRow,
    TextField
} from '@material-ui/core';
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
            <TableCell>{localizedQualifier.locale()}</TableCell>
            <TableCell>{localizedQualifier.qualifier()}</TableCell>
            <TableCell>
                <div>
                    <IconButton
                        className="material-icons"
                        onClick={() => this.props.onLocaleDelete(localizedQualifier.locale())}
                    >
                        delete
                    </IconButton>
                </div>
            </TableCell>
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
        // TODO tabelle head anpassen
    render() {
        return (
            <div>
                <Dialog
                    open={this.state.addOpen}
                    onClose={this.closeDialog}
                    title={PowerLocalize.getFormatted('LocalizationTable.Title.Template', this.props.termToLocalize)}
                    actions={[
                        <Button
                            variant={'flat'}
                            color={'primary'}
                            label={PowerLocalize.get('Action.OK')}
                            onClick={this.invokeAdd}

                        />,
                        <Button
                            variant={'flat'}
                            secondary={true}
                            label={PowerLocalize.get('Action.Close')}
                            onClick={this.closeDialog}
                        />
                    ]}
                >
                    <LocalizationSearcher
                        open={this.state.searcherOpen}
                        onClose={this.closeSearcher}
                        onSelectIsoData={this.handleSearcherSelect}
                    />
                    {PowerLocalize.get('LocalizationTable.Content.Description')}<br/>
                    <Button
                        variant={'flat'}
                        label={PowerLocalize.get('LocalizationTable.Content.LocalesLinkName')}
                        labelPosition="before"
                        color={'primary'}
                        onClick={() => window.open("https://www.loc.gov/standards/iso639-2/php/code_list.php")}
                        icon={<Icon className="material-icons">open_in_new</Icon>}
                    /><br/>
                    {PowerLocalize.get('LocalizationTable.Content.LocalizationRemarks')}
                    <div>
                        <div>
                            <TextField
                                label={PowerLocalize.get('LocalizationTable.Input.Language')}
                                value={this.state.locale}
                                onChange={(e) => this.setLocale(e.target.value)}
                            />
                            <IconButton
                                className="material-icons"
                                tooltip={PowerLocalize.get('Action.Search')}
                                onClick={this.openSearcher}
                            >
                                search
                            </IconButton>
                        </div>
                        <div>
                            <TextField
                                label={PowerLocalize.get('LocalizationTable.Input.Qualifier')}
                                value={this.state.qualifier}
                                onChange={(e) => this.setQualifier(e.target.value)}
                            />
                        </div>
                    </div>
                </Dialog>
                <Table>
                    <TableHead
                        displaySelectAll={false}
                        adjustForCheckbox={false}
                    >
                        <TableRow>
                            <TableCell>ISO-3 Language Code</TableCell>
                            <TableCell>Qualifier</TableCell>
                            <TableCell/>
                        </TableRow>
                    </TableHead>
                    <TableBody displayRowCheckbox={false}>
                        {this.props.localizations.map(this.mapLocalizedRow)}
                    </TableBody>
                </Table>
                <div className="vertical-align fullWidth">
                    <IconButton
                        className="material-icons"
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
