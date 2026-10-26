import * as React from 'react';
import {useState} from 'react';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {Icon, InputAdornment, Paper, TextField, Typography} from '@material-ui/core';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ConsultantName} from '../../../model/ConsultantName';
import {PwrListTable} from '../../general/pwr-list-table';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {OIDCService} from '../../../OIDCService';
import {Paths} from '../../../Paths';
import {compareNames} from '../../../utils/Comparators';

/** Whether the colleague matches the filter: short or full name or initials contain it, ignoring case */
function matches(colleague: ConsultantName, filter: string): boolean {
    const wanted = filter.trim().toLowerCase();
    return !wanted || [colleague.shortName, colleague.fullName, colleague.initials]
        .some(text => !!text && text.toLowerCase().includes(wanted));
}

/**
 * The active colleagues (#350): a click opens the profile, which every user reads. Sorted by the short name like every
 * list of consultants (#277), the full name on a tie.
 */
export const ColleaguesPage = () => {
    const history = useHistory();
    const names = useSelector((state: ApplicationState) => state.consultantNames.names);
    const [filter, setFilter] = useState('');
    const own = OIDCService.instance().ownInitials();
    const colleagues = Object.values(names)
        .filter(colleague => colleague.active)
        .filter(colleague => !own || colleague.initials.toLowerCase() !== own.toLowerCase())
        .filter(colleague => matches(colleague, filter))
        .sort((a, b) => compareNames(a.shortName, b.shortName) || compareNames(a.fullName, b.fullName));
    const open = (colleague: ConsultantName) =>
        history.push(Paths.build(Paths.USER_PROFILE, {initials: colleague.initials}));
    return <div className="col-md-8 col-md-offset-2">
        <Paper className="dashboard-element">
            <div className="mui-margin">
                <Typography variant="h5" component="h1">{PowerLocalize.get('Colleagues.Title')}</Typography>
                <Typography variant="body2" color="textSecondary">{PowerLocalize.get('Colleagues.Info')}</Typography>
                <PwrSpacer/>
                <TextField id="colleagues-filter" label={PowerLocalize.get('Colleagues.Filter')} value={filter}
                           fullWidth autoFocus
                           onChange={event => setFilter(event.target.value)}
                           InputProps={{
                               endAdornment: <InputAdornment position="end">
                                   <Icon className="material-icons">search</Icon>
                               </InputAdornment>
                           }}/>
                <PwrSpacer/>
                <PwrListTable label={PowerLocalize.get('Colleagues.Title')}
                              items={colleagues}
                              itemKey={colleague => colleague.initials}
                              onSelect={open}
                              emptyText={PowerLocalize.get(filter.trim() ? 'Colleagues.NoMatch' : 'Colleagues.None')}
                              columns={[
                                  {
                                      header: PowerLocalize.get('Colleagues.ShortName'),
                                      render: colleague => colleague.shortName,
                                      sortValue: colleague => colleague.shortName,
                                      width: 200,
                                  },
                                  {
                                      header: PowerLocalize.get('Colleagues.FullName'),
                                      render: colleague => colleague.fullName,
                                      sortValue: colleague => colleague.fullName,
                                  },
                                  {
                                      header: PowerLocalize.get('Colleagues.Initials'),
                                      render: colleague => colleague.initials,
                                      sortValue: colleague => colleague.initials,
                                      width: 100,
                                  },
                              ]}
                              initialSort={{column: 0, ascending: true}}/>
            </div>
        </Paper>
    </div>;
};
