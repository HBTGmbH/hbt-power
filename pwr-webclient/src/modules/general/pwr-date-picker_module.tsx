import * as React from 'react';
import Icon from '@material-ui/core/Icon/Icon';
import {StringUtils} from '../../utils/StringUtil';
import {DatePickerType} from '../../model/DatePickerType';
import {DatePicker} from 'material-ui-pickers';

interface PwrDatePickerProps {
    onChange(date: Date): void;

    placeholderDate: Date;
    label: string;
    type: DatePickerType;
    disabled?: boolean;
}

interface PwrDatePickerState {
    selectedDate: Date
}

export class PwrDatePicker extends React.Component<PwrDatePickerProps, PwrDatePickerState> {

    constructor(props: PwrDatePickerProps) {
        super(props);
        this.state = {
            selectedDate: props.placeholderDate
        };
    }

    private onChangeDate = (date: Date) => {
        date.setFullYear(date.getFullYear(),
            this.props.type != DatePickerType.YEAR ? date.getMonth() : 1,
            this.props.type == DatePickerType.FULL_DATE ? date.getDate() : 1);

        this.props.onChange(date);
    };

    private getFormat = () => {
        switch (this.props.type) {
            case DatePickerType.FULL_DATE:
                return 'DD.MM.YYYY';
            case DatePickerType.MONTH_YEAR:
                return 'MM.YYYY';
            case DatePickerType.YEAR:
                return 'YYYY';
        }
    };

    private getViews = () => {

        let views: Array<'year' | 'month' | 'day'> = new Array(0);
        switch (this.props.type) {
            case DatePickerType.FULL_DATE:
                views.push('day');
                views.push('month');
                views.push('year');
                break;
            case DatePickerType.MONTH_YEAR:
                views.push('month');
                views.push('year');
                break;
            case DatePickerType.YEAR:
                views.push('year');
                break;
            default:
                views.push('day');
                views.push('month');
                views.push('year');
                break;
        }
        return views;
    };

    render() {
        return <DatePicker
            autoOk
            disabled={this.props.disabled}
            views={this.getViews()}
            label={this.props.label}
            placeholder={this.props.label}
            value={this.props.placeholderDate}
            onChange={this.props.onChange}
            format={this.getFormat()}
            openToYearSelection
            keyboard
            keyboardIcon={<Icon className={'material-icons'}>date_range</Icon>}
            disableOpenOnEnter
        />;
    }
}
