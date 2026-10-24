import {connect, ConnectedComponent} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {PwrAutoComplete} from '../pwr-auto-complete';
import {NameEntityAlias} from '../../../model/NameEntityAlias';
import {NameEntityType} from '../../../reducers/profile-new/profile/model/NameEntityType';

interface PwrCompanyAutocompleteProps {
    companies: Array<string>;
    aliases: Array<NameEntityAlias>;
}

interface PwrCompanyAutocompleteLocalProps {
    id?: string | number;
    fullWidth?: boolean;
    multi?: boolean;
    searchTerm?: string;
    chips?: Array<string>;
    label: string;
    disabled?: boolean;

    disableFiltering?: boolean;

    onAdd?(item: string);

    onRemove?(item: string);

    onSearchChange(selectedItem: string, navigation?: boolean): void;
}

interface PwrCompanyAutocompleteLocalState {

}

interface PwrCompanyAutocompleteDispatch {

}

class PwrCompanyAutocompleteModule extends React.Component<PwrCompanyAutocompleteProps & PwrCompanyAutocompleteLocalProps & PwrCompanyAutocompleteDispatch, PwrCompanyAutocompleteLocalState> {

    constructor(props: PwrCompanyAutocompleteProps & PwrCompanyAutocompleteLocalProps & PwrCompanyAutocompleteDispatch) {
        super(props);
    }

    static mapStateToProps(state: ApplicationState, localProps: PwrCompanyAutocompleteLocalProps): PwrCompanyAutocompleteProps {
        return {
            companies: state.suggestionStore.allCompanies.map(value => value.name),
            aliases: state.suggestionStore.allAliases.filter(alias => alias.type === NameEntityType.COMPANY)
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch): PwrCompanyAutocompleteDispatch {
        return {};
    }

    render() {
        const props = this.props;
        return <PwrAutoComplete data={this.props.companies} {...props}/>;
    }
}

/**
 * @see PwrCompanyAutocompleteModule
 * @author Niklas
 * @since 02.08.2019
 */
export const PwrCompanyAutocomplete: React.ComponentClass<PwrCompanyAutocompleteLocalProps> = connect(PwrCompanyAutocompleteModule.mapStateToProps, PwrCompanyAutocompleteModule.mapDispatchToProps)(PwrCompanyAutocompleteModule) as any;
