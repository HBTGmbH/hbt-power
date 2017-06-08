import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../Store';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import {GridTile, IconButton} from 'material-ui';
import {getProfileImageLocation} from '../../../API_CONFIG';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';

/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link ConsultantTile.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface ConsultantTileProps {
    consultantInfo: ConsultantInfo;
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link ConsultantTileProps} and will then be
 * managed by redux.
 */
interface ConsultantTileLocalProps {
    initials: string;
}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface ConsultantTileLocalState {

}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface ConsultantTileDispatch {
    redirectToUser(initials: string): void;
}

class ConsultantTileModule extends React.Component<
    ConsultantTileProps
    & ConsultantTileLocalProps
    & ConsultantTileDispatch, ConsultantTileLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ConsultantTileLocalProps): ConsultantTileProps {
        return {
            consultantInfo: state.adminReducer.consultantsByInitials().get(localProps.initials),
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ConsultantTileDispatch {
        return {
            redirectToUser: initials => dispatch(AdminActionCreator.AsyncRedirectToUser(initials))
        }
    }

    render() {
        return (
        <GridTile
            key={"ConsultantTile." + this.props.initials}
            title={this.props.consultantInfo.getFullName()}
            actionIcon={<IconButton
                iconClassName="material-icons"
                iconStyle={{color: "white"}}
                onClick={() => this.props.redirectToUser(this.props.initials)}
            >edit</IconButton>}
            actionPosition="right"
            titlePosition="top"
            titleBackground="linear-gradient(to bottom, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.3) 70%,rgba(0,0,0,0) 100%)"
            cols={1}
            rows={1}
            style={{width: "300px", height: "300px"}}

        >
            <img src={getProfileImageLocation(this.props.consultantInfo.initials())}/>
        </GridTile>);
    }
}

/**
 * @see ConsultantTileModule
 * @author nt
 * @since 07.06.2017
 */
export const ConsultantTile: React.ComponentClass<ConsultantTileLocalProps> = connect(ConsultantTileModule.mapStateToProps, ConsultantTileModule.mapDispatchToProps)(ConsultantTileModule);