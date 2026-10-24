import Autosuggest from 'react-autosuggest'; // standard ' * as '
import * as React from 'react';
import {MenuItem, Paper, TextField, WithStyles, withStyles} from '@material-ui/core';
import {StringUtils} from '../../utils/StringUtil';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import {ValidationError} from '../../utils/ValidationUtils';
import * as ReactDOM from "react-dom";

// Documentation: https://github.com/TeamWertarbyte/material-ui-chip-input
const ChipInput = require('material-ui-chip-input').default;


function filter(suggestions: Array<string>, searchTerm: string, filter: (searchTerm: string, value: string) => boolean) {
    return suggestions.filter(value => filter(searchTerm, value));
}

const styles = theme => ({
    container: {
        position: 'relative',
    },
    suggestionsContainerOpen: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing(1),
        left: 0,
        right: 0,
    },
    suggestion: {
        display: 'block',
    },
    suggestionsList: {
        margin: 0,
        padding: 0,
        listStyleType: 'none',
    }
});

export interface PwrAutoCompleteProps {
    id?: string | number;
    fullWidth?: boolean;
    multi?: boolean;
    searchTerm?: string;
    data: Array<string>;
    chips?: Array<string>;
    disabled?: boolean;
    label: string;
    validationError?: ValidationError;
    /** The cursor goes into the field when it appears, e.g. when a dialog opens */
    autoFocus?: boolean;
    disableFiltering?: boolean;

    /**
     * Additional text shown after a suggestion, separated by " - ", e.g. the alias by which a skill was found. Not part
     * of the value that is selected.
     */
    suggestionHint?(suggestion: string): string | null | undefined;

    /**
     * Further names of the entries of data (#270): an entry is suggested when one of its aliases matches too, with the
     * alias as hint (unless suggestionHint is given)
     */
    aliases?: Array<{ name: string, currentName: string }>;

    onAdd?(item: string);

    onRemove?(item: string);

    /**
     * The text in the field changed. navigation: through the arrow keys or by picking a suggestion, not by typing, so
     * there is nothing new to search for
     */
    onSearchChange(selectedItem: string, navigation?: boolean): void;
}

type Styles =
    WithStyles<'container'>
    & WithStyles<'suggestionsContainerOpen'>
    & WithStyles<'suggestion'>
    & WithStyles<'suggestionsList'>;

export class PwrAutoCompleteModule extends React.Component<PwrAutoCompleteProps & Styles, {}> {
    state = {
        suggestions: [],
        input: null,
    };

    dataFilteredBy = (value: string) => {
        if (this.props.disableFiltering) {
            return this.props.data;
        }
        const filtered = filter(this.props.data, value, StringUtils.filterFuzzy);
        const byAlias = this.matchingAliases(value)
            .map(alias => alias.currentName)
            .filter(name => this.props.data.indexOf(name) >= 0 && filtered.indexOf(name) < 0);
        return [...filtered, ...byAlias.filter((name, index) => byAlias.indexOf(name) === index)];
    };

    private matchingAliases = (value: string) => {
        if (!this.props.aliases || !value) {
            return [];
        }
        return this.props.aliases.filter(alias => StringUtils.filterFuzzy(value, alias.name));
    };

    /**
     * The alias by which the entry was found, unless the name contains the search text; matching the name only fuzzily
     * ("mbk" in "Musterbank eG") is no reason to leave out the alias "MBK"
     */
    private aliasHint = (suggestion: string, query: string): string | undefined => {
        if (!this.props.aliases || !query || suggestion.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
            return undefined;
        }
        const alias = this.matchingAliases(query).find(alias => alias.currentName === suggestion);
        return alias ? alias.name : undefined;
    };

    handleSuggestionsFetchRequested = ({value}) => {
        this.setState({
            suggestions: this.dataFilteredBy(value),
        });
    };

    handleSuggestionDisplay = (searchTerm: string, filteredData: Array<string>) => {
        if (filteredData.indexOf(searchTerm) < 0) {
            return [searchTerm, ...filteredData];
        }
        return filteredData;
    };

    handleSuggestionsClearRequested = () => {
        this.setState({
            suggestions: [],
        });
    };

    handleChange = (event: any, newValue: string, method: string) => {

        let searchTerm: string = newValue;
        let navigation: boolean = false;
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            navigation = true;
            searchTerm = this.props.searchTerm;
        } else if (method === 'enter' || method === 'click') {
            // A picked suggestion: searching for it again would open the list again once the answer arrives (#184)
            navigation = true;
        }

