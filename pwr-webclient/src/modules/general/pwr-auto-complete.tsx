import * as Autosuggest from 'react-autosuggest';
import * as React from 'react';
import {MenuItem, Paper, TextField, WithStyles, withStyles} from '@material-ui/core';
import {StringUtils} from '../../utils/StringUtil';
import * as match from 'autosuggest-highlight/match';
import * as parse from 'autosuggest-highlight/parse';
import filterFuzzy = StringUtils.filterFuzzy;

// Documentation: https://github.com/TeamWertarbyte/material-ui-chip-input
const ChipInput = require("material-ui-chip-input").default;


function filter(suggestions: Array<string>, searchTerm: string, filter: (searchTerm: string, value: string) => boolean) {
    console.log("Filter before", suggestions);
    let res = suggestions.filter(value => filter(searchTerm, value));
    console.log("Filter after", res);
    return res;
}

const styles = theme => ({
    container: {
        position: 'relative',
    },
    suggestionsContainerOpen: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
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
    label: string;
    onAdd?(item: string);
    onRemove?(item: string);
    onSearchChange(selectedItem: string): void;
}

type Styles = WithStyles<'container'> & WithStyles<'suggestionsContainerOpen'> & WithStyles<'suggestion'> & WithStyles<'suggestionsList'>;

class PwrAutoCompleteModule extends React.Component<PwrAutoCompleteProps & Styles, {}> {
    state = {
        suggestions: [],
    };

    handleSuggestionsFetchRequested = ({ value }) => {
        this.setState({
            suggestions: filter(this.props.data, value, filterFuzzy),
        });
    };

    handleSuggestionsClearRequested = () => {
        this.setState({
            suggestions: [],
        });
    };

    handleChange = name => (event, { newValue }) => {
        this.setState({
            [name]: newValue,
        });
    };

    handleClick = (item: string) => {
        if (this.props.onAdd) {
            this.props.onAdd(item);
        }
    }

    renderInputComponent = (inputProps) => {
        const { classes, inputRef = () => {}, ref, ...other } = inputProps;

        return (
            <TextField
                id={this.props.id + "_inputField"}
                label={this.props.label}
                fullWidth={this.props.fullWidth}
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

    renderChipInput = (inputProps)  => {
        const { classes, autoFocus, value, onChange, onAdd, onDelete, chips, ref, ...other } = inputProps
        return (
            <ChipInput
                label={this.props.label}
                fullWidth={true}
                clearInputValueOnChange
                onUpdateInput={onChange}
                onAdd={onAdd}
                onDelete={onDelete}
                value={chips}
                inputRef={ref}
                {...other}
            />
        )
    };

    renderSuggestion = (suggestion, { query, isHighlighted }) => {
        const matches = match(suggestion, query);
        const parts = parse(suggestion, matches);
        return (
            <MenuItem selected={isHighlighted} component="div" onClick={() => this.handleClick(suggestion)}>
                <div>
                    {parts.map((part, index) => {
                        return part.highlight ? (
                            <span key={String(index)} style={{ fontWeight: 500 }}>
              {part.text}
            </span>
                        ) : (
                            <strong key={String(index)} style={{ fontWeight: 300 }}>
                                {part.text}
                            </strong>
                        );
                    })}
                </div>
            </MenuItem>
        );
    };


    render() {
        const { classes } = this.props;

        const autosuggestProps = {
            renderInputComponent: this.props.multi ? this.renderChipInput: this.renderInputComponent,
            suggestions: this.state.suggestions,
            onSuggestionsFetchRequested: this.handleSuggestionsFetchRequested,
            onSuggestionsClearRequested: this.handleSuggestionsClearRequested,
            getSuggestionValue: (v) => v,
            renderSuggestion: this.renderSuggestion,
        };

        return (
            <Autosuggest
                id={this.props.id}
                {...autosuggestProps}
                inputProps={{
                    classes,
                    placeholder: this.props.label,
                    value: this.props.searchTerm,
                    chips: this.props.chips,
                    onChange: (event, {newValue}) => this.props.onSearchChange(newValue),
                    onAdd: (chip) => this.props.onAdd(chip),
                    onDelete: (chip, index) => this.props.onRemove(chip),
                }}
                theme={{
                    container: classes.container,
                    suggestionsContainerOpen: classes.suggestionsContainerOpen,
                    suggestionsList: classes.suggestionsList,
                    suggestion: classes.suggestion,
                }}
                renderSuggestionsContainer={options => (
                    <Paper {...options.containerProps} square>
                        {options.children}
                    </Paper>
                )}
            />
        );
    }
}
export const PwrAutoComplete = withStyles(styles as any)(PwrAutoCompleteModule);