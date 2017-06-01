import * as React from 'react';
import {IconButton} from 'material-ui';

interface AscDescButtonProps {
    initial?: 'asc'|'desc';
    onAscDescChange?(state: 'asc'|'desc'): void;
}

interface AscDescButtonState {
    currState: 'asc'|'desc';
    currentIconName: string;
}

export class AscDescButton extends React.Component<AscDescButtonProps, AscDescButtonState> {

    private readonly ascName: string = "ic_keyboard_arrow_up";
    private readonly descName: string = "ic_keyboard_arrow_down";

    public static defaultProps: Partial<AscDescButtonProps> = {
        initial: 'asc',
        onAscDescChange: () => {}
    };


    constructor(props: AscDescButtonProps) {
        super(props);
        this.state = {
            currState: props.initial,
            currentIconName: props.initial == 'asc' ? this.ascName : this.descName
        }
    }

    private handleButtonPress = () => {
        let newState: 'asc' | 'desc' = 'asc';
        let newIcon: string = this.ascName;
        if(this.state.currState == 'asc') {
            newState = 'desc';
            newIcon = this.descName;
        }
        this.setState({
            currState: newState,
            currentIconName: newIcon
        });
        this.props.onAscDescChange(this.state.currState);
    };

    render() {
        return ( <IconButton onClick={this.handleButtonPress} iconClassName="material-icons" size={20}>{this.state.currentIconName}</IconButton>);
    }
}
