import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ProfileElementType} from '../../../../../Store';
import {Dialog, IconButton, TextField} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {CareerEntry} from '../../../../../model/CareerEntry';
import {NameEntity} from '../../../../../model/NameEntity';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {isNullOrUndefined} from 'util';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import Tooltip from '@material-ui/core/Tooltip/Tooltip';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import Typography from '@material-ui/core/Typography/Typography';
import AutoSuggest from '../../../../general/auto-suggest_module';
import {DatePicker} from 'material-ui-pickers';
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider';
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils';


/**
 * Properties that are managed by react-redux.
 *
 * Each property defined here will also need a corresponding mapping in the {@link CareerEntryDialog.mapStateToProps} method,
 * otherwise the component will not render and update correctly.
 */
interface CareerEntryDialogProps {
    careers: Immutable.Map<string, NameEntity>
}

/**
 * Local properties of this module.
 *
 * These properties are used to initialize the local state and to control everything that is solely used for the display layer.
 *
 * Data that is intended not only for display needs to be placed in the {@link CareerEntryDialogProps} and will then be
 * managed by redux.
 */
interface CareerEntryDialogLocalProps {
    open: boolean;
    careerEntry: CareerEntry;
    requestClose(): void;

}

/**
 * Local state of the module.
 *
 * All display-only state fields, such as bool flags that define if an element is visibile or not, belong here.
 */
interface CareerEntryDialogLocalState {
    careerEntry: CareerEntry;
    autoCompleteValue: string;
    searchResult: string;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface CareerEntryDialogDispatch {
    saveEntry(entry: CareerEntry, nameEntity: NameEntity): void;
}

class CareerEntryDialogModule extends React.Component<
    CareerEntryDialogProps
    & CareerEntryDialogLocalProps
    & CareerEntryDialogDispatch, CareerEntryDialogLocalState> {

    constructor(props: CareerEntryDialogProps & CareerEntryDialogLocalProps & CareerEntryDialogDispatch) {
        super(props);
        this.state = {
            careerEntry: props.careerEntry,
            autoCompleteValue: NameEntityUtil.getNullTolerantName(props.careerEntry.nameEntityId(), props.careers),
            searchResult: "",
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: CareerEntryDialogLocalProps): CareerEntryDialogProps {
        return {
            careers: state.databaseReducer.careers()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): CareerEntryDialogDispatch {
        return {
            saveEntry: (entry, nameEntity) => dispatch(ProfileActionCreator.saveEntry(entry, nameEntity, ProfileElementType.CareerEntry))
        };
    }

    private closeDialog = () => {
        this.props.requestClose();
    };

    private changeStartDate = (date: Date) => {
        this.setState({
            careerEntry: this.state.careerEntry.startDate(date)
        });
    };

    private changeEndDate = (date: Date) => {
        this.setState({
            careerEntry: this.state.careerEntry.endDate(date)
        });

    };

    private handleAutoCompleteInput = (value: string) => {
        this.setState({
            autoCompleteValue: value
        });
    };

    private saveAndExit = () => {
        console.log("exit: ", this.state.autoCompleteValue,this.state.careerEntry);

        let name: string = this.state.autoCompleteValue;
        let career: NameEntity = ProfileStore.findNameEntityByName(name, this.props.careers);
        let careerEntry: CareerEntry = this.state.careerEntry;
        if(isNullOrUndefined(career)) {
            career = NameEntity.createNew(name);
        }
        careerEntry = careerEntry.nameEntityId(career.id());
        this.props.saveEntry(careerEntry, career);
        this.closeDialog();
    };

    private resetAndExit = () => {
        this.closeDialog();
    };

    private getEndDateButtonIconName = () => {
        if(isNullOrUndefined(this.state.careerEntry.endDate())) {
            return 'date_range';
        }
        return 'today';
    };

    private handleEndDateButtonClick = () => {
        if(isNullOrUndefined(this.state.careerEntry.endDate())) {
            this.changeEndDate(new Date());
        } else {
            this.changeEndDate( null);
        }
    };


    private handleOnSelect = (value:string) => {
      // den wert speicher und popper schließen
        console.log("AutoValue: ", this.state.searchResult);

        this.setState({
            searchResult: value,
        })
    };

    private renderEndDateChoice = () => {
            return <DatePicker
                label={PowerLocalize.get('End')}
                id={'CareerEntry.Dialog.EndDate' + this.props.careerEntry.id()}
                value={this.state.careerEntry.endDate()}
                onChange={this.changeEndDate}
                showTodayButton
                todayLabel={PowerLocalize.get('Today')}
                format = "DD.MM.YYYY"
            />;
    };

    render() {
        console.log("render_Career: ",this.state.autoCompleteValue);
        return <Dialog
            open={this.props.open}
            //title={PowerLocalize.get('CareerEntry.Dialog.Title')}
            onClose={this.closeDialog}
            scroll={'paper'}
            fullWidth
        >
            <DialogTitle>
                <Typography>{PowerLocalize.get('CareerEntry.Dialog.Title')}</Typography>
            </DialogTitle>
            <DialogContent>
            <div className="row">
                <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <DatePicker
                            autoOk
                            label={"Start Date"}
                            value={this.state.careerEntry.startDate()}
                            onChange={this.changeStartDate}
                            format = "DD.MM.YYYY"
                        />
                    </MuiPickersUtilsProvider>

                </div>
                <div className="col-md-5 col-sm-6">
                    {this.renderEndDateChoice()}

                </div>
            </div>

            <div className="row">
                <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                    <AutoSuggest
                        data={this.props.careers.map(NameEntityUtil.mapToName).toArray()}
                        searchTerm={this.state.autoCompleteValue}
                        onSearchChange={this.handleAutoCompleteInput}
                        onSelect={this.handleOnSelect}
                    />

                    {/*}TODO <AutoComplete
                        label={PowerLocalize.get('CareerEntry.Dialog.CareerName')}
                        id={'CarrerEntry.Dialog.Name' + this.props.careerEntry.id()}
                        value={this.state.autoCompleteValue}
                        searchText={this.state.autoCompleteValue}
                        dataSource={this.props.careers.map(NameEntityUtil.mapToName).toArray()}
                        onUpdateInput={this.handleAutoCompleteInput}
                        onNewRequest={this.handleAutoCompleteInput}
                        filter={AutoComplete.fuzzyFilter}
                    />*/}

                </div>
            </div>
            </DialogContent>
            <DialogActions>
                <Tooltip title={PowerLocalize.get('Action.Save')}>
                    <IconButton className="material-icons icon-size-20" onClick={this.saveAndExit}>save</IconButton>
                </Tooltip>
                <Tooltip title={PowerLocalize.get('Action.Exit')}>
                    <IconButton className="material-icons icon-size-20" onClick={this.resetAndExit}>close</IconButton>
                </Tooltip>
            </DialogActions>
        </Dialog>
    }
}

/**
 * @see CareerEntryDialogModule
 * @author nt
 * @since 12.06.2017
 */
export const CareerEntryDialog: React.ComponentClass<CareerEntryDialogLocalProps> = connect(CareerEntryDialogModule.mapStateToProps, CareerEntryDialogModule.mapDispatchToProps)(CareerEntryDialogModule);