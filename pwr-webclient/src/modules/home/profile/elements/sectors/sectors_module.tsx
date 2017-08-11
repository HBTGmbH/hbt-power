import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, ProfileElementType} from '../../../../../Store';
import {ProfileElement} from '../../profile-element_module';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import * as Immutable from 'immutable';
import {SectorEntry} from '../../../../../model/SectorEntry';
import {SingleSectorModule} from './sector-entry_module';
import {TouchTapEvent} from 'material-ui';
import {NameEntity} from '../../../../../model/NameEntity';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';

interface SectorsProps {
    sectors: Immutable.Map<string, NameEntity>;
    sectorEntries: Immutable.Map<string, SectorEntry>;
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
    deleteSectorEntry(sectorId: string): void;
    saveSectorEntry(sectorEntry: SectorEntry, sector: NameEntity): void;
    addSectorEntry(): void;
}

class SectorsModule extends React.Component<SectorsProps & SectorsLocalProps & SectorsDispatch, SectorsLocalState> {


    private static renderHeader() {
        return (
            <div/>
        );
    }

    static mapStateToProps(state: ApplicationState, localProps: SectorsLocalProps) : SectorsProps {
        return {
            sectors: state.databaseReducer.sectors(),
            sectorEntries: state.databaseReducer.profile().sectorEntries(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : SectorsDispatch {
        return {
            deleteSectorEntry: function(sectorId: string){
                dispatch(ProfileActionCreator.deleteEntry(sectorId, ProfileElementType.SectorEntry));
            },
            addSectorEntry: function(){
                dispatch(ProfileActionCreator.createEntry(ProfileElementType.SectorEntry));
            },
            saveSectorEntry: function(sectorEntry: SectorEntry, sector: NameEntity) {
                dispatch(ProfileActionCreator.saveEntry(sectorEntry, sector, ProfileElementType.SectorEntry))
            }
        };
    }

    private handleAddElement = (event: TouchTapEvent) => {
        this.props.addSectorEntry();
    };

    private renderSingleListElement = (sectorEntry: SectorEntry, id:string) => {
        return (
            <SingleSectorModule
                key={'Sectors.SingleSector.' + id}
                sectorEntry={sectorEntry}
                sectors={this.props.sectors}
                onSectorDelete={this.props.deleteSectorEntry}
                onSave={this.props.saveSectorEntry}
            />
            );
    };

    render() {
        return(
            <ProfileElement
                title={PowerLocalize.get('Sector.Plural')}
                subtitle={PowerLocalize.get('SectorEntry.Description')}
                onAddElement={this.handleAddElement}
            >
                {this.props.sectorEntries.map(this.renderSingleListElement).toArray()}
            </ProfileElement>
        );
    }
}

export const Sectors: React.ComponentClass<SectorsLocalProps> = connect(SectorsModule.mapStateToProps, SectorsModule.mapDispatchToProps)(SectorsModule);