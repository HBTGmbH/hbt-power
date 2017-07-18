import * as React from 'react';

export namespace ReactUtils {
    export function wrapSelectableList(ComposedComponent: any) {
        return class SelectableList extends React.Component<{selectedIndex: number | string, onSelect(index: number | string): void}, {}> {

            handleRequestChange = (event: any, index: any) => {
                this.props.onSelect(index);
            };

            render() {
                return (
                    <ComposedComponent
                        value={this.props.selectedIndex}
                        onChange={this.handleRequestChange}
                    >
                        {this.props.children}
                    </ComposedComponent>
                );
            }
        };
    }
}