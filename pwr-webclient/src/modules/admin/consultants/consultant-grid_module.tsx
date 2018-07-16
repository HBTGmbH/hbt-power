import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {Checkbox, Icon, GridList, Button} from '@material-ui/core';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import * as Immutable from 'immutable';
import {ConsultantTile} from './consultant-tile_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ConsultantCreateDialog} from './consultant-create-dialog_module';
import {ApplicationState} from '../../../reducers/reducerIndex';
import FormControl from '@material-ui/core/FormControl/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';

const Toggle = require('react-toggle').default;

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ConsultantGrid.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ConsultantGridProps {
    consultantsByInitials: Immutable.Map<string, ConsultantInfo>;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ConsultantGridProps} and will then be
 * managed by redux.
 */
interface ConsultantGridLocalProps {

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ConsultantGridLocalState {
    createDialogOpen: boolean;
    showInactive: boolean;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ConsultantGridDispatch {
    refreshConsultants(): void;

}

class ConsultantGridModule extends React.Component<
    ConsultantGridProps
    & ConsultantGridLocalProps
    & ConsultantGridDispatch, ConsultantGridLocalState> {

    constructor(props: ConsultantGridProps & ConsultantGridLocalProps & ConsultantGridDispatch) {
        super(props);
        this.state = {
            createDialogOpen: false,
            showInactive: false
        }
    }

    static mapStateToProps(state: ApplicationState, localProps: ConsultantGridLocalProps): ConsultantGridProps {
        return {
            consultantsByInitials: state.adminReducer.consultantsByInitials()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConsultantGridDispatch {
        return {
            refreshConsultants: () => dispatch(AdminActionCreator.AsyncGetAllConsultants())
        }
    }

    private showDialog = () => {
        this.setState({
            createDialogOpen: true
        })
    };

    private hideDialog = () => {
        this.setState({
            createDialogOpen: false
        })
    };

    private filterInactive = (v: ConsultantInfo) => {
        if(!this.state.showInactive) {
            return v.active();
        }
        return true;
    };

// TODO Checkbox on Change
    render() {
        return (
            <div>
                <ConsultantCreateDialog
                    show={this.state.createDialogOpen}
                    onClose={this.hideDialog}
                />
                <div className="row">
                    <Button
                        variant={'raised'}
                        style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}

                        onClick={this.props.refreshConsultants}
                    >
                        <Icon className="material-icons">refresh</Icon>
                        {PowerLocalize.get('Action.Update')}
                        </Button>
                    <Button
                        variant={'raised'}
                        style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}
                        onClick={this.showDialog}
                    >
                        <Icon className="material-icons">add</Icon>
                        {PowerLocalize.get('Action.CreateNewConsultant')}
                    </Button>
                    <FormControl>
                        <FormControlLabel control={
                            <Checkbox
                                checked={this.state.showInactive}
                                onChange={(e: object, v: boolean) => this.setState({showInactive: v})}

                            />
                        }
                                          label={"Show inactive"}
                                          />

                    </FormControl>
                </div>
                <div className="row">
                    <GridList
                        cols={4}
                        cellHeight={310}
                        spacing={5}
                    >
                    {
                        this.props.consultantsByInitials
                            .filter(this.filterInactive)
                            .map(consultantInfo => {
                                return <ConsultantTile key={"ConsultantTile." + consultantInfo.initials()} initials={consultantInfo.initials()}/>
                            }).toArray()
                    }
                    </GridList>
                </div>
            </div>
        );
    }
}

/**
 * @see ConsultantGridModule
 * @author nt
 * @since 07.06.2017
 */
export const ConsultantGrid: React.ComponentClass<ConsultantGridLocalProps> = connect(ConsultantGridModule.mapStateToProps, ConsultantGridModule.mapDispatchToProps)(ConsultantGridModule);