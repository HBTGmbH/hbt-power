import * as React from 'react';
import {Children, ReactChild} from 'react';

interface PwrSelectableListProps {

}

interface PwrSelectableListState {
    selectedIndex:number;
}

export class PwrSelectableList extends React.Component<PwrSelectableListProps, PwrSelectableListState> {

    constructor(props:PwrSelectableListProps){
        super(props);
        this.state = {
            selectedIndex:-1,
        }
    }

    handleClick = (index, event, child) => {
        if (child.props.onClick) {
            child.props.onClick(event);
        }
        this.setState({
            selectedIndex: index
        })
    };

    isSelected = (index: number) => {
        return this.state.selectedIndex === index;
    };

    mapChild = (child: ReactChild, index: number): any => {
        if (child) {
            return React.cloneElement(child as any, {
                onClick: (event) => {
                    this.handleClick(index, event, child);
                },
                className: this.isSelected(index) ? 'pwr-selected-list-item' : ''
            });
        } else {
            return child;
        }
    };

    render() {
        return <React.Fragment>
            {Children.map(this.props.children, this.mapChild)}
        </React.Fragment>
    }
}
