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
    /** Further secondary actions, after the main actions */
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
            <PwrButton variant="contained" color="primary" text={PowerLocalize.get('Action.Save')}
                       icon={<Icon className="material-icons">save</Icon>}
                       disabled={props.saveDisabled} onClick={props.onSave}/>}
            {props.editing && props.onCancel &&
            <PwrButton color="primary" text={PowerLocalize.get('Action.Cancel')} onClick={props.onCancel}/>}
            {!props.editing && props.onEdit &&
            <PwrButton variant="contained" color="primary" text={PowerLocalize.get('Action.Edit')}
                       icon={<Icon className="material-icons">edit</Icon>} onClick={props.onEdit}/>}
            {props.children}
            {props.onDelete &&
            <PwrButton color="default" className={classes.delete} text={PowerLocalize.get('Action.Delete')}
                       icon={<Icon className="material-icons">delete</Icon>} onClick={props.onDelete}/>}
        </div>
    </>;
};
