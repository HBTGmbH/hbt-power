import * as React from 'react';
import Icon from '@material-ui/core/Icon/Icon';
import {StringUtils} from '../../utils/StringUtil';
import dateToString = StringUtils.dateToString;
import {DatePickerType} from '../../model/DatePickerType';
import {DatePicker} from 'material-ui-pickers';
import {isNullOrUndefined} from 'util';
import Button from '@material-ui/core/es/Button/Button';
import {PwrIconButton} from './pwr-icon-button';
import Grid from '@material-ui/core/Grid/Grid';

interface PwrDatePickerProps {
    onChange(date: Date): void;

    placeholderDate: Date;
    label: string;
    type: DatePickerType;
    today?: boolean;
}

interface PwrDatePickerState {
    selectedDate: Date,
    isOpenEnd: boolean,
}

export class PwrDatePicker extends React.Component<PwrDatePickerProps, PwrDatePickerState> {

    constructor(props: PwrDatePickerProps) {
        super(props);
        this.state = {
            selectedDate: props.placeholderDate,
            isOpenEnd: false,
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

    private handleOpenEnd = () => {
        this.setState({isOpenEnd: !this.state.isOpenEnd});
        this.props.onChange(null);
    };

    render() {
        return <Grid item container spacing={8} alignItems={'flex-start'} direction={'row'}>
            <Grid item>
                <DatePicker
                    autoOk
                    views={this.getViews()}
                    label={this.state.isOpenEnd ? 'Heute' : this.props.label}
                    placeholder={'Heute'}
                    value={this.props.placeholderDate}
                    onChange={this.props.onChange}
                    format={this.getFormat()}
                    openToYearSelection
                    keyboard
                    keyboardIcon={<Icon className={'material-icons'}>date_range</Icon>}
                    disableOpenOnEnter
                    disabled={this.state.isOpenEnd}
                />
            </Grid>
            {
                this.props.today == true ?
                    <Grid item>
                        <PwrIconButton
                            iconName={this.state.isOpenEnd ? 'today' : 'send'}
                            tooltip={this.state.isOpenEnd ? 'Datum eingeben' : 'Noch kein Ende'}
                            onClick={this.handleOpenEnd}
                        />
                    </Grid>
                    : <></>
            }
        </Grid>;
    }
}