import * as React from 'react';
import * as Immutable from 'immutable';
import {LocalizedQualifier} from '../../../model/skill/LocalizedQualifier';
import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Icon,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField
} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {LanguageUtils} from '../../../utils/LanguageUtils';
import {LocalizationSearcher} from './localization-searcher_module';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
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
    render() {
        return (
            <div>
                <Dialog
                    open={this.state.addOpen}
                    onClose={this.closeDialog}
                >
                    <DialogTitle>
                        {PowerLocalize.getFormatted('LocalizationTable.Title.Template', this.props.termToLocalize)}
                    </DialogTitle>
                    <DialogContent>
                        <LocalizationSearcher
                            open={this.state.searcherOpen}
                            onClose={this.closeSearcher}
                            onSelectIsoData={this.handleSearcherSelect}
                        />
                        {PowerLocalize.get('LocalizationTable.Content.Description')}<br/>
                        <Button
                            variant={'flat'}
                            color={'primary'}
                            onClick={() => window.open("https://www.loc.gov/standards/iso639-2/php/code_list.php")}
                        >
                            {PowerLocalize.get('LocalizationTable.Content.LocalesLinkName')}
                            <Icon className="material-icons">open_in_new</Icon>
                        </Button><br/>
                        {PowerLocalize.get('LocalizationTable.Content.LocalizationRemarks')}
                        <div>
                            <div>
                                <TextField
                                    label={PowerLocalize.get('LocalizationTable.Input.Language')}
                                    value={this.state.locale}
                                    onChange={(e) => this.setLocale(e.target.value)}
                                />
                                <Tooltip title={PowerLocalize.get('Action.Search')}>
                                <IconButton
                                    className="material-icons"
                                    onClick={this.openSearcher}
                                >
                                    search
                                </IconButton>
                                </Tooltip>
                            </div>
                            <div>
                                <TextField
                                    label={PowerLocalize.get('LocalizationTable.Input.Qualifier')}
                                    value={this.state.qualifier}
                                    onChange={(e) => this.setQualifier(e.target.value)}
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant={'flat'}
                            color={'primary'}
                            onClick={this.invokeAdd}

                        >{PowerLocalize.get('Action.OK')}</Button>,
                        <Button
                            variant={'flat'}
                            color={'secondary'}
                            onClick={this.closeDialog}
                        >{PowerLocalize.get('Action.Close')}</Button>
                    </DialogActions>
                </Dialog>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ISO-3 Language Code</TableCell>
                            <TableCell>Qualifier</TableCell>
                            <TableCell/>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.props.localizations.map(this.mapLocalizedRow)}
                    </TableBody>
                </Table>
                <div className="vertical-align fullWidth">
                    <Tooltip title={PowerLocalize.get('Action.Add')}>
                    <IconButton
                        className="material-icons"
                        onClick={this.openDialog}
                    >
                        add
                    </IconButton>
                    </Tooltip>
                </div>
            </div>
        );
    }
}
