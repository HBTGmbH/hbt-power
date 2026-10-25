import * as React from 'react';
import {ReactNode} from 'react';
import {Icon} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {PwrButton} from './pwr-button';
import {PwrSpacer} from './pwr-spacer_module';
import {PowerLocalize} from '../../localization/PowerLocalizer';

interface PwrFormActionsProps {
    /** Edit mode shows Save and Cancel, read mode Edit */
    editing: boolean;
    /** Omitted where the form has no read mode */
    onEdit?(): void;
    onSave?(): void;
    onCancel?(): void;
    /** Only where deleting is possible; asks first through makeDeferrable like before */
    onDelete?(): void;
    saveDisabled?: boolean;
    /** Abbrechen by default; e.g. Änderungen verwerfen where the form has no read mode (#338) */
    cancelText?: string;
    cancelDisabled?: boolean;
    /** Label and Material icon of the main action in edit mode, Save by default (e.g. Create, Apply in dialogs) */
    saveText?: string;
    saveIcon?: string;
    /** Label and Material icon of the main action in read mode, Edit by default (e.g. Generate on a view profile) */
    editText?: string;
    editIcon?: string;
    /** Further secondary actions, after the main action and before Cancel (e.g. Zurück in a wizard) */
    children?: ReactNode;
    /** Inside DialogActions, which brings its own space */
    noSpace?: boolean;
}

const useStyles = makeStyles(theme => ({
    bar: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: theme.spacing(1),
        width: '100%',
    },
    delete: {
        color: theme.palette.error.main,
        // Pushed to the right, also when the bar wraps in a narrow box
        marginLeft: 'auto',
    },
}));

/**
 * Button bar of a form (#41): the main action highlighted with text (Edit, or Save in edit mode), Cancel as a text
 * button next to it, Delete set apart on the right in the error colour. Section space above (#40).
 */
export const PwrFormActions = (props: PwrFormActionsProps) => {
    const classes = useStyles();
    return <>
        {!props.noSpace && <PwrSpacer size="section"/>}
        <div className={classes.bar}>
            {props.editing && props.onSave &&
            <PwrButton variant="contained" color="primary" text={props.saveText || PowerLocalize.get('Action.Save')}
                       icon={<Icon className="material-icons">{props.saveIcon || 'save'}</Icon>}
                       disabled={props.saveDisabled} onClick={props.onSave}/>}
            {!props.editing && props.onEdit &&
            <PwrButton variant="contained" color="primary" text={props.editText || PowerLocalize.get('Action.Edit')}
                       icon={<Icon className="material-icons">{props.editIcon || 'edit'}</Icon>} onClick={props.onEdit}/>}
            {props.children}
            {props.editing && props.onCancel &&
            <PwrButton color="primary" text={props.cancelText || PowerLocalize.get('Action.Cancel')}
                       disabled={props.cancelDisabled} onClick={props.onCancel}/>}
            {props.onDelete &&
            <PwrButton color="default" className={classes.delete} text={PowerLocalize.get('Action.Delete')}
                       icon={<Icon className="material-icons">delete</Icon>} onClick={props.onDelete}/>}
        </div>
    </>;
};

interface PwrConfirmActionsProps {
    confirmText: string;
    onConfirm(): void;
    /** Abbrechen by default */
    rejectText?: string;
    onReject(): void;
    /** Deleting, discarding: the confirming action in the error colour */
    destructive?: boolean;
    /** Which action has the focus, so Enter triggers it; none by default */
    autoFocus?: 'confirm' | 'reject';
    /** Until the confirmation is complete, e.g. the name was entered twice (#181) */
    confirmDisabled?: boolean;
}

const useConfirmStyles = makeStyles(theme => ({
    bar: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: theme.spacing(1),
        width: '100%',
    },
    destructive: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
        },
    },
}));

/**
 * Button bar of a confirmation dialog (#134), inside DialogActions: the confirming action highlighted like the main
 * action of a form, in the error colour if it destroys something; the rejecting one as a text button next to it.
 */
export const PwrConfirmActions = (props: PwrConfirmActionsProps) => {
    const classes = useConfirmStyles();
    return <div className={classes.bar}>
        <PwrButton variant="contained" color="primary" className={props.destructive ? classes.destructive : undefined}
                   text={props.confirmText} autoFocus={props.autoFocus === 'confirm'} disabled={props.confirmDisabled}
                   onClick={props.onConfirm}/>
        <PwrButton color="primary" text={props.rejectText || PowerLocalize.get('Action.Cancel')}
                   autoFocus={props.autoFocus === 'reject'} onClick={props.onReject}/>
    </div>;
};
