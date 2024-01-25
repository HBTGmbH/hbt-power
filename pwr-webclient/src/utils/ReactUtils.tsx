import * as React from 'react';
import {ChangeEvent, CSSProperties, PropsWithChildren} from 'react';
import {Theme} from '@material-ui/core';


export namespace ReactUtils {

    interface SelectableListProps {
        selectedIndex: number | string;

        onSelect(event: any, index: number | string): void;

        style?: CSSProperties;
    }

    export const BTN_SIZE_20 = {
        width: 20,
        height: 20
    };

    export function wrapSelectableList(ComposedComponent: any) {
        return class SelectableList extends React.Component<SelectableListProps & PropsWithChildren, {}> {

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

export interface ThemeProps {
    theme: Theme;
}

export function provideValueTo(handler: (v: string) => void): React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        handler(e.target.value);
    };
}
