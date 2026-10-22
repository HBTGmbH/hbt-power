import * as React from 'react';
import {Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {PowerLocalize} from '../../../../../localization/PowerLocalizer';

const STEPS = [1, 2, 3, 4, 5, 6];

const useStyles = makeStyles(theme => ({
    steps: {
        margin: theme.spacing(1, 0),
        paddingLeft: theme.spacing(3),
        '& li': {
            marginBottom: theme.spacing(0.5),
        },
    },
    example: {
        margin: theme.spacing(1, 0, 0),
        paddingLeft: theme.spacing(1.5),
        borderLeft: '3px solid ' + theme.palette.divider,
        fontStyle: 'italic',
    },
}));

/**
 * Step by step guide to a good project description (#147), shown below the description field
 */
export const ProjectDescriptionHelp = () => {
    const classes = useStyles();
    return <>
        <Typography variant={'subtitle2'}>{PowerLocalize.get('ProjectDescriptionHelp.Title')}</Typography>
        <Typography variant={'body2'}>{PowerLocalize.get('ProjectDescriptionHelp.Intro')}</Typography>
        <ol className={classes.steps}>
            {STEPS.map(step =>
                <li key={step}>
                    <Typography variant={'body2'} component={'span'}>
                        <strong>{PowerLocalize.get('ProjectDescriptionHelp.Step.' + step + '.Title')}:</strong>{' '}
                        {PowerLocalize.get('ProjectDescriptionHelp.Step.' + step + '.Text')}
                    </Typography>
                </li>)}
        </ol>
        <Typography variant={'body2'}>
            <strong>{PowerLocalize.get('ProjectDescriptionHelp.Tips.Title')}:</strong>{' '}
            {PowerLocalize.get('ProjectDescriptionHelp.Tips.Text')}
        </Typography>
        <Typography variant={'body2'} className={classes.example}>
            {PowerLocalize.get('ProjectDescriptionHelp.Example')}
        </Typography>
    </>;
};
