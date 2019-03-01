import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ProfileElementType} from '../../../../../Store';
import {Dialog} from '@material-ui/core';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {CareerEntry} from '../../../../../model/CareerEntry';
import {NameEntity} from '../../../../../model/NameEntity';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {isNullOrUndefined} from 'util';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {ApplicationState} from '../../../../../reducers/reducerIndex';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import {PwrIconButton} from '../../../../general/pwr-icon-button';
import {PwrAutoComplete} from '../../../../general/pwr-auto-complete';
import {PwrSpacer} from '../../../../general/pwr-spacer_module';
import {PwrYearPicker} from '../../../../general/pwr-year-picker';
import {PwrError, PwrErrorType} from '../../../../general/pwr-error_module';


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
    dateError: PwrErrorType;
}

/**
 * Defines mappings from local handlers to redux dispatches that invoke actions on the store.
 */
interface CareerEntryDialogDispatch {
    saveEntry(entry: CareerEntry, nameEntity: NameEntity): void;
}

class CareerEntryDialogModule extends React.Component<CareerEntryDialogProps
    & CareerEntryDialogLocalProps
    & CareerEntryDialogDispatch, CareerEntryDialogLocalState> {

    constructor(props: CareerEntryDialogProps & CareerEntryDialogLocalProps & CareerEntryDialogDispatch) {
        super(props);
        this.state = {
            careerEntry: props.careerEntry,
            autoCompleteValue: NameEntityUtil.getNullTolerantName(props.careerEntry.nameEntityId(), props.careers),
            searchResult: '',
            dateError: null,
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

    public componentDidUpdate() {
        this.checkDates();
    }

    private closeDialog = () => {
        this.props.requestClose();
    };

    private setError = (error: PwrErrorType) => {
        if (this.state.dateError !== error) {
            this.setState({
                dateError: error,
            });
        }
    };

    private changeStartDate = (date: Date) => {
        this.setState({
            careerEntry: this.state.careerEntry.startDate(date)
        });
        this.checkDates();
    };

    private changeEndDate = (date: Date) => {
        this.setState({
            careerEntry: this.state.careerEntry.endDate(date)
        });
        this.checkDates();
    };

    private checkDates = () => {
        const endDate = this.state.careerEntry.endDate();
        const startDate = this.state.careerEntry.startDate();
        if (endDate < startDate) {
            this.setError(PwrErrorType.DATE_START_AFTER_END);
        } else {
            this.setError(null);
        }
    };

    private handleAutoCompleteInput = (value: string) => {
        this.setState({
            autoCompleteValue: value
        });
    };

    private saveAndExit = () => {
        console.log('exit: ', this.state.autoCompleteValue, this.state.careerEntry);

        let name: string = this.state.autoCompleteValue;
        let career: NameEntity = ProfileStore.findNameEntityByName(name, this.props.careers);
        let careerEntry: CareerEntry = this.state.careerEntry;
        if (isNullOrUndefined(career)) {
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
        if (isNullOrUndefined(this.state.careerEntry.endDate())) {
            return 'date_range';
        }
        return 'today';
    };

    private handleEndDateButtonClick = () => {
        if (isNullOrUndefined(this.state.careerEntry.endDate())) {
            this.changeEndDate(new Date());
        } else {
            this.changeEndDate(null);
        }
    };


    private handleOnSelect = (value: string) => {
        // den wert speicher und popper schließen
        //console.log("AutoValue: ", this.state.searchResult);

        this.setState({
            searchResult: value,
        });
    };


    render() {
        return <Dialog
            open={this.props.open}
            onClose={this.closeDialog}
            fullWidth
            aria-labelledby="CarrerEntry.Dialog.Title"
        >
            <DialogTitle id="CarrerEntry.Dialog.Title">
                {PowerLocalize.get('CareerEntry.Dialog.Title')}
            </DialogTitle>
            <DialogContent>
                <div className={'row'}>
                    <div className={'col-md-12'}>
                        <PwrError error={this.state.dateError}/>
                    </div>
                </div>
                <PwrSpacer double={false}/>
                <div className="row">
                    <div className="col-md-5 col-sm-6 col-sm-offset-0">
                        <PwrYearPicker
                            label={'Start'}
                            onChange={this.changeStartDate}
                            placeholderDate={this.state.careerEntry.startDate()}
                        />

                    </div>
                    <div className="col-md-5 col-sm-6">
                        <PwrYearPicker
                            label={'Ende'}
                            onChange={this.changeEndDate}
                            placeholderDate={this.state.careerEntry.endDate()}
                        />
                    </div>
                </div>
                <PwrSpacer double={true}/>
                <div className="row">
                    <div className="col-md-10">
                        <PwrAutoComplete data={this.props.careers.map(NameEntityUtil.mapToName).toArray()}
                                         label={PowerLocalize.get('CareerEntry.Dialog.CareerName')}
                                         fullWidth={true}
                                         searchTerm={this.state.autoCompleteValue}
                                         onSearchChange={this.handleAutoCompleteInput}
                        />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <PwrIconButton iconName={'save'} tooltip={PowerLocalize.get('Action.Save')}
                               disabled={!!this.state.dateError}
                               onClick={this.saveAndExit}/>
                <PwrIconButton iconName={'close'} tooltip={PowerLocalize.get('Action.Exit')}
                               onClick={this.resetAndExit}/>
            </DialogActions>
        </Dialog>;
    }
}

/**
 * @see CareerEntryDialogModule
 * @author nt
 * @since 12.06.2017
 */
export const CareerEntryDialog: React.ComponentClass<CareerEntryDialogLocalProps> = connect(CareerEntryDialogModule.mapStateToProps, CareerEntryDialogModule.mapDispatchToProps)(CareerEntryDialogModule);