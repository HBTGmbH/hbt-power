import {ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, TextField} from '@material-ui/core';
import * as React from 'react';
import {ReactElement} from 'react';

const ITEM_HEIGHT = 48;

export type MatcherFunction = (value: string, searchTerm: string) => boolean;

export const PWR_STARTS_WITH_MATCHER: MatcherFunction = (value, searchTerm) => value.toLowerCase().startsWith(searchTerm.toLocaleLowerCase());

interface AutoSuggestProps {
    id?: any;
    label?: any;
    data: Array<string>;
    searchTerm: string;

    matcher?: MatcherFunction;
    fullWidth?: boolean;
    maxItems?: number;

    closeOnSelect?: boolean;

    onSearchChange(searchTerm: string): void;
    // Fired when either an element is selected or enter is hit
    // If null is passed, nothing was selected.
    onSelect?(selected: string | null): void;
}

interface AutoSuggestState {
    anchorElement: any;
    filteredData: Array<string>
}

class AutoSuggest extends React.Component<AutoSuggestProps, AutoSuggestState> {

    public static defaultProps: Partial<AutoSuggestProps> = {
        maxItems: 10,
        fullWidth: false,
        matcher: PWR_STARTS_WITH_MATCHER,
        onSelect: () => {/*do nothing*/}
    };

    constructor(props: AutoSuggestProps) {
        super(props);
        this.state = {
            anchorElement: null,
            filteredData: []
        };
    }

    componentDidUpdate(prevProps: AutoSuggestProps) {
        if (this.props.searchTerm !== prevProps.searchTerm  || this.props.data !== prevProps.data || this.props.matcher !== prevProps.matcher) {
            let filtered: Array<string> = [];
            if (!!this.props.searchTerm) {
                filtered = this.props.data.filter(value => this.props.matcher(value, this.props.searchTerm));
            }
            this.setState({
                filteredData: filtered
            })
        }
    }

    private selectData = (data: string) => {
        console.log("OnSelect_auto: ",data);
        this.props.onSelect(data);
        if (this.props.closeOnSelect) {
            this.setState({
                anchorElement: null,
                filteredData: []
            })
        }
    };

    private handleSearchChange = (event: any) => {
        console.log("onSearchChange_auto: ",event.target.value);
        this.props.onSearchChange(event.target.value);
        this.setState({
            anchorElement: event.currentTarget,
        })
    };

    private handleSearchKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            if (this.state.filteredData.length >= 0) {
                this.props.onSelect(this.state.filteredData[0]);
            } else {
                this.props.onSelect(this.props.searchTerm);
            }
        }
    };

    private renderData = (): Array<ReactElement<any>> => {
        return this.state.filteredData
            .map((value, index) => <MenuItem
                key={value}
                selected={index === 0}
                button
                onClick={() => this.selectData(value)}
            >
                {value}
            </MenuItem>)
    };

    private renderSuggestions = (width: number | string) => {
        return <Popper
            open={true}
            anchorEl={this.state.anchorElement}
            transition
            disablePortal
            placement={"bottom-start"}
            style={{width: width, zIndex: 99}}
            modifiers={{
                flip: {
                    enabled: false,
                },
                preventOverflow: {
                    enabled: false,
                }
            }}
        >

            {({ TransitionProps, placement }) => (
                <Grow
                   {...TransitionProps}
                >
                    <Paper style={{maxHeight: this.props.maxItems * ITEM_HEIGHT, overflowY: "auto"}}>
                        <ClickAwayListener onClickAway={() => {this.selectData(null)} }>
                            <MenuList>
                                {this.renderData()}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
            )}
        </Popper>
    };

    public render() {
        const width = this.props.fullWidth ? "100%" : 256;
        const searchTerm = !!this.props.searchTerm ? this.props.searchTerm : "";
        console.log("render_auto(searchTerm): ",this.props.searchTerm);
        return (
            <div id={this.props.id} style={{width: width}}>
                <TextField
                    style={{width: width}}
                    label={this.props.label}
                    margin="normal"
                    aria-haspopup={true}
                    value={searchTerm}
                    onChange={this.handleSearchChange}
                    onKeyPress={this.handleSearchKeyPress}
                />
                {
                    this.state.filteredData.length > 0 ? this.renderSuggestions(width) : <React.Fragment/>
                }
            </div>

        );
    }
}

export default AutoSuggest;
