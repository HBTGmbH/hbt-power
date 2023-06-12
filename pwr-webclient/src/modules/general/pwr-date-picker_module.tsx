import * as React from 'react';
import Icon from '@material-ui/core/Icon/Icon';
import {DatePickerType} from '../../model/DatePickerType';
import { KeyboardDatePicker } from '@material-ui/pickers'
import Grid from '@material-ui/core/Grid/Grid';
import {PwrIconButton} from './pwr-icon-button';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {isNullOrUndefined} from 'util';
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
        return <Grid container item direction={'row'} justify={'flex-start'} alignItems={'flex-end'} spacing={8}>
            <Grid item md>
                <KeyboardDatePicker
                    error={!isNullOrUndefined(this.props.error) ? this.props.error : false}
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
            </Grid>
            {this.props.disableOpenEnd ? <></> :
                <Grid item md={2}>
                    <PwrIconButton
                        iconName={'send'}
                        tooltip={'Open End'}
                        style={{fontSize: '1em', marginRight: 0}}
                        onClick={() => {
                            this.props.onChange(null);
                        }}>
                        Open End
                    </PwrIconButton>
                </Grid>}
        </Grid>;
    }
}


