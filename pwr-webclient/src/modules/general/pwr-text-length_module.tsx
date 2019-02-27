import * as React from 'react';
import Icon from '@material-ui/core/Icon/Icon';
import {StringUtils} from '../../utils/StringUtil';
import dateToString = StringUtils.dateToString;
import LinearProgress from '@material-ui/core/LinearProgress/LinearProgress';

interface PwrTextLengthProps {
    value:string;
    maxChars: number;
    OnError(amt:number):void;
}

interface PwrTextLengthState {
    textCounter:number;
}

export class PwrTextLength extends React.Component<PwrTextLengthProps,PwrTextLengthState>{

    constructor(props:PwrTextLengthProps){
        super(props);
        this.state = {
            textCounter: 0,
        }
    }


    private progressValue = () => {
        let value:number = (this.props.value.length / this.props.maxChars) * 100;
        if(this.props.value.length > this.props.maxChars){
            this.props.OnError(this.props.value.length - this.props.maxChars);
        }
        return (this.props.value.length / this.props.maxChars) * 100;
    };


    render(){
        return <div>

            <LinearProgress
                value={this.progressValue()}
                variant='determinate'
                color='primary'
            />
            <div>Zeichen: {this.props.value.length}/{this.props.maxChars}</div>

        </div>
    }
}