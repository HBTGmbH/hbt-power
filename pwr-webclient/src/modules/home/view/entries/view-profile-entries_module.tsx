import * as React from 'react';
import {ReactNode} from 'react';
import {SortableContainer, SortableElement, SortableHandle, SortStart} from 'react-sortable-hoc';
import {Collapse, Icon, Paper, Switch, Typography} from '@material-ui/core';
import {IViewEntry} from '../../../../model/view/IViewEntry';
import {PwrIconButton} from '../../../general/pwr-icon-button';
import {PowerLocalize} from '../../../../localization/PowerLocalizer';

/**
 * The column a table was last sorted by (#149): only its header shows the arrow, the others on hover
 */
export interface SortedColumn {
    label: string;

    setLabel(label: string): void;
}

export const SortedColumnContext = React.createContext<SortedColumn | null>(null);

/** The name: the width the fixed columns leave */
export const FREE_WIDTH = 'minmax(0, 1fr)';

/**
 * A column of the entries of a view profile (#149). All tables share one template: drag handle and switch, the name
 * with the free width, the other columns with fixed widths at the right end. So dates, levels and the like of tables
 * below each other line up.
 */
export interface ViewEntryColumn<T> {
    header: ReactNode;
    /** Track of the CSS grid, FREE_WIDTH by default */
    width?: string;

    render(entry: T, entryIndex: number): ReactNode;
}

interface ViewProfileEntriesProps<T extends IViewEntry> {
    entries: Array<T>;
    columns: Array<ViewEntryColumn<T>>;
    toggleableEntryType: string;
    movableEntryType: string;
    moveDisabled?: boolean;
    /** Each entry a card, side by side, instead of a row (skill categories) */
    cards?: boolean;
    /** Shown instead of the table without entries */
    emptyText?: string;
    /** No header row, e.g. when the sorting sits in the heading of the section */
    hideHeader?: boolean;
    /** The column last sorted by, kept outside when the sorting sits outside (heading); the table's own otherwise */
    sortedColumn?: SortedColumn;

    /** Content below an entry, opened by the button at its end or by clicking the entry; closed at first */
    renderDetails?(entry: T, entryIndex: number): ReactNode;

    onToggle(toggleableEntryType: string, index: number, isEnabled: boolean): void;

    onMove(movableEntryType: string, sourceIndex: number, targetIndex: number): void;
}

/** On narrow screens the columns after the first go below it (index.css) */
function secondary(columnIndex: number): string {
    return columnIndex > 0 ? ' pwr-view-entries-secondary' : '';
}

/**
 * Argument of onSortOver, which react-sortable-hoc has but @types/react-sortable-hoc doesn't know yet. The nodes are
 * the refs of its manager with their offsets in the list.
 */
interface SortOver {
    index: number;
    newIndex: number;
    nodes: Array<{ node: HTMLElement & { sortableInfo: { index: number } }, edgeOffset: { left: number, top: number } }>;
}

interface ViewProfileEntriesState {
    /** Keys of the opened entries; a key stays the same when an entry moves */
    expanded: Array<string>;
    /** Label of the column last sorted by */
    sortedColumn: string;
}

interface SortableItemProps<T> {
    entry: T;
    entryIndex: number;
    expanded: boolean;
}

export class ViewProfileEntries<T extends IViewEntry> extends React.Component<ViewProfileEntriesProps<T>, ViewProfileEntriesState> {

    public static defaultProps: Partial<ViewProfileEntriesProps<any>> = {
        moveDisabled: false,
        cards: false,
    };

    constructor(props: ViewProfileEntriesProps<T>) {
        super(props);
        this.state = {
            expanded: [],
            sortedColumn: null,
        };
    }

    private setSortedColumn = (label: string) => {
        this.setState({sortedColumn: label});
    };

    private sorted(): SortedColumn {
        return this.props.sortedColumn || {label: this.state.sortedColumn, setLabel: this.setSortedColumn};
    }

    /** The entry being dragged, which stays in the list as the dashed drop target */
    private dropTarget: HTMLElement = null;

    private handleToggle = (entryIndex: number, checked: boolean) => {
        this.props.onToggle(this.props.toggleableEntryType, entryIndex, checked);
    };

    private onSortStart = (sort: SortStart) => {
        this.dropTarget = sort.node as HTMLElement;
        this.dropTarget.classList.add('pwr-view-entries-drop-target');
    };

