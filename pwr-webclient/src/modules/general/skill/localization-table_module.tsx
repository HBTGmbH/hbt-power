import * as React from 'react';
import * as Immutable from 'immutable';
import {LocalizedQualifier} from '../../../model/skill/LocalizedQualifier';
import {
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
import {LocalizationSearcher} from './localization-searcher_module';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import {PwrButton} from '../pwr-button';
import {PwrIconButton} from '../pwr-icon-button';
import {PwrFormActions} from '../pwr-form-actions';
import {PwrSpacer} from '../pwr-spacer_module';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import {ISO639_2DataSet} from '../../../utils/LanguageUtils';

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
        onLocaleAdd: (locale, qualifier) => {
        },
        onLocaleDelete: (locale) => {
        }
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
                    <PwrIconButton iconName="delete" tooltip={PowerLocalize.get('Action.Delete')}
                                   onClick={() => this.props.onLocaleDelete(localizedQualifier.locale())}/>
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

    private handleSearcherSelect = (data: ISO639_2DataSet) => {
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
                        <PwrButton color={'primary'} text={PowerLocalize.get('LocalizationTable.Content.LocalesLinkName')}
                                   icon={<Icon className="material-icons">open_in_new</Icon>}
                                   onClick={() => window.open('https://www.loc.gov/standards/iso639-2/php/code_list.php')}/><br/>
                        {PowerLocalize.get('LocalizationTable.Content.LocalizationRemarks')}
                        <PwrSpacer/>
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
                            <PwrSpacer/>
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
                        <PwrFormActions editing noSpace saveText={PowerLocalize.get('Action.Add')} saveIcon="add"
                                        saveDisabled={!this.state.locale.trim() || !this.state.qualifier.trim()}
                                        onSave={this.invokeAdd} onCancel={this.closeDialog}/>
                    </DialogActions>
                </Dialog>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{PowerLocalize.get('LocalizationTable.Column.Language')}</TableCell>
                            <TableCell>{PowerLocalize.get('LocalizationTable.Column.Qualifier')}</TableCell>
                            <TableCell/>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>{this.props.localizations.map(this.mapLocalizedRow)}</>
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
