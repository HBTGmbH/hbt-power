import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, ProfileElementType} from '../../../../Store';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {Sector} from '../../../../model/Sector';
import * as Immutable from 'immutable';
import {SectorEntry} from '../../../../model/SectorEntry';
import {SingleSectorModule} from './sector_module';
import {ProfileActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';

interface SectorsProps {
    sectors: Immutable.Map<number, Sector>;
    sectorEntries: Immutable.Map<number, SectorEntry>;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface SectorsLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface SectorsLocalState {

}

interface SectorsDispatch {
    onSectorChange(sectorId: number, sectorEntryId: number): void;
}

class SectorsModule extends React.Component<SectorsProps & SectorsLocalProps & SectorsDispatch, SectorsLocalState> {


    private static renderHeader() {
        return (
            <tr>
                <th>{PowerLocalize.get("Sector.Singular")}</th>
            </tr>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: SectorsLocalProps) : SectorsProps {
        return {
            sectors: state.databaseReducer.sectors,
            sectorEntries: state.databaseReducer.profile.sectors
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : SectorsDispatch {
        return {
            onSectorChange: function(sectorId: number, sectorEntryId: number) {
                dispatch(ProfileActionCreator.changeItemId(sectorId, sectorEntryId, ProfileElementType.SectorEntry))
            }
        };
    }

    private renderSingleListElement = (sectorEntry: SectorEntry, id:number) => {
        return (
            <SingleSectorModule
                key={"Sectors.SingleSector." + id}
                sectorEntry={sectorEntry}
                sectors={this.props.sectors}
                onSectorChange={this.props.onSectorChange}
            />
            );
    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Sector.Plural')}
                subtitleCountedName={PowerLocalize.get('Sector.Plural')}
                tableHeader={SectorsModule.renderHeader()}
            >
                {this.props.sectorEntries.map(this.renderSingleListElement).toArray()}
            </ProfileElement>
        );
    }
}

export const Sectors: React.ComponentClass<SectorsLocalProps> = connect(SectorsModule.mapStateToProps, SectorsModule.mapDispatchToProps)(SectorsModule);