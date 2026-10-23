import * as React from 'react';
import {Divider, Icon, IconButton, ListItem, ListItemIcon, ListItemText, ListSubheader, Menu, MenuItem, Tooltip} from '@material-ui/core';
import {useDispatch} from 'react-redux';
import {useLocation} from 'react-router-dom';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Paths} from '../../Paths';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {TemplateActionCreator} from '../../reducers/template/TemplateActionCreator';

interface AdminMenuEntry {
    localizationKey: string;
    /** Without, an entry below the one before it */
    icon?: string;
    /** The entry is active on this path and every path below */
    path: string;

    open(dispatch: ReturnType<typeof useDispatch>): void;
}

const navigateTo = (path: string) => (dispatch: ReturnType<typeof useDispatch>) =>
    dispatch(NavigationActionCreator.AsyncNavigateTo(path) as any);

const GROUPS: Array<{ localizationKey: string, entries: Array<AdminMenuEntry> }> = [
    {
        localizationKey: 'AdminClient.Menu.Mail',
        entries: [
            {
                localizationKey: 'AdminClient.Menu.Inbox', icon: 'inbox', path: Paths.ADMIN_INBOX,
                open: dispatch => dispatch(AdminActionCreator.AsyncNavigateToInbox() as any)
            },
            {
                localizationKey: 'AdminClient.Menu.Trashbin', icon: 'delete', path: Paths.ADMIN_TRASHBOX,
                open: dispatch => dispatch(AdminActionCreator.AsyncNavigateToTrashbox() as any)
            },
        ]
    },
    {
        localizationKey: 'AdminClient.Menu.Employees',
        entries: [
            {
                localizationKey: 'AdminClient.Menu.Consultants', icon: 'people', path: Paths.ADMIN_CONSULTANTS,
                open: dispatch => {
                    dispatch(TemplateActionCreator.AsyncLoadAllTemplates() as any);
                    navigateTo(Paths.ADMIN_CONSULTANTS)(dispatch);
                }
            },
            {
                localizationKey: 'AdminClient.Menu.ReportManager', icon: 'description', path: Paths.ADMIN_TEMPLATES,
                open: navigateTo(Paths.ADMIN_TEMPLATES)
            },
        ]
    },
    {
        localizationKey: 'AdminClient.Menu.Info',
        entries: [
            {
                localizationKey: 'AdminClient.Menu.Info.ProfileElements.Entries', path: Paths.ADMIN_INFO_NAME_ENTITY,
                open: navigateTo(Paths.ADMIN_INFO_NAME_ENTITY)
            },
            {
                localizationKey: 'AdminClient.Menu.Info.ProfileElements.Skills', path: Paths.ADMIN_INFO_USED_SKILLS,
                open: navigateTo(Paths.ADMIN_INFO_USED_SKILLS)
            },
            {
                localizationKey: 'AdminClient.Menu.Info.SkillTree', icon: 'device_hub', path: Paths.ADMIN_INFO_SKILLTREE,
                open: navigateTo(Paths.ADMIN_INFO_SKILLTREE)
            },
        ]
    },
    {
        localizationKey: 'AdminClient.Menu.Statistics',
        entries: [
            {
                localizationKey: 'AdminClient.Menu.Statistics.Skills', icon: 'bar_chart', path: Paths.ADMIN_STATISTICS_SKILL,
                open: dispatch => dispatch(AdminActionCreator.AsyncNavigateToStatistics() as any)
            },
        ]
    },
];

const isActive = (pathname: string, path: string) => pathname === path || pathname.startsWith(path + '/');

/**
 * The menu of the admin area (#212), opened by the burger in the app bar like the menu of the profile area. The
 * profile elements are a heading with their two pages below it; logging out is the last entry (#211).
 */
export const AdminMenu = (props: { onLogOut(): void }) => {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    const dispatch = useDispatch();
    const {pathname} = useLocation();
    const close = () => setAnchor(null);
    const select = (entry: AdminMenuEntry) => {
        close();
        entry.open(dispatch);
    };

    const renderEntry = (entry: AdminMenuEntry) =>
        <MenuItem key={entry.localizationKey} selected={isActive(pathname, entry.path)} onClick={() => select(entry)}
                  className={entry.icon ? undefined : 'pwr-menu-subitem'}
                  // The heading above is no menu item; screen readers get it with the entry ("Skills" twice)
                  aria-label={entry.icon ? undefined : PowerLocalize.get('AdminClient.Menu.Info.ProfileElements') + ': '
                      + PowerLocalize.get(entry.localizationKey)}>
            {entry.icon && <ListItemIcon><Icon className="material-icons">{entry.icon}</Icon></ListItemIcon>}
            <ListItemText inset={!entry.icon}>{PowerLocalize.get(entry.localizationKey)}</ListItemText>
        </MenuItem>;

    const renderGroup = (group: typeof GROUPS[number]) => {
        const items: Array<React.ReactNode> = [
            <ListSubheader key={group.localizationKey} disableSticky>{PowerLocalize.get(group.localizationKey)}</ListSubheader>
        ];
        group.entries.forEach((entry, index) => {
            // The profile elements: a heading for the two pages below it, no page of its own
            if (!entry.icon && (index === 0 || group.entries[index - 1].icon)) {
                items.push(<ListItem key={entry.localizationKey + '.Heading'} component="li">
                    <ListItemIcon><Icon className="material-icons">list_alt</Icon></ListItemIcon>
                    <ListItemText>{PowerLocalize.get('AdminClient.Menu.Info.ProfileElements')}</ListItemText>
                </ListItem>);
            }
            items.push(renderEntry(entry));
        });
        return items;
    };

    const label = PowerLocalize.get('Menu.Open');
    return <>
        <Tooltip title={label}>
            <IconButton aria-label={label} aria-haspopup="true" aria-controls="admin-menu" color="inherit"
                        edge="start" onClick={event => setAnchor(event.currentTarget)}>
                <Icon className="material-icons">menu</Icon>
            </IconButton>
        </Tooltip>
        <Menu id="admin-menu" anchorEl={anchor} open={anchor !== null} onClose={close}>
            {GROUPS.map(renderGroup)}
            <Divider/>
            <MenuItem onClick={() => {
                close();
                props.onLogOut();
            }}>
                <ListItemIcon><Icon className="material-icons">input</Icon></ListItemIcon>
                <ListItemText>{PowerLocalize.get('Tooolbar.LogOut')}</ListItemText>
            </MenuItem>
        </Menu>
    </>;
};
