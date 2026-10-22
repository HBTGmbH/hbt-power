import * as React from 'react';
import {ButtonBase} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';

export interface PwrListTableColumn<T> {
    header: string;

    render(item: T): React.ReactNode;

    /** Fixed width in px; without, the column takes the remaining space */
    width?: number;
}

interface PwrListTableProps<T> {
    columns: Array<PwrListTableColumn<T>>;
    items: Array<T>;
    /** Names the table for screen readers */
    label: string;
    /** Shown as the only row of an empty table */
    emptyText?: string;
    selectedKey?: string;

    itemKey(item: T): string;

    /** Makes the rows buttons: click, Enter or space selects, the arrow keys move between them */
    onSelect?(item: T): void;
}

// The look of the view profile tables (#149, .pwr-view-entries-* in index.css). px, not rem: Bootstrap sets the root
// font size to 10px.
const useStyles = makeStyles(theme => ({
    row: {
        display: 'grid',
        alignItems: 'center',
        columnGap: theme.spacing(1),
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 40,
        padding: theme.spacing(0, 1),
        borderBottom: '1px solid ' + theme.palette.divider,
        fontSize: 14,
        lineHeight: 1.43,
        textAlign: 'left',
    },
    head: {
        minHeight: 32,
        color: theme.palette.text.secondary,
        fontSize: 12,
        fontWeight: 500,
    },
    selectable: {
        fontFamily: 'inherit',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    },
    focusVisible: {
        outline: '2px solid ' + theme.palette.primary.main,
        outlineOffset: -2,
    },
    selected: {
        backgroundColor: theme.palette.action.selected,
        // The bar on the left marks it without relying on the grey alone
        boxShadow: 'inset 3px 0 0 ' + theme.palette.primary.main,
        fontWeight: 500,
    },
    cell: {
        minWidth: 0,
        overflowWrap: 'anywhere',
    },
    empty: {
        color: theme.palette.text.secondary,
    },
}));

function moveFocus(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
        return;
    }
    const rows = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[data-pwr-list-table-row]'));
    const index = rows.indexOf(document.activeElement as HTMLElement);
    const next = rows[index + (event.key === 'ArrowDown' ? 1 : -1)];
    if (index >= 0 && next) {
        event.preventDefault();
        next.focus();
    }
}

/**
 * A list as table in the look of the view profile tables (#199): a grey header row, rows of at least 40 px with a line
 * between them. With onSelect the rows can be selected; the selected one is highlighted.
 */
export function PwrListTable<T>(props: PwrListTableProps<T>) {
    const classes = useStyles();
    const template = {
        gridTemplateColumns: props.columns.map(column => column.width ? column.width + 'px' : 'minmax(0, 1fr)').join(' ')
    };
    // A table for screen readers only without selection; with it, a group of buttons whose header is decoration
    const asTable = !props.onSelect;
    const cells = (item: T) => props.columns.map((column, index) =>
        <div key={index} className={classes.cell} role={asTable ? 'cell' : undefined}>{column.render(item)}</div>);

    const renderRow = (item: T) => {
        const key = props.itemKey(item);
        if (asTable) {
            return <div key={key} className={classes.row} style={template} role="row">{cells(item)}</div>;
        }
        const selected = key === props.selectedKey;
        return <ButtonBase key={key} data-pwr-list-table-row
                           className={classes.row + ' ' + classes.selectable + (selected ? ' ' + classes.selected : '')}
                           focusVisibleClassName={classes.focusVisible} style={template}
                           aria-pressed={selected} onClick={() => props.onSelect(item)}>
            {cells(item)}
        </ButtonBase>;
    };

    return <div aria-label={props.label} role={asTable ? 'table' : 'group'} onKeyDown={moveFocus}>
        <div className={classes.row + ' ' + classes.head} style={template}
             role={asTable ? 'row' : undefined} aria-hidden={asTable ? undefined : true}>
            {props.columns.map((column, index) => <div key={index} className={classes.cell}
                                                       role={asTable ? 'columnheader' : undefined}>{column.header}</div>)}
        </div>
        {props.items.length === 0 && props.emptyText
            ? <div className={classes.row + ' ' + classes.empty} role={asTable ? 'row' : undefined}>
                <div role={asTable ? 'cell' : undefined}>{props.emptyText}</div>
            </div>
            : props.items.map(renderRow)}
    </div>;
}
