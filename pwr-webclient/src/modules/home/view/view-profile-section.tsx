import * as React from 'react';
import {Icon, Link, Tooltip, Typography} from '@material-ui/core';
import {makeStyles} from '@material-ui/core/styles';
import {useDispatch, useSelector} from 'react-redux';
import {Link as RouterLink} from 'react-router-dom';
import Add from '@material-ui/icons/Add';
import History from '@material-ui/icons/History';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {Paths} from '../../../Paths';
import {compareNames} from '../../../utils/Comparators';
import {formatFullLocalizedDate} from '../../../utils/DateUtil';
import {PwrButton} from '../../general/pwr-button';
import {PwrIconButton} from '../../general/pwr-icon-button';
import {PwrListTable} from '../../general/pwr-list-table';
import {PwrRow} from '../../general/pwr-form-section';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {ViewProfileDialog} from './view-profile-dialog_module';
import {ProfileGenerator} from './view-profile-generator_module';

const useStyles = makeStyles(theme => ({
    description: {
        color: theme.palette.text.secondary,
        fontSize: 12,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    actions: {
        display: 'flex',
    },
}));

/**
 * Newest first (#213); the creation date has no time, so the title decides between view profiles of the same day
 */
const newestFirst = (a: ViewProfile, b: ViewProfile) =>
    (b.viewProfileInfo.creationDate || '').localeCompare(a.viewProfileInfo.creationDate || '')
    || compareNames(a.viewProfileInfo.name, b.viewProfileInfo.name);

interface ViewProfileSectionProps {
    initials: string;
    /** On the overview the newest three, below them a link to the page with all (#213); without, all */
    limit?: number;
}

/**
 * The view profiles of a profile as a table (#213): title with the description below it, date, and the actions as
 * icon buttons. Above it creating a view profile and the report history.
 */
export const ViewProfileSection = (props: ViewProfileSectionProps) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const viewProfilesById = useSelector((state: ApplicationState) => state.viewProfileSlice.viewProfiles);
    const [createOpen, setCreateOpen] = React.useState(false);
    const [generatorFor, setGeneratorFor] = React.useState<string | null>(null);

    const all = viewProfilesById.toArray().sort(newestFirst);
    const shown = props.limit ? all.slice(0, props.limit) : all;

    const create = (name: string, description: string, localization: string | null) => {
        dispatch(ViewProfileActionCreator.AsyncCreateViewProfile(name, description, localization) as any);
        setCreateOpen(false);
    };
    const edit = (viewProfile: ViewProfile) => dispatch(NavigationActionCreator.AsyncNavigateTo(
        Paths.viewProfile(props.initials, viewProfile.id, viewProfile.viewProfileInfo.name)) as any);
    const remove = (viewProfile: ViewProfile) =>
        dispatch(ViewProfileActionCreator.AsyncDeleteViewProfile(viewProfile.id) as any);

    const renderTitle = (viewProfile: ViewProfile) => {
        const description = viewProfile.viewProfileInfo.viewDescription;
        return <>
            {viewProfile.viewProfileInfo.name}
            {description &&
            <Tooltip title={description}>
                <div className={classes.description}>{description}</div>
            </Tooltip>}
        </>;
    };

    const renderActions = (viewProfile: ViewProfile) => <div className={classes.actions}>
        <PwrIconButton iconName="open_in_new" tooltip={PowerLocalize.get('Action.Generate.Word')}
                       onClick={() => setGeneratorFor(viewProfile.id)}/>
        <PwrIconButton iconName="edit" tooltip={PowerLocalize.get('Action.Edit')} onClick={() => edit(viewProfile)}/>
        <PwrIconButton iconName="delete" tooltip={PowerLocalize.get('Action.Delete')} onClick={() => remove(viewProfile)}/>
    </div>;

    return <>
        <Typography variant="h6" component="h2">{PowerLocalize.get('Overview.ViewProfiles.Title')}</Typography>
        <Typography variant="body2">{PowerLocalize.get('Overview.ViewProfiles.Description')}</Typography>
        <PwrSpacer size="tight"/>
        <ViewProfileDialog open={createOpen} onClose={() => setCreateOpen(false)} onSave={create}/>
        {generatorFor && <ProfileGenerator open onClose={() => setGeneratorFor(null)} viewProfileId={generatorFor}/>}
        <PwrRow>
            <PwrButton color={'primary'} onClick={() => setCreateOpen(true)}
                       icon={<Add/>} text={PowerLocalize.get('ViewProfile.Create')}/>
            <PwrButton color={'primary'}
                       onClick={() => dispatch(NavigationActionCreator.AsyncNavigateTo(
                           Paths.build(Paths.USER_REPORTS, {initials: props.initials})) as any)}
                       icon={<History/>} text={PowerLocalize.get('Report.History')}/>
        </PwrRow>
        <PwrSpacer size="tight"/>
        <PwrListTable label={PowerLocalize.get('Overview.ViewProfiles.Title')}
                      items={shown}
                      itemKey={viewProfile => viewProfile.id}
                      emptyText={PowerLocalize.get('ViewProfile.Table.Empty')}
                      columns={[
                          {header: PowerLocalize.get('ViewProfile.Table.Title'), render: renderTitle},
                          {
                              header: PowerLocalize.get('ViewProfile.Table.Date'),
                              render: viewProfile => formatFullLocalizedDate(viewProfile.viewProfileInfo.creationDate),
                              width: 140
                          },
                          {header: PowerLocalize.get('ViewProfile.Table.Actions'), render: renderActions, width: 144}
                      ]}/>
        {props.limit && all.length > props.limit && <>
            <PwrSpacer size="tight"/>
            <Link component={RouterLink} to={Paths.build(Paths.USER_VIEW_PROFILES, {initials: props.initials})}
                  variant="body2" className="pwr-link-with-icon">
                {PowerLocalize.getFormatted('ViewProfile.All', all.length)}
                <Icon className="material-icons" fontSize="small">arrow_forward</Icon>
            </Link>
        </>}
    </>;
};