        this.props.onSearchChange(searchTerm, navigation);
    };

    renderInputComponent = (inputProps) => {
        const {
            classes, inputRef = () => {
            }, ref, ...other
        } = inputProps;

        let label = this.props.label;
        if (this.props.validationError) {
            label = this.props.validationError.msg;
        }

        return (
            <TextField
                error={!!this.props.validationError}
                id={this.props.id + '_inputField'}
                label={label}
                fullWidth={this.props.fullWidth}
                disabled={this.props.disabled}
                InputProps={{
                    inputRef: node => {
                        ref(node);
                        inputRef(node);
                    },
                    classes: {
                        input: classes.input,
                    },
                }}
                {...other}
            />
        );
    };

    renderChipInput = (inputProps) => {
        const {classes, autoFocus, value, onChange, onAdd, onDelete, chips, ref, ...other} = inputProps;
        return (
            <ChipInput
                disabled={this.props.disabled}
                label={this.props.label}
                fullWidth={true}
                variant="filled"
                clearInputValueOnChange
                onUpdateInput={onChange}
                onDelete={onDelete}
                value={chips}
                inputRef={ref}
                {...other}
            />
        );
    };

    renderSuggestion = (suggestion, {query, isHighlighted}) => {
        // Hide only the search term prepended by handleSuggestionDisplay, not a real entry that equals it
        if (suggestion === query && this.props.data.indexOf(suggestion) < 0) {
            return null;
        }
        const hint = this.props.suggestionHint ? this.props.suggestionHint(suggestion) : this.aliasHint(suggestion, query);
        return (
            <MenuItem selected={isHighlighted} component="div">
                <div>
                    {this.renderHighlighted(suggestion, query)}
                    {/* " - " and not parentheses: many skill names end with an abbreviation in parentheses */}
                    {hint && <span style={{opacity: 0.6}}> - {this.renderHighlighted(hint, query)}</span>}
                </div>
            </MenuItem>
        );
    };

    private renderHighlighted = (text: string, query: string) => {
        return parse(text, match(text, query)).map((part, index) => {
            return part.highlight ? (
                <span key={String(index)} style={{fontWeight: 500}}>{part.text}</span>
            ) : (
                <strong key={String(index)} style={{fontWeight: 300}}>
                    {part.text}
                </strong>
            );
        });
    };

    handleSuggestionSelected = (event, {suggestion, suggestionValue, suggestionIndex, sectionIndex, method}) => {
        if (this.props.onAdd) {
            this.props.onAdd(suggestionValue);
        }
    };

    storeInputReference = (val: any): void => {
        if (val) {
            this.setState({input: val.input});
        } else {
            this.setState({input: null});
        }
    }


    render() {
        const classes = this.props.classes;

        const autosuggestProps = {
            renderInputComponent: this.props.multi ? this.renderChipInput : this.renderInputComponent,
            suggestions: this.handleSuggestionDisplay(this.props.searchTerm, this.dataFilteredBy(this.props.searchTerm)),
            onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
            onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
            onSuggestionSelected: this.handleSuggestionSelected,
            getSuggestionValue: (v) => v,
            // New function on every render: react-autosuggest only re-renders an item when its props change, so the
            // prepended (hidden) search term would stay hidden once the same text arrives as a real entry in data
            renderSuggestion: (suggestion, params) => this.renderSuggestion(suggestion, params),
        };

        const onlyChipProps = {
            onDelete: (chip, index) => this.props.onRemove(chip),
        };

        const basicInputProps = {
            classes,
            placeholder: this.props.label,
            autoFocus: this.props.autoFocus,
            value: this.props.searchTerm || '',
            chips: this.props.chips,
            onChange: (event, {newValue, method}) => this.handleChange(event, newValue, method),
        };

        let inputProps;
        if (this.props.multi) {
            inputProps = {
                ...basicInputProps,
                ...onlyChipProps
            };
        } else {
            inputProps = basicInputProps;
        }

        return (
            <Autosuggest
                id={this.props.id}
                {...autosuggestProps}
                inputProps={inputProps}
                ref={this.storeInputReference}
                theme={{
                    container: classes.container,
                    suggestionsContainerOpen: classes.suggestionsContainerOpen,
                    suggestionsList: classes.suggestionsList,
                    suggestion: classes.suggestion,
                }}
                renderSuggestionsContainer={options => {
                    if (!this.state.input) {
                        return null;
                    }
                    const inputCoords = this.state.input.getBoundingClientRect();
                    const style = {
                            left: inputCoords.left + window.scrollX, // adding scrollX and scrollY to get the coords wrt document instead of viewport
                            top: inputCoords.bottom + window.scrollY,
                            width: inputCoords.width,
                            zIndex: 1500,
                            position: 'absolute',
                        };
                    const toRender = <Paper {...options.containerProps} style={style} square>
                        {options.children}
                    </Paper>
                    return ReactDOM.createPortal(toRender, document.querySelector('body'));
                }}
            />
        );
    }
}

export const PwrAutoComplete = withStyles(styles as any)(PwrAutoCompleteModule);
