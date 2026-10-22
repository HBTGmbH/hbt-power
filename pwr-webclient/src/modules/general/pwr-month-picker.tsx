import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {Button, Icon, IconButton, InputAdornment, Popover, TextField, Tooltip, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {PowerLocalize} from '../../localization/PowerLocalizer';

const MONTHS = Array.from({length: 12}, (_, month) => month);

let nextFieldId = 0;

const useStyles = makeStyles(theme => ({
    panel: {
        padding: theme.spacing(1, 2, 2),
        width: 240,
    },
    year: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: theme.spacing(1),
    },
    month: {
        minWidth: 0,
        textTransform: 'none',
        // Keyboard focus without the focus ripple (see below): a clear outline instead
        '&.Mui-focusVisible': {
            outline: '2px solid ' + theme.palette.primary.main,
            outlineOffset: 2,
        },
    },
    current: {
        // This month, as orientation; the selected one is filled
        borderColor: theme.palette.primary.main,
    },
}));

function format(date: Date | null): string {
    if (!date) {
        return '';
    }
    return String(date.getMonth() + 1).padStart(2, '0') + '.' + date.getFullYear();
}

/**
 * "MM.JJJJ" (also "M.JJJJ"); undefined while the input is not a valid month yet
 */
function parse(text: string): Date | undefined {
    const match = /^\s*(\d{1,2})\s*[./-]\s*(\d{4})\s*$/.exec(text);
    if (!match) {
        return undefined;
    }
    const month = Number(match[1]);
    return month >= 1 && month <= 12 ? new Date(Number(match[2]), month - 1, 1) : undefined;
}

interface PwrMonthPickerProps {
    value: Date | null;
    label: string;
    disabled?: boolean;
    error?: boolean;

    /** The first day of the chosen month; null if the field was emptied */
    onChange(date: Date | null): void;
}

/**
 * Month and year (#143): typed as MM.JJJJ, or chosen in a popover with the year on top and the twelve months below;
 * one click on a month takes it and closes.
 */
export const PwrMonthPicker = (props: PwrMonthPickerProps) => {
    const classes = useStyles();
    const field = useRef<HTMLDivElement>(null);
    // Ties the label to the input, so screen readers name the field "Start-Datum" instead of its placeholder
    const [fieldId] = useState(() => 'pwr-month-picker-' + (nextFieldId++));
    const [text, setText] = useState(format(props.value));
    const [open, setOpen] = useState(false);
    const [year, setYear] = useState((props.value || new Date()).getFullYear());
    const valueKey = format(props.value);

    // A new value from outside (another project, open end, cancel) replaces what was typed
    useEffect(() => {
        setText(valueKey);
    }, [valueKey]);

    const invalid = text.trim() !== '' && !parse(text);
    const today = new Date();

    const changeText = (input: string) => {
        setText(input);
        if (input.trim() === '') {
            props.onChange(null);
            return;
        }
        const date = parse(input);
        if (date) {
            props.onChange(date);
        }
    };

    const openPanel = () => {
        setYear((props.value || new Date()).getFullYear());
        setOpen(true);
    };

    const choose = (month: number) => {
        const date = new Date(year, month, 1);
        setText(format(date));
        props.onChange(date);
        setOpen(false);
    };

    const isSelected = (month: number) => !!props.value && props.value.getFullYear() === year && props.value.getMonth() === month;
    const isCurrent = (month: number) => today.getFullYear() === year && today.getMonth() === month;

    return <>
        <TextField
            ref={field}
            id={fieldId}
            label={props.label}
            value={text}
            disabled={props.disabled}
            error={!!props.error || invalid}
            helperText={invalid ? PowerLocalize.get('MonthPicker.Format') : undefined}
            placeholder={PowerLocalize.get('MonthPicker.Placeholder')}
            onChange={event => changeText(event.target.value)}
            InputProps={{
                endAdornment: <InputAdornment position="end">
                    <Tooltip title={PowerLocalize.get('MonthPicker.Open')}>
                        <span>
                            <IconButton size="small" disabled={props.disabled} onClick={openPanel}
                                        aria-label={PowerLocalize.get('MonthPicker.Open')}>
                                <Icon className="material-icons">date_range</Icon>
                            </IconButton>
                        </span>
                    </Tooltip>
                </InputAdornment>
            }}
        />
        <Popover open={open} anchorEl={field.current} onClose={() => setOpen(false)}
                 anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                 transformOrigin={{vertical: 'top', horizontal: 'left'}}>
            <div className={classes.panel}>
                <div className={classes.year}>
                    <Tooltip title={PowerLocalize.get('MonthPicker.PreviousYear')}>
                        <IconButton size="small" onClick={() => setYear(year - 1)}
                                    aria-label={PowerLocalize.get('MonthPicker.PreviousYear')}>
                            <Icon className="material-icons">chevron_left</Icon>
                        </IconButton>
                    </Tooltip>
                    <Typography variant={'subtitle1'}>{year}</Typography>
                    <Tooltip title={PowerLocalize.get('MonthPicker.NextYear')}>
                        <IconButton size="small" onClick={() => setYear(year + 1)}
                                    aria-label={PowerLocalize.get('MonthPicker.NextYear')}>
                            <Icon className="material-icons">chevron_right</Icon>
                        </IconButton>
                    </Tooltip>
                </div>
                <div className={classes.grid}>
                    {MONTHS.map(month =>
                        <Button key={month} size="small" color="primary"
                                variant={isSelected(month) ? 'contained' : isCurrent(month) ? 'outlined' : 'text'}
                                className={classes.month + (isCurrent(month) && !isSelected(month) ? ' ' + classes.current : '')}
                                autoFocus={isSelected(month)}
                                // Material-UI v4 with React 18: the focus ripple of an autofocused button starts before
                                // it is mounted and crashes, as soon as the popover is opened with the keyboard
                                disableFocusRipple
                                aria-label={PowerLocalize.get('Month.' + (month + 1)) + ' ' + year}
                                onClick={() => choose(month)}>
                            {PowerLocalize.get('Month.Short.' + (month + 1))}
                        </Button>)}
                </div>
            </div>
        </Popover>
    </>;
};
