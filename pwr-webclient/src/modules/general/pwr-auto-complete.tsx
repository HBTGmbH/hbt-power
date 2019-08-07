import Autosuggest from 'react-autosuggest'; // standard ' * as '
import * as React from 'react';
import {MenuItem, Paper, TextField, WithStyles, withStyles} from '@material-ui/core';
import {StringUtils} from '../../utils/StringUtil';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import filterFuzzy = StringUtils.filterFuzzy;

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
    disabled?: boolean;
    label: string;

    disableFiltering?: boolean;

    onAdd?(item: string);

    onRemove?(item: string);

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
    };

    dataFilteredBy = (value: string) => {
        if (this.props.disableFiltering) {
            return this.props.data;
        } else {
            return filter(this.props.data, value, filterFuzzy);
        }
    };

    handleSuggestionsFetchRequested = ({value}) => {
        this.setState({
            suggestions: this.dataFilteredBy(value),
        });
    };

    handleSuggestionsClearRequested = () => {
        this.setState({
            suggestions: [],
        });
    };

    handleChange = (event: any, newValue: string) => {

        let searchTerm:string=newValue;

        let navigation: boolean = false;
        if (event.key == 'ArrowUp' || event.key == 'ArrowDown') {

            navigation = true;
            searchTerm=this.props.searchTerm;
        }

        this.props.onSearchChange(searchTerm, navigation);
    };


    handleClick = (item: string) => {
        if (this.props.onAdd) {
            this.props.onAdd(item);
        }
    };

    handleKeyDownOnInput = (key: string, inputValue: string) => {
      if (key === 'Enter' && this.props.onAdd) {
          this.props.onAdd(inputValue);
      }
    };

    renderInputComponent = (inputProps) => {
        const {
            classes, inputRef = () => {
            }, ref, ...other
        } = inputProps;

        return (
            <TextField
                id={this.props.id + '_inputField'}
                label={this.props.label}
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
                    onKeyDown: event => this.handleKeyDownOnInput(event.key, inputProps.value)
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
                clearInputValueOnChange
                onUpdateInput={onChange}
                onAdd={onAdd}
                onDelete={onDelete}
                value={chips}
                inputRef={ref}
                {...other}
            />
        );
    };

    renderSuggestion = (suggestion, {query, isHighlighted}) => {
        const matches = match(suggestion, query);
        const parts = parse(suggestion, matches);
        return (
            <MenuItem selected={isHighlighted} component="div" onClick={() => this.handleClick(suggestion)}>
                <div>
                    {parts.map((part, index) => {
                        return part.highlight ? (
                            <span key={String(index)} style={{fontWeight: 500}}>{part.text}</span>
                        ) : (
                            <strong key={String(index)} style={{fontWeight: 300}}>
                                {part.text}
                            </strong>
                        );
                    })}
                </div>
            </MenuItem>
        );
    };


    render() {
        const {classes} = this.props;

        const autosuggestProps = {
            renderInputComponent: this.props.multi ? this.renderChipInput : this.renderInputComponent,
            suggestions: this.dataFilteredBy(this.props.searchTerm),
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
                    onChange: (event, {newValue}) => this.handleChange(event, newValue),
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
                    <Paper {...options.containerProps} square fullWidth>
                        {options.children}
                    </Paper>
                )}
            />
        );
    }
}

export const PwrAutoComplete = withStyles(styles as any)(PwrAutoCompleteModule);
