import * as React from 'react';
import Icon from '@material-ui/core/Icon/Icon';
import {DatePickerType} from '../../model/DatePickerType';
import { KeyboardDatePicker } from '@material-ui/pickers'
import {PwrIconButton} from './pwr-icon-button';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {DatePickerView} from '@material-ui/pickers/DatePicker/DatePicker';
import {Moment} from 'moment/moment';

interface PwrDatePickerProps {
    onChange(date: Date): void;

    placeholderDate: Date;
    label: string;
    type: DatePickerType;
    disabled?: boolean;
    disableOpenEnd?: boolean;
    error?: boolean;
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

    private onChangeDate = (moment: Moment) => {
        this.props.onChange(moment?.toDate());
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

    private getViews = (): Array<DatePickerView> => {

        let views: DatePickerView[] = []
        switch (this.props.type) {
            case DatePickerType.FULL_DATE:
                views.push('date');
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
                views.push('date');
                views.push('month');
                views.push('year');
                break;
        }
        return views;
    };

    render() {
        // Field and open end button in one row, the button always 8 px next to the field, whatever the width of the
        // surrounding grid (#40); a grid item would give the button its share of the width instead
        return <div className="pwr-date-picker">
            <KeyboardDatePicker
                error={!!(this.props.error) ? this.props.error : false}
                autoOk
                disabled={this.props.disabled}
                views={this.getViews()}
                label={!!this.props.placeholderDate ? this.props.label : PowerLocalize.get('Today')}
                placeholder={!!this.props.placeholderDate ? this.props.label : PowerLocalize.get('Today')}
                value={this.props.placeholderDate}
                onChange={this.onChangeDate}
                format={this.getFormat()}
                openTo="year"
                keyboardIcon={<Icon className={'material-icons'}>date_range</Icon>}
            />
            {this.props.disableOpenEnd ? <></> :
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


