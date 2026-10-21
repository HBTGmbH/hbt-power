import {connect} from 'react-redux';
import * as React from 'react';
import {Button, Checkbox, GridList, Icon, InputLabel, MenuItem, Select} from '@material-ui/core';
import {ConsultantInfo} from '../../../model/ConsultantInfo';
import * as Immutable from 'immutable';
import {ConsultantTile} from './consultant-tile_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ConsultantCreateDialog} from './consultant-create-dialog_module';
import {ApplicationState} from '../../../reducers/reducerIndex';
import FormControl from '@material-ui/core/FormControl/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel';
import {ThunkDispatch} from 'redux-thunk';
import {ProfileServiceClient} from '../../../clients/ProfileServiceClient';
import {ProfileCheckSummary} from '../../../model/check/ProfileCheck';

interface ConsultantGridProps {
    consultantsByInitials: Immutable.Map<string, ConsultantInfo>;
}

interface ConsultantGridLocalProps {

}

type ConsultantSort = 'name' | 'profileCheck';

interface ConsultantGridLocalState {
    createDialogOpen: boolean;
    showInactive: boolean;
    /** Profile check per initials (#139); empty while loading or if it failed */
    summaries: Immutable.Map<string, ProfileCheckSummary>;
    sort: ConsultantSort;
}

interface ConsultantGridDispatch {
    refreshConsultants(): void;

}

class ConsultantGridModule extends React.Component<ConsultantGridProps
    & ConsultantGridLocalProps
    & ConsultantGridDispatch, ConsultantGridLocalState> {

    constructor(props: ConsultantGridProps & ConsultantGridLocalProps & ConsultantGridDispatch) {
        super(props);
        this.state = {
            createDialogOpen: false,
            showInactive: false,
            summaries: Immutable.Map<string, ProfileCheckSummary>(),
            sort: 'name',
        };
    }

    static mapStateToProps(state: ApplicationState): ConsultantGridProps {
        return {
            consultantsByInitials: state.adminReducer.consultantsByInitials
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ConsultantGridDispatch {
        return {
            refreshConsultants: () => dispatch(AdminActionCreator.AsyncGetAllConsultants())
        };
    }

    public componentDidMount() {
        this.refresh();
    }

    private refresh = () => {
        this.props.refreshConsultants();
        ProfileServiceClient.instance().getProfileCheckSummaries()
            .then(summaries => this.setState({
                summaries: Immutable.Map<string, ProfileCheckSummary>(summaries.map(summary => [summary.initials, summary]))
            }))
            .catch(() => this.setState({summaries: Immutable.Map<string, ProfileCheckSummary>()}));
    };

    /**
     * Most hints first, on a tie the one with more outdated hints. Consultants without a check (inactive) last.
     */
    private sortKey = (consultant: ConsultantInfo): string | number => {
        if (this.state.sort === 'name') {
            return consultant.lastName();
        }
        const summary = this.state.summaries.get(consultant.initials());
        return summary ? -(summary.hintCount * 1000 + summary.outdatedCount) : 1;
    };

    private showDialog = () => {
        this.setState({
            createDialogOpen: true
        });
    };

    private hideDialog = () => {
        this.setState({
            createDialogOpen: false
        });
    };

    private filterInactive = (v: ConsultantInfo) => {
        if (!this.state.showInactive) {
            return v.active();
        }
        return true;
    };

    render() {
        return (
            <div>
                <ConsultantCreateDialog
                    show={this.state.createDialogOpen}
                    onClose={this.hideDialog}
                />
                <div className="row">
                    <Button
                        variant={'contained'}
                        style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}

                        onClick={this.refresh}
                    >
                        <Icon className="material-icons">refresh</Icon>
                        {PowerLocalize.get('Action.Update')}
                    </Button>
                    <Button
                        variant={'contained'}
                        style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}
                        onClick={this.showDialog}
                    >
                        <Icon className="material-icons">add</Icon>
                        {PowerLocalize.get('Action.CreateNewConsultant')}
                    </Button>
                    <FormControl style={{marginTop: '10px', marginBottom: '10px', marginRight: '15px'}}>
                        <FormControlLabel
                            control={<Checkbox
                                checked={this.state.showInactive}
                                onChange={(e: object, v: boolean) => this.setState({showInactive: v})}/>}
                            label={PowerLocalize.get('ConsultantGrid.ShowInactive')}
                        />

                    </FormControl>
                    <FormControl variant="filled" style={{marginTop: '10px', marginBottom: '10px', minWidth: '200px'}}>
                        <InputLabel id="consultant-sort-label">{PowerLocalize.get('ConsultantGrid.Sort')}</InputLabel>
                        <Select labelId="consultant-sort-label" value={this.state.sort}
                                onChange={(e) => this.setState({sort: e.target.value as ConsultantSort})}>
                            <MenuItem value={'name'}>{PowerLocalize.get('ConsultantGrid.Sort.Name')}</MenuItem>
                            <MenuItem value={'profileCheck'}>{PowerLocalize.get('ConsultantGrid.Sort.ProfileCheck')}</MenuItem>
                        </Select>
                    </FormControl>
                </div>
                <div className="row">
                    <GridList
                        cols={4}
                        cellHeight={310}
                        spacing={1}
                    >
                        {
                            this.props.consultantsByInitials
                                .filter(this.filterInactive)
                                .sortBy(this.sortKey)
                                .map(consultantInfo => {
                                    return <ConsultantTile key={'ConsultantTile.' + consultantInfo.initials()}
                                                           initials={consultantInfo.initials()}
                                                           profileCheck={this.state.summaries.get(consultantInfo.initials())}/>;
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
export const ConsultantGrid = connect(ConsultantGridModule.mapStateToProps, ConsultantGridModule.mapDispatchToProps)(ConsultantGridModule);
