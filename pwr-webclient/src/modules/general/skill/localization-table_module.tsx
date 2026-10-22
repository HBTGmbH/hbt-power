import * as React from 'react';
import * as Immutable from 'immutable';
import {LocalizedQualifier} from '../../../model/skill/LocalizedQualifier';
import {
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Icon,
    InputLabel,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField
} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import {PwrButton} from '../pwr-button';
import {PwrIconButton} from '../pwr-icon-button';
import {PwrFormActions} from '../pwr-form-actions';
import {PwrSpacer} from '../pwr-spacer_module';

/**
 * Languages a localization can have (#180), ISO 639-2 like the skill service expects
 */
const LANGUAGES = ['deu', 'eng'];

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
            qualifier: ''
        };
    }

    private static languageName = (code: string) => {
        return LANGUAGES.includes(code) ? PowerLocalize.get('LocalizationTable.Language.' + code) : code;
    };

    private mapLocalizedRow = (localizedQualifier: LocalizedQualifier) => {
        return <TableRow
            key={localizedQualifier.id()}
        >
            <TableCell>{LocalizationTable.languageName(localizedQualifier.locale())}</TableCell>
            <TableCell>{localizedQualifier.qualifier()}</TableCell>
            <TableCell padding="checkbox">
                <PwrIconButton iconName="delete" tooltip={PowerLocalize.get('Action.Delete')}
                               onClick={() => this.props.onLocaleDelete(localizedQualifier.locale())}/>
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

    private invokeAdd = () => {
        this.props.onLocaleAdd(this.state.locale, this.state.qualifier.trim());
        this.closeDialog();
    };

    render() {
        return (
            <div>
                <Dialog
                    open={this.state.addOpen}
                    onClose={this.closeDialog}
                    fullWidth
                >
                    <DialogTitle>
                        {PowerLocalize.getFormatted('LocalizationTable.Title.Template', this.props.termToLocalize)}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>{PowerLocalize.get('LocalizationTable.Content.Description')}</DialogContentText>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel id="pwr-localization-language">{PowerLocalize.get('LocalizationTable.Input.Language')}</InputLabel>
                            <Select labelId="pwr-localization-language"
                                    value={this.state.locale}
                                    onChange={(event: React.ChangeEvent<{ value: unknown }>) =>
                                        this.setState({locale: event.target.value as string})}>
                                {LANGUAGES.map(code =>
                                    <MenuItem key={code} value={code}>
                                        {PowerLocalize.getFormatted('LocalizationTable.Language', LocalizationTable.languageName(code), code)}
                                    </MenuItem>)}
                            </Select>
                        </FormControl>
                        <PwrSpacer/>
                        <TextField
                            fullWidth
                            label={PowerLocalize.get('LocalizationTable.Input.Qualifier')}
                            value={this.state.qualifier}
                            onChange={(e) => this.setState({qualifier: e.target.value})}
                        />
                    </DialogContent>
                    <DialogActions>
                        <PwrFormActions editing noSpace saveText={PowerLocalize.get('Action.Add')} saveIcon="add"
                                        saveDisabled={!this.state.locale || !this.state.qualifier.trim()}
                                        onSave={this.invokeAdd} onCancel={this.closeDialog}/>
                    </DialogActions>
                </Dialog>
                {!this.props.localizations.isEmpty() && <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>{PowerLocalize.get('LocalizationTable.Column.Language')}</TableCell>
                            <TableCell>{PowerLocalize.get('LocalizationTable.Column.Qualifier')}</TableCell>
                            <TableCell padding="checkbox"/>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>{this.props.localizations.map(this.mapLocalizedRow)}</>
                    </TableBody>
                </Table>}
                <PwrSpacer size="tight"/>
                <PwrButton color="primary" text={PowerLocalize.get('LocalizationTable.Action.Add')}
                           icon={<Icon className="material-icons">add</Icon>} onClick={this.openDialog}/>
            </div>
        );
    }
}
