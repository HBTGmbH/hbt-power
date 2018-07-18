import * as React from 'react';
import {LanguageUtils} from '../../../utils/LanguageUtils';
import { Dialog, List, ListItem, TextField} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import ISOData = LanguageUtils.ISO639_2DataSet;
import Popover from '@material-ui/core/Popover/Popover';

// TODO AutoComplete
// TODO makeSelectable ?!?!


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
    popoverAnchor: any;
}

const originalLanguageCodes = LanguageUtils.getAllISO639_2LanguageCodes();

export class LocalizationSearcher extends React.Component<LocalizationSearcherProps, LocalizationSearcherState> {



    constructor(props: LocalizationSearcherProps) {
        super(props);
        this.state = {
            isoData: originalLanguageCodes,
            selected: null,
            searchString: "",
            popoverAnchor:null,
        };
    }

    public static defaultProps: Partial<LocalizationSearcherProps> = {
        onClose: () => {},
        onSelectIsoData: data => {},
        maxHeight: '400px'
    };

    public componentDidMount() {
        this.setState({
            isoData: LanguageUtils.getAllISO639_2LanguageCodes()
        });
    }
    /*TODO Autokomplete */
    /*
    private static filterIsoData = (data: ISOData, searchString: string) => {
        return data.int.some((value, index, array) => AutoComplete.fuzzyFilter(searchString, value)) ||
                data.native.some(((value, index, array) => AutoComplete.fuzzyFilter(searchString, value)));
    };
*/
    public handleSearchStringChange = (e:any, v: string) => {
        this.setState({
            popoverAnchor:e.currentTarget,
        });
        let filtered = originalLanguageCodes;
        if(v.trim() !== "") {
           //TODO ..Autocomplete
            // filtered = originalLanguageCodes.filter(data => LocalizationSearcher.filterIsoData(data, v));
        }
        this.setState({
            searchString: v,
            isoData: filtered,

        })
    };

    private handleSelectIsoData = (isoData: ISOData) => {
        this.setState({
            popoverAnchor:null,
        })
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
            title={PowerLocalize.get("LocalizationSearcher.Title")}
        >
            {PowerLocalize.get("LocalizationSearcher.Explanation")}

            <TextField

                value={this.state.searchString}
                onChange={() => this.handleSearchStringChange}
                label={PowerLocalize.get("LocalizationSearcher.SearchString")}
            />
            <Popover
                open={Boolean(this.state.popoverAnchor)}
                anchorEl={this.state.popoverAnchor}
                anchorOrigin={{
                    vertical:'bottom',
                    horizontal:'center',
                }}
                transformOrigin={{
                    vertical:'top',
                    horizontal:'center',
                }}
            >
                <div style={{maxHeight: this.props.maxHeight, overflow: 'auto'}}>
                    <List>
                        {this.state.isoData.map(this.mapToListItem)}
                    </List>
                </div>
            </Popover>
        </Dialog>);
    }
}
