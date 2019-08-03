import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {PwrAutoComplete} from '../pwr-auto-complete';
import {NameEntity} from '../../../reducers/profile-new/profile/model/NameEntity';
import {NameEntityType} from '../../../reducers/profile-new/profile/model/NameEntityType';

interface PwrProjectRoleAutocompleteProps {
    projectRoles: Array<NameEntity>;
    projectRoleNames: Array<string>;
}


interface PwrProjectRoleAutocompletePropsLocalProps {
    id?: string | number;
    fullWidth?: boolean;
    multi?: boolean;
    items?: Array<NameEntity>;
    label: string;
    disabled?: boolean;
    disableFiltering?: boolean;
    onAddRole?(role: NameEntity);
    onRemoveRole?(role: NameEntity);

    searchTerm?: string;
    onChangeRole(role: NameEntity);
}

class PwrProjectRoleAutocompleteModule extends React.Component<PwrProjectRoleAutocompleteProps & PwrProjectRoleAutocompletePropsLocalProps> {

    constructor(props: PwrProjectRoleAutocompleteProps & PwrProjectRoleAutocompletePropsLocalProps) {
        super(props);
    }

    static mapStateToProps(state: ApplicationState, localProps: PwrProjectRoleAutocompletePropsLocalProps): PwrProjectRoleAutocompleteProps {
        return {
            projectRoles: state.suggestionStore.allProjectRoles,
            projectRoleNames: state.suggestionStore.allProjectRoles.map(value => value.name)
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): {} {
        return {};
    }

    items = () => {
        if (this.props.items) {
            return this.props.items.map(item => item.name);
        }
        return [];
    };

    findRole = (name: string): NameEntity | undefined => {
        return this.props.projectRoles.find(value => value.name === name);
    };

    findRoleInInput = (name: string): NameEntity => {
        return this.props.items.find(value => value.name === name);
    };

    findOrNew = (name: string): NameEntity => {
        let role: NameEntity = this.findRole(name);
        if (!role) {
            role = {id: null, name: name, type: NameEntityType.PROJECT_ROLE};
        }
        return role;
    };


    handleAdd = (item: string) => {
        if (this.props.onAddRole) {
            this.props.onAddRole(this.findOrNew(item));
        }
    };

    handleChange = (value: string) => {
        this.props.onChangeRole(this.findOrNew(value));
    };

    handleRemove = (value: string) => {
        if (this.props.onRemoveRole) {
            const toRemove = this.findRoleInInput(value);
            if (!toRemove) {
                throw new Error("Cannot find role with name " + value + ", but removal for this role was called. This is most likely due to a mutating edit of props.item!");
            }
            this.props.onRemoveRole(toRemove);
        }
    };

    render()  {
        const props = this.props;
        return <PwrAutoComplete chips={this.items()}
                                onSearchChange={this.handleChange}
                                onRemove={this.handleRemove}
                                onAdd={this.handleAdd} data={this.props.projectRoleNames}
                                {...props}/>
    }
}

/**
 * @see PwrCompanyAutocompleteModule
 * @author Niklas
 * @since 02.08.2019
 */
export const PwrProjectRoleAutocomplete: React.ComponentClass<PwrProjectRoleAutocompletePropsLocalProps> = connect(PwrProjectRoleAutocompleteModule.mapStateToProps, PwrProjectRoleAutocompleteModule.mapDispatchToProps)(PwrProjectRoleAutocompleteModule);
