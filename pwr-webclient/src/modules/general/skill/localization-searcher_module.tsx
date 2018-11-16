import * as React from 'react';
import {LanguageUtils} from '../../../utils/LanguageUtils';
import {Dialog, DialogContent, DialogTitle, List, ListItem, TextField} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {StringUtils} from '../../../utils/StringUtil';
import ISOData = LanguageUtils.ISO639_2DataSet;
import filterFuzzy = StringUtils.filterFuzzy;

interface LocalizationSearcherProps {
    open: boolean;

    onClose?(): void;

    onSelectIsoData?(data: ISOData): void;

    maxHeight?: string;
}

interface LocalizationSearcherState {
    isoData: Array<ISOData>;
    selected: any;
    searchString: string;
}

const originalLanguageCodes = LanguageUtils.getAllISO639_2LanguageCodes();

export class LocalizationSearcher extends React.Component<LocalizationSearcherProps, LocalizationSearcherState> {


    constructor(props: LocalizationSearcherProps) {
        super(props);
        this.state = {
            isoData: originalLanguageCodes,
            selected: null,
            searchString: '',
        };
    }

    public static defaultProps: Partial<LocalizationSearcherProps> = {
        onClose: () => {
        },
        onSelectIsoData: data => {
        },
        maxHeight: '400px'
    };

    public componentDidMount() {
        this.setState({
            isoData: LanguageUtils.getAllISO639_2LanguageCodes()
        });
    }

    private static filterIsoData = (data: ISOData, searchString: string) => {
        return data.int.some((value, index, array) => filterFuzzy(searchString, value)) ||
            data.native.some(((value, index, array) => filterFuzzy(searchString, value)));
    };

    public handleSearchStringChange = (e: any) => {
        const value = e.target.value;
        let filtered = originalLanguageCodes;
        if (value.trim() !== '') {
            filtered = originalLanguageCodes.filter(data => LocalizationSearcher.filterIsoData(data, value));
        }
        this.setState({
            searchString: value,
            isoData: filtered,
        });
    };

    private handleSelectIsoData = (isoData: ISOData) => {
        this.props.onSelectIsoData(isoData);
    };

    private mapToListItem = (isoData: ISOData) => {
        return <ListItem
            key={isoData.code}
            onClick={() => this.handleSelectIsoData(isoData)}
        >
            {isoData.code + ' / ' + isoData.int + ' / ' + isoData.native}
        </ListItem>;
    };

    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.props.onClose}
            >
                <DialogTitle>{PowerLocalize.get('LocalizationSearcher.Title')}</DialogTitle>
                <DialogContent>
                    {PowerLocalize.get('LocalizationSearcher.Explanation')}
                    <TextField
                        value={this.state.searchString}
                        onChange={this.handleSearchStringChange}
                        label={PowerLocalize.get('LocalizationSearcher.SearchString')}
                    />
                    <div style={{maxHeight: this.props.maxHeight, overflow: 'auto'}}>
                        <List>
                            {this.state.isoData.map(this.mapToListItem)}
                        </List>
                    </div>
                </DialogContent>
            </Dialog>);
    }
}
