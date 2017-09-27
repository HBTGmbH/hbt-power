import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import * as Immutable from 'immutable';
import {ProfileElementType} from '../../../../../Store';
import {AutoComplete, DatePicker, Dialog, IconButton, TextField} from 'material-ui';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';
import {formatToShortDisplay} from '../../../../../utils/DateUtil';
import {CareerEntry} from '../../../../../model/CareerEntry';
import {NameEntity} from '../../../../../model/NameEntity';
import {NameEntityUtil} from '../../../../../utils/NameEntityUtil';
import {ProfileStore} from '../../../../../model/ProfileStore';
import {isNullOrUndefined} from 'util';
import {ProfileActionCreator} from '../../../../../reducers/profile/ProfileActionCreator';
import {ApplicationState} from '../../../../../reducers/reducerIndex';


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
            autoCompleteValue: NameEntityUtil.getNullTolerantName(props.careerEntry.nameEntityId(), props.careers)
        };
    }

    static mapStateToProps(state: ApplicationState, localProps: CareerEntryDialogLocalProps): CareerEntryDialogProps {
        return {
            careers: state.databaseReducer.careers()
        }
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): CareerEntryDialogDispatch {
        return {
            saveEntry: (entry, nameEntity) => dispatch(ProfileActionCreator.saveEntry(entry, nameEntity, ProfileElementType.CareerEntry))
        }
    }

    private closeDialog = () => {
        this.props.requestClose();
    };

    private changeStartDate = (evt: any, date: Date) => {
        this.setState({
            careerEntry: this.state.careerEntry.startDate(date)
        })
    };

    private changeEndDate = (evt: any, date: Date) => {
        console.log(date);
        this.setState({
            careerEntry: this.state.careerEntry.endDate(date)
        })

    };

    private handleAutoCompleteInput = (value: string) => {
        this.setState({
            autoCompleteValue: value
        })
    };

    private saveAndExit = () => {
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
            return "date_range";
        }
        return "today";
    };

    private handleEndDateButtonClick = () => {
        if(isNullOrUndefined(this.state.careerEntry.endDate())) {
            this.changeEndDate(null, new Date());
        } else {
            this.changeEndDate(null, null);
        }
    };

    private renderEndDateChoice = () => {
        if(isNullOrUndefined(this.state.careerEntry.endDate())) {
            return <TextField
                style={{width: "80%", float: "left"}}
                floatingLabelText={PowerLocalize.get('End')}
                disabled={true}
                value={PowerLocalize.get("Today")}
            />
        } else {
            return <DatePicker
                style={{width: "80%", float: "left"}}
                floatingLabelText={PowerLocalize.get('End')}
                id={'CareerEntry.Dialog.EndDate' + this.props.careerEntry.id()}
                container="inline"
                value={this.state.careerEntry.endDate()}
                onChange={this.changeEndDate}
                formatDate={formatToShortDisplay}
            />
        }
    };

    render() {
        return (<Dialog
            open={this.props.open}
            modal={false}
            title={PowerLocalize.get('CareerEntry.Dialog.Title')}
            onRequestClose={this.closeDialog}
            autoScrollBodyContent={true}
            actions={[<IconButton size={20} iconClassName="material-icons" onClick={this.saveAndExit} tooltip={PowerLocalize.get('Action.Save')}>save</IconButton>,
            <IconButton size={20} iconClassName="material-icons" onClick={this.resetAndExit} tooltip={PowerLocalize.get('Action.Exit')}>close</IconButton>]}
        >
            <div className="row">
                <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">
                    <DatePicker
                        floatingLabelText={PowerLocalize.get('Begin')}
                        id={'CareerEntry.Dialog.StartDate' + this.props.careerEntry.id()}
                        container="inline"
                        value={this.state.careerEntry.startDate()}
                        onChange={this.changeStartDate}
                        formatDate={formatToShortDisplay}
                    />
                </div>
                <div className="col-md-5 col-sm-6">
                    <IconButton
                        style={{width: "20%", float:"left", marginTop: "20px"}}
                        iconClassName="material-icons"
                        onClick={this.handleEndDateButtonClick}
                    >
                        {this.getEndDateButtonIconName()}
                    </IconButton>
                    {this.renderEndDateChoice()}

                </div>
            </div>

            <div className="row">
                <div className="col-md-5 col-sm-6 col-md-offset-1 col-sm-offset-0">

                    <AutoComplete
                        floatingLabelText={PowerLocalize.get('CareerEntry.Dialog.CareerName')}
                        id={'CarrerEntry.Dialog.Name' + this.props.careerEntry.id()}
                        value={this.state.autoCompleteValue}
                        searchText={this.state.autoCompleteValue}
                        dataSource={this.props.careers.map(NameEntityUtil.mapToName).toArray()}
                        onUpdateInput={this.handleAutoCompleteInput}
                        onNewRequest={this.handleAutoCompleteInput}
                        filter={AutoComplete.fuzzyFilter}
                    />
                </div>
            </div>
        </Dialog>);
    }
}

/**
 * @see CareerEntryDialogModule
 * @author nt
 * @since 12.06.2017
 */
export const CareerEntryDialog: React.ComponentClass<CareerEntryDialogLocalProps> = connect(CareerEntryDialogModule.mapStateToProps, CareerEntryDialogModule.mapDispatchToProps)(CareerEntryDialogModule);