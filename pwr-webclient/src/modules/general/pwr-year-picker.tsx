import * as React from 'react';
import Icon from '@material-ui/core/Icon/Icon';
import {StringUtils} from '../../utils/StringUtil';
import dateToString = StringUtils.dateToString;

const DatePicker = require("material-ui-pickers").DatePicker;

console.log(DatePicker);

interface PwrYearPickerProps{
    onChange(date:Date):void;
    placeholderDate:Date;
    label:string;
}

interface PwrYearPickerState{
    selectedDate:Date
}

export class PwrYearPicker extends React.Component<PwrYearPickerProps,PwrYearPickerState>{

    constructor(props:PwrYearPickerProps){
        super(props);
        this.state = {
            selectedDate : props.placeholderDate
        }
    }


    render(){
        return <DatePicker
                autoOk
                label={this.props.label}
                placeholder={"Year"}
                value={this.props.placeholderDate}
                onChange={this.props.onChange}
                format="YYYY"
                openToYearSelection
                keyboard
                keyboardIcon={<Icon className={"material-icons"}>date_range</Icon>}
                disableOpenOnEnter
            />
    }
}