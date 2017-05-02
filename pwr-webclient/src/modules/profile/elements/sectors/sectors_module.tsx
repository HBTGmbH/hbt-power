import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, NameEntityType, ProfileElementType} from '../../../../Store';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';
import {Sector} from '../../../../model/Sector';
import * as Immutable from 'immutable';
import {SectorEntry} from '../../../../model/SectorEntry';
import {SingleSectorModule} from './sector_module';
import {ProfileActionCreator, ProfileAsyncActionCreator} from '../../../../reducers/singleProfile/singleProfileActions';
import {TouchTapEvent} from 'material-ui';

interface SectorsProps {
    sectors: Immutable.Map<number, Sector>;
    sectorEntries: Immutable.Map<number, SectorEntry>;
    initials: string;
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
    onSectorDelete(sectorId: number): void;
    /**
     * Fixme comment
     * @param newSectorId
     */
    addSectorEntry(initials: string, newSectorId: number, sectors: Immutable.Map<number, Sector>): void;
    addSector(name: string, id: number): void;
}

class SectorsModule extends React.Component<SectorsProps & SectorsLocalProps & SectorsDispatch, SectorsLocalState> {


    private static renderHeader() {
        return (
            <div/>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: SectorsLocalProps) : SectorsProps {
        return {
            sectors: state.databaseReducer.sectors,
            sectorEntries: state.databaseReducer.profile.sectors,
            initials: state.databaseReducer.loggedInUser
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : SectorsDispatch {
        return {
            onSectorChange: function(sectorId: number, sectorEntryId: number) {
                dispatch(ProfileActionCreator.changeItemId(sectorId, sectorEntryId, ProfileElementType.SectorEntry));
            },
            onSectorDelete: function(sectorId: number){
                dispatch(ProfileActionCreator.deleteEntry(sectorId, ProfileElementType.SectorEntry));
            },
            addSectorEntry: function(initials: string, newSectorId: number, sectors: Immutable.Map<number, Sector>){
                dispatch(ProfileAsyncActionCreator.saveSectorEntry(initials, SectorEntry.createWithoutId(newSectorId), sectors));//Fixme hardcoded initials
            },
            addSector: function(name: string, id: number) {
                dispatch(ProfileActionCreator.createNameEntity(name, id, NameEntityType.Sector))
            }
        };
    }

    private handleAddElement = (event: TouchTapEvent) => {
        this.props.addSectorEntry(this.props.initials, this.props.sectors.first().id, this.props.sectors);
    };

    private renderSingleListElement = (sectorEntry: SectorEntry, id:number) => {
        return (
            <SingleSectorModule
                key={'Sectors.SingleSector.' + id}
                sectorEntry={sectorEntry}
                sectors={this.props.sectors}
                onSectorChange={this.props.onSectorChange}
                onSectorDelete={this.props.onSectorDelete}
                onNewSector={this.props.addSector}
            />
            );
    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Sector.Plural')}
                tableHeader={SectorsModule.renderHeader()}
                onAddElement={this.handleAddElement}
            >
                {this.props.sectorEntries.map(this.renderSingleListElement).toArray()}
            </ProfileElement>
        );
    }
}

export const Sectors: React.ComponentClass<SectorsLocalProps> = connect(SectorsModule.mapStateToProps, SectorsModule.mapDispatchToProps)(SectorsModule);