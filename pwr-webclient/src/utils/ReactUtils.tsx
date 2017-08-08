import * as React from 'react';
import {CSSProperties} from 'react';


export namespace ReactUtils {

    interface SelectableListProps {
        selectedIndex: number | string;
        onSelect(event: any, index: number | string): void;
        style?: CSSProperties;
    }

    export function wrapSelectableList(ComposedComponent: any) {
        return class SelectableList extends React.Component<SelectableListProps, {}> {

            handleRequestChange = (event: any, index: any) => {
                this.props.onSelect(event, index);
            };

            render() {
                return (
                    <ComposedComponent
                        value={this.props.selectedIndex}
                        onChange={this.handleRequestChange}
                        style={this.props.style}
                    >
                        {this.props.children}
                    </ComposedComponent>
                );
            }
        };
    }
}