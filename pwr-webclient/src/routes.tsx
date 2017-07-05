import {Paths, store} from './index';
import {PowerLogin} from './modules/power-login_module';
import {AdminLogin} from './modules/admin/admin-login_module';
import {PowerClient} from './modules/home/power-client_module';
import {AdminClient} from './modules/admin/admin-client_module';
import {ProfileNetwork} from './modules/admin/statistics/profile-network_module';
import {SkillStatistics} from './modules/home/statistics/skill-statistics_module';
import {NotificationTrashbox} from './modules/admin/notification-trashbox_module';
import {ConsultantGrid} from './modules/admin/consultants/consultant-grid_module';
import {NotificationInbox} from './modules/admin/notification-inbox_module';
import {AdminSkillTree} from './modules/admin/info/admin-skill-tree_module';
import {NameEntityOverview} from './modules/admin/info/name-entity-overview_module';
import {PowerOverview} from './modules/home/power-overview_module';
import {ConsultantProfile} from './modules/home/profile/profile_module';
import {ViewProfileCard} from './modules/home/view/view-profile_module';
import {ExportDocumentList} from './modules/home/export/export-document-list_module';
import {ProfileNetworkGraph} from './modules/general/statistics/profile-network_module';
import {ClusterResult} from './modules/home/statistics/cluster-result_module';
import {ConsultantSkillSearch} from './modules/general/search/consultant-skill-search_module.';
import {ProfileAsyncActionCreator} from './reducers/profile/ProfileAsyncActionCreator';


export const routes = {
    path: Paths.APP_ROOT,
    component: PowerLogin,
    childRoutes: [
        {
            path: Paths.ADMIN_LOGIN,
            component: AdminLogin
        },
        {
            path: Paths.USER_BASE,
            component: PowerClient,
            childRoutes: [
                {
                    path: Paths.USER_HOME,
                    component: PowerOverview
                },
                {
                    path: Paths.USER_PROFILE,
                    component: ConsultantProfile
                },
                {
                    path: Paths.USER_VIEW,
                    component: ViewProfileCard
                },{
                    path: Paths.USER_REPORTS,
                    component: ExportDocumentList
                },{
                    path: Paths.USER_STATISTICS_NETWORK,
                    component: ProfileNetworkGraph
                },{
                    path: Paths.USER_STATISTICS_CLUSTERINFO,
                    component: ClusterResult
                },{
                    path: Paths.USER_STATISTICS_SKILLS,
                    component: SkillStatistics
                },{
                    path: Paths.USER_SEARCH,
                    component: ConsultantSkillSearch
                }
            ]
        },
        {
            path: Paths.ADMIN_BASE,
            component: AdminClient,
            childRoutes: [
                {
                    path: Paths.ADMIN_INBOX,
                    component: NotificationInbox
                },
                {
                    path: Paths.ADMIN_CONSULTANTS,
                    component: ConsultantGrid
                },
                {
                    path: Paths.ADMIN_TRASHBOX,
                    component: NotificationTrashbox
                },{
                    path: Paths.ADMIN_STATISTICS_SKILL,
                    component: SkillStatistics
                },{
                    path: Paths.ADMIN_STATISTICS_NETWORK,
                    component: ProfileNetwork
                },{
                    path: Paths.ADMIN_INFO_SKILLTREE,
                    component: AdminSkillTree
                },{
                    path: Paths.ADMIN_INFO_NAME_ENTITY,
                    component: NameEntityOverview,
                }
            ]
        }
    ]
};