    /**
     * The library moves the other entries aside and leaves a gap where the dragged one lands. The dragged entry itself
     * stays in the list (hideSortableGhost off) and is moved into that gap, so the drop target shows dashed.
     */
    private onSortOver = (sort: SortOver) => {
        if (!this.dropTarget) {
            return;
        }
        const nodes = sort.nodes;
        const at = (index: number) => nodes.find(n => n.node.sortableInfo.index === index);
        let x = 0;
        let y = 0;
        if (this.props.cards) {
            // Cards side by side: the gap is the place of the card at the new index
            const from = at(sort.index).edgeOffset;
            const to = at(sort.newIndex).edgeOffset;
            x = to.left - from.left;
            y = to.top - from.top;
        } else {
            // Rows of different heights: the dragged one moves past the rows between the old and the new index
            const between = nodes.filter(n => {
                const index = n.node.sortableInfo.index;
                return sort.newIndex > sort.index ? index > sort.index && index <= sort.newIndex
                    : index >= sort.newIndex && index < sort.index;
            });
            const height = between.reduce((sum, n) => sum + n.node.offsetHeight, 0);
            y = sort.newIndex > sort.index ? height : -height;
        }
        this.dropTarget.style.transitionDuration = '300ms';
        this.dropTarget.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    private onSortEnd = (data: { oldIndex: number, newIndex: number }) => {
        if (this.dropTarget) {
            // The library resets the transform of all entries
            this.dropTarget.classList.remove('pwr-view-entries-drop-target');
            this.dropTarget = null;
        }
        if (data.oldIndex !== data.newIndex) {
            this.props.onMove(this.props.movableEntryType, data.oldIndex, data.newIndex);
            // Moved by hand: no longer sorted by any column, so no arrow
            this.sorted().setLabel(null);
        }
    };

    private entryKey(entry: T): string {
        const id = (entry as any).id;
        return this.props.movableEntryType + '_' + entry.name + (id != null ? '_' + id : '');
    }

    private toggleExpanded = (entry: T) => {
        const key = this.entryKey(entry);
        // From the previous state: clicks in quick succession must not overwrite each other
        this.setState(state => ({
            expanded: state.expanded.includes(key) ? state.expanded.filter(k => k !== key) : [...state.expanded, key],
        }));
    };

    private expandable(): boolean {
        return !!this.props.renderDetails;
    }

    private rowClass(): string {
        return 'pwr-view-entries-row' + (this.expandable() ? ' pwr-view-entries-expandable' : '');
    }

    private template(): string {
        const columns = this.props.columns.map(column => column.width || FREE_WIDTH);
        return ['32px', '40px', ...columns, ...(this.expandable() ? ['40px'] : [])].join(' ');
    }

    private DragHandle = SortableHandle(() => <Icon className="material-icons pwr-view-entries-handle">drag_handle</Icon>);

    private renderRow(entry: T, entryIndex: number, expanded: boolean) {
        const expandable = this.expandable();
        const onCellClick = expandable ? () => this.toggleExpanded(entry) : undefined;
        const cellClass = 'pwr-view-entries-cell' + (expandable ? ' cursor-pointer' : '');
        return <div className={this.rowClass() + (entry.enabled ? '' : ' pwr-view-entry-disabled')}
                    style={{gridTemplateColumns: this.template()}}>
            <div>{this.props.moveDisabled ? null : <this.DragHandle/>}</div>
            <div>
                <Switch size="small" color="primary"
                        checked={entry.enabled}
                        onChange={(e: any) => this.handleToggle(entryIndex, e.target.checked)}
                        inputProps={{'aria-label': PowerLocalize.get('ViewProfileOverview.Toggle')}}
                />
            </div>
            {this.props.columns.map((column, index) =>
                <div key={index} className={cellClass + secondary(index)} onClick={onCellClick}>{column.render(entry, entryIndex)}</div>)}
            {expandable &&
            <div className="pwr-view-entries-expand">
                <PwrIconButton iconName={expanded ? 'expand_less' : 'expand_more'}
                               tooltip={PowerLocalize.get(expanded ? 'ViewProfileOverview.Collapse' : 'ViewProfileOverview.Expand')}
                               iconButtonProps={{size: 'small', 'aria-expanded': expanded}}
                               onClick={() => this.toggleExpanded(entry)}/>
            </div>}
        </div>;
    }

    private SortableItem = SortableElement((props: SortableItemProps<T>) => {
        const row = this.renderRow(props.entry, props.entryIndex, props.expanded);
        const details = this.expandable() &&
            <Collapse in={props.expanded} unmountOnExit>
                <div className={this.props.cards ? 'pwr-view-entries-card-details' : 'pwr-view-entries-details'}>
                    {this.props.renderDetails(props.entry, props.entryIndex)}
                </div>
            </Collapse>;
        if (this.props.cards) {
            return <Paper variant="outlined" className="pwr-view-entries-card">{row}{details}</Paper>;
        }
        return <div className="pwr-view-entries-item">{row}{details}</div>;
    });

    private SortableList = SortableContainer((props: { entries: Array<T>, expanded: Array<string> }) =>
        <div className={this.props.cards ? 'pwr-view-entries-cards' : undefined}>
            {props.entries.map((entry, index) => {
                const key = this.entryKey(entry);
                return <this.SortableItem
                    disabled={this.props.moveDisabled}
                    key={key}
                    index={index}
                    entryIndex={index}
                    expanded={props.expanded.includes(key)}
                    entry={entry}/>;
            })}
        </div>);

    private renderHeader() {
        return <div className={this.rowClass() + ' pwr-view-entries-head'}
                    style={{gridTemplateColumns: this.template()}}>
            <div/>
            <div/>
            {this.props.columns.map((column, index) =>
                <div key={index} className={'pwr-view-entries-cell' + secondary(index)}>{column.header}</div>)}
            {this.expandable() && <div className="pwr-view-entries-expand"/>}
        </div>;
    }

    render() {
        const entries = this.props.entries || [];
        if (entries.length === 0 && this.props.emptyText) {
            return <Typography variant="body2" color="textSecondary">{this.props.emptyText}</Typography>;
        }
        return <div>
            {!this.props.hideHeader &&
            <SortedColumnContext.Provider value={this.sorted()}>
                {this.renderHeader()}
            </SortedColumnContext.Provider>}
            <this.SortableList
                axis={this.props.cards ? 'xy' : 'y'}
                lockAxis={this.props.cards ? undefined : 'y'}
                helperClass="pwr-view-entries-drag-helper"
                hideSortableGhost={false}
                entries={entries}
                expanded={this.state.expanded}
                useDragHandle={true}
                onSortStart={this.onSortStart}
                {...{onSortOver: this.onSortOver} as any}
                onSortEnd={this.onSortEnd}/>
        </div>;
    }
}
