import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ApplicationState, ProfileElementType} from '../../../../../Store';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {KeySkillEntry} from '../../../../../model/KeySkillEntry';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {SingleKeySkill} from './keySkill-entry_module';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link KeySkills.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface KeySkillsProps {
    keySkillEntries: Immutable.Map<string, KeySkillEntry>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link KeySkillsProps} and will then be
 * managed by redux.
 */
interface KeySkillsLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface KeySkillsLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface KeySkillsDispatch {
    addElement(): void;
}

class KeySkillsModule extends React.Component<
    KeySkillsProps
    & KeySkillsLocalProps
    & KeySkillsDispatch, KeySkillsLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: KeySkillsLocalProps): KeySkillsProps {
        return {
            keySkillEntries: state.databaseReducer.profile().keySkillEntries()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): KeySkillsDispatch {
        return {
            addElement: () => dispatch(ProfileActionCreator.createEntry(ProfileElementType.KeySkill))
        }
    }

    render() {
        return (<ProfileElement
            title={PowerLocalize.get('KeySkill.Singular')}
            subtitle={PowerLocalize.get("KeySkillEntry.Description")}
            onAddElement={this.props.addElement}
        >
            {this.props.keySkillEntries.map((keySkill, key) => {
                return(
                    <SingleKeySkill
                        key={"SingleKeySkill." + key}
                        keySkillEntryId={keySkill.id()}
                    />
                );
            }).toList()}
        </ProfileElement>);
    }
}

/**
 * @see KeySkillsModule
 * @author nt
 * @since 13.06.2017
 */
export const KeySkills: React.ComponentClass<KeySkillsLocalProps> = connect(KeySkillsModule.mapStateToProps, KeySkillsModule.mapDispatchToProps)(KeySkillsModule);