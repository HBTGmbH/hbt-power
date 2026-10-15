import * as React from 'react';
import {Collapse, IconButton, List, ListItem} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

interface PwrTreeProps<T> {
    nodes: Array<PwrTreeNode<T>>;

    contentRenderFunction(payload: T): any;

    toggleNode(node: PwrTreeNode<T>): void;

    onSelect?(node: PwrTreeNode<T>): void;
}

interface PwrTreeState {

}

export interface PwrTreeNode<T> {
    payload: T,
    /**
     * This is used to avoid unnecessary re-rendering with react. Must be unique through ALL nodes as nodes
     * are rendered as simple list!
     */
    id: any,
    children: Array<PwrTreeNode<T>>;
    expanded: boolean;
    selected?: boolean;
}

export class PwrTree<T> extends React.Component<PwrTreeProps<T>, PwrTreeState> {

    handleSelect = (node: PwrTreeNode<T>) => {
        if (!!this.props.onSelect) {
            this.props.onSelect(node);
        }
    };

    expandLessButton = (node: PwrTreeNode<T>) => {
        return <IconButton style={{width: 32, height: 32}} color="primary" onClick={() => this.props.toggleNode(node)}
                           component="span">
            <ExpandLess/>
        </IconButton>;
    };

    expandMoreButton = (node: PwrTreeNode<T>) => {
        return <IconButton style={{width: 32, height: 32}} color="primary" onClick={() => this.props.toggleNode(node)}
                           component="span">
            <ExpandMore/>
        </IconButton>;
    };

    nodeWithoutChildren = (node: PwrTreeNode<T>) => {
        return <React.Fragment key={node.id}>
            <ListItem button
                      className={node.selected ? 'pwr-selected-list-item ' : ''}
                      key={node.id}
                      onClick={(e: any) => this.handleSelect(node)}>
                {this.props.contentRenderFunction(node.payload)}
            </ListItem>
        </React.Fragment>;
    };

    nodeWithChildren = (node: PwrTreeNode<T>): any => {
        return <React.Fragment key={node.id}>
            <ListItem className={node.selected ? 'pwr-selected-list-item ' : ''}
                      button
                      onClick={(e: any) => this.handleSelect(node)}
            >
                {this.props.contentRenderFunction(node.payload)}
                {node.expanded ? this.expandLessButton(node) : this.expandMoreButton(node)}
            </ListItem>
            <Collapse className="tree-leaf" in={node.expanded} timeout="auto" unmountOnExit>
                <List>
                    {node.children.map(this.renderNode)}
                </List>
            </Collapse>
        </React.Fragment>;
    };

    renderNode = (node: PwrTreeNode<T>) => {
        if (node.children.length > 0) {
            return this.nodeWithChildren(node);
        } else {
            return this.nodeWithoutChildren(node);
        }
    };

    render() {
        return (<List>
            {this.props.nodes.map(this.renderNode)}
        </List>);
    }
}
