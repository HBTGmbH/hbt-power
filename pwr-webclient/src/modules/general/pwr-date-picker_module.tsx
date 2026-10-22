import * as React from 'react';
import {Icon, Tooltip} from '@material-ui/core';
import {KeyboardDatePicker} from '@material-ui/pickers';
import {Moment} from 'moment/moment';
import {DatePickerType} from '../../model/DatePickerType';
import {PwrIconButton} from './pwr-icon-button';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {PwrMonthPicker} from './pwr-month-picker';
import {fromLocalDate, isInvalidDate, LocalDate, toLocalDate} from '../../utils/DateUtil';

interface PwrDatePickerProps {
    /** The chosen date; null if the field was emptied or set to open end. Not called while a typed date is incomplete */
    onChange(date: LocalDate | null): void;

    value: LocalDate | null;
    label: string;
    type: DatePickerType;
    disabled?: boolean;
    disableOpenEnd?: boolean;
    error?: boolean;
}

let nextFieldId = 0;

/**
 * Date field for LocalDate values (#26): converts to Date only for the underlying pickers, so no caller deals with
 * time zones.
 */
export class PwrDatePicker extends React.Component<PwrDatePickerProps> {

    // Ties the label to the input, so screen readers name the field "Geburtstag" instead of its placeholder
    private readonly fieldId = 'pwr-date-picker-' + (nextFieldId++);

    private changeDate = (date: Date | null | undefined) => {
        if (isInvalidDate(date)) {
            return;
        }
        this.props.onChange(toLocalDate(date));
    };

    /** An empty field means "today" only where an open end is allowed; elsewhere it is just empty */
    private getLabel = () => !this.props.value && !this.props.disableOpenEnd ? PowerLocalize.get('Today') : this.props.label;

    private renderPicker() {
        if (this.props.type === DatePickerType.MONTH_YEAR) {
            // Month and year in one popover instead of a two step dialog (#143)
            return <PwrMonthPicker value={fromLocalDate(this.props.value)}
                                   label={this.getLabel()}
                                   disabled={this.props.disabled}
                                   error={this.props.error}
                                   onChange={this.changeDate}/>;
        }
        // A popover at the field that opens on the month of the date; one click on a day takes it and closes, the year
        // on top leads to the list of years (#26)
        return <KeyboardDatePicker
            id={this.fieldId}
            variant="inline"
            autoOk
            views={['year', 'month', 'date']}
            openTo="date"
            format="DD.MM.YYYY"
            placeholder={PowerLocalize.get('DatePicker.Placeholder')}
            label={this.getLabel()}
            value={fromLocalDate(this.props.value)}
            disabled={this.props.disabled}
            error={!!this.props.error}
            onChange={(date: Moment | null) => this.changeDate(date?.toDate())}
            invalidDateMessage={PowerLocalize.get('DatePicker.Format')}
            minDateMessage={PowerLocalize.get('DatePicker.OutOfRange')}
            maxDateMessage={PowerLocalize.get('DatePicker.OutOfRange')}
            keyboardIcon={<Tooltip title={PowerLocalize.get('DatePicker.Open')}>
                <Icon className="material-icons">date_range</Icon>
            </Tooltip>}
            KeyboardButtonProps={{'aria-label': PowerLocalize.get('DatePicker.Open')}}
        />;
    }

    render() {
        // Field and open end button in one row, the button always 8 px next to the field, whatever the width of the
        // surrounding grid (#40); a grid item would give the button its share of the width instead
        return <div className="pwr-date-picker">
            {this.renderPicker()}
            {/* Not in read mode either: a disabled field shows only its value (#145) */}
            {this.props.disableOpenEnd || this.props.disabled ? <></> :
                <PwrIconButton
                    iconName={'send'}
                    tooltip={PowerLocalize.get('DatePicker.OpenEnd')}
                    disabled={this.props.disabled}
                    onClick={() => {
                        this.props.onChange(null);
                    }}/>}
        </div>;
    }
}
