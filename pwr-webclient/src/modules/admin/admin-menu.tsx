import * as React from 'react';
import {Divider, Icon, IconButton, ListItemIcon, ListItemText, ListSubheader, Menu, MenuItem, Tooltip} from '@material-ui/core';
import {useDispatch} from 'react-redux';
import {useLocation} from 'react-router-dom';
import {PowerLocalize} from '../../localization/PowerLocalizer';
import {Paths} from '../../Paths';
import {AdminActionCreator} from '../../reducers/admin/AdminActionCreator';
import {NavigationActionCreator} from '../../reducers/navigation/NavigationActionCreator';
import {TemplateActionCreator} from '../../reducers/template/TemplateActionCreator';

interface AdminMenuEntry {
    localizationKey: string;
    icon: string;
    /** The entry is active on this path and every path below */
    path: string;

    open(dispatch: ReturnType<typeof useDispatch>): void;
}

/** An entry that opens and closes the entries below it, like the base data in the menu of the profile area (#231) */
interface AdminSubmenu {
    localizationKey: string;
    icon: string;
    entries: Array<AdminMenuEntry>;
}

const isSubmenu = (item: AdminMenuEntry | AdminSubmenu): item is AdminSubmenu => 'entries' in item;

const navigateTo = (path: string) => (dispatch: ReturnType<typeof useDispatch>) =>
    dispatch(NavigationActionCreator.AsyncNavigateTo(path) as any);

const GROUPS: Array<{ localizationKey: string, entries: Array<AdminMenuEntry | AdminSubmenu> }> = [
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
                localizationKey: 'AdminClient.Menu.Info.ProfileElements', icon: 'list_alt',
                entries: [
                    {
                        localizationKey: 'AdminClient.Menu.Info.ProfileElements.Entries', icon: 'label',
                        path: Paths.ADMIN_INFO_NAME_ENTITY, open: navigateTo(Paths.ADMIN_INFO_NAME_ENTITY)
                    },
                    {
                        localizationKey: 'AdminClient.Menu.Info.ProfileElements.Skills', icon: 'star',
                        path: Paths.ADMIN_INFO_USED_SKILLS, open: navigateTo(Paths.ADMIN_INFO_USED_SKILLS)
                    },
                ]
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

const SUBMENUS = GROUPS.flatMap(group => group.entries).filter(isSubmenu);

/**
 * The menu of the admin area (#212), opened by the burger in the app bar like the menu of the profile area. Its
 * submenus look like those of the profile area (#231): an entry with an arrow opens the entries below it, which are
 * indented and have their own icon; the one with the current page is open. Logging out is the last entry (#211).
 */
export const AdminMenu = (props: { onLogOut(): void }) => {
    const [anchor, setAnchor] = React.useState<HTMLElement | null>(null);
    const [openSubmenus, setOpenSubmenus] = React.useState<Array<string>>([]);
    const dispatch = useDispatch();
    const {pathname} = useLocation();
    const open = (event: React.MouseEvent<HTMLElement>) => {
        setOpenSubmenus(SUBMENUS
            .filter(submenu => submenu.entries.some(entry => isActive(pathname, entry.path)))
            .map(submenu => submenu.localizationKey));
        setAnchor(event.currentTarget);
    };
    const close = () => setAnchor(null);
    const select = (entry: AdminMenuEntry) => {
        close();
        entry.open(dispatch);
    };
    const toggle = (submenu: AdminSubmenu) => setOpenSubmenus(openSubmenus.includes(submenu.localizationKey)
        ? openSubmenus.filter(key => key !== submenu.localizationKey)
        : [...openSubmenus, submenu.localizationKey]);

    const renderEntry = (entry: AdminMenuEntry, subitem: boolean) =>
        <MenuItem key={entry.localizationKey} selected={isActive(pathname, entry.path)} onClick={() => select(entry)}
                  className={subitem ? 'pwr-menu-subitem' : undefined}>
            <ListItemIcon><Icon className="material-icons">{entry.icon}</Icon></ListItemIcon>
            <ListItemText>{PowerLocalize.get(entry.localizationKey)}</ListItemText>
        </MenuItem>;

    // The entries below are siblings, not inside a Collapse: the arrow keys of the menu only reach its direct items
    const renderSubmenu = (submenu: AdminSubmenu) => {
        const expanded = openSubmenus.includes(submenu.localizationKey);
        return [
            <MenuItem key={submenu.localizationKey} aria-expanded={expanded} onClick={() => toggle(submenu)}>
                <ListItemIcon><Icon className="material-icons">{submenu.icon}</Icon></ListItemIcon>
                <ListItemText>{PowerLocalize.get(submenu.localizationKey)}</ListItemText>
                <Icon className="material-icons">{expanded ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}</Icon>
            </MenuItem>,
            ...(expanded ? submenu.entries.map(entry => renderEntry(entry, true)) : [])
        ];
    };

    const renderGroup = (group: typeof GROUPS[number]) => [
        <ListSubheader key={group.localizationKey} disableSticky>{PowerLocalize.get(group.localizationKey)}</ListSubheader>,
        ...group.entries.flatMap(item => isSubmenu(item) ? renderSubmenu(item) : [renderEntry(item, false)])
    ];

    const label = PowerLocalize.get('Menu.Open');
    return <>
        <Tooltip title={label}>
            <IconButton aria-label={label} aria-haspopup="true" aria-controls="admin-menu" color="inherit"
                        edge="start" onClick={open}>
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
