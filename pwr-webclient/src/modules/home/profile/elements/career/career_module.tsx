import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ApplicationState, ProfileElementType} from '../../../../../Store';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {CareerEntry} from '../../../../../model/CareerEntry';
import {SingleCareerEntry} from './career-entry_module';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link Careers.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface CareersProps {
    careerEntries: Immutable.Map<string, CareerEntry>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link CareersProps} and will then be
 * managed by redux.
 */
interface CareersLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface CareersLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface CareersDispatch {
    addCareerEntry(): void;
}

class CareersModule extends React.Component<CareersProps & CareersLocalProps & CareersDispatch, CareersLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: CareersLocalProps): CareersProps {
        return {
            careerEntries: state.databaseReducer.profile().careerEntries()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): CareersDispatch {
        return {
            addCareerEntry: () => dispatch(ProfileActionCreator.createEntry(ProfileElementType.CareerEntry))
        }
    }


    render() {
        return (<ProfileElement
            title={PowerLocalize.get('Career.Singular')}
            subtitle={PowerLocalize.get("CareerEntry.Description")}
            onAddElement={this.props.addCareerEntry}
        >
            {this.props.careerEntries.map((education, key) => {
                return(
                    <SingleCareerEntry
                        key={"SingleEducationElement." + key}
                        careerEntryId={education.id()}
                    />
                );
            }).toList()}
        </ProfileElement>);
    }
}

/**
 * @see CareersModule
 * @author nt
 * @since 12.06.2017
 */
export const Careers: React.ComponentClass<CareersLocalProps> = connect(CareersModule.mapStateToProps, CareersModule.mapDispatchToProps)(CareersModule);