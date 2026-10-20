import * as React from 'react';
import {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormControl, InputLabel, MenuItem, Select, Typography} from '@material-ui/core';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {AdminActionCreator} from '../../../reducers/admin/AdminActionCreator';
import {ViewProfileServiceClient} from '../../../clients/ViewProfileServiceClient';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

export interface PreviewSource {
    initials: string;
    viewProfileId: string;
}

interface ViewProfileOption {
    id: string;
    name: string;
}

interface ReportPreviewSourceProps {
    value: PreviewSource;

    onChange(source: PreviewSource): void;
}

/**
 * Selects the consultant and the view profile whose data the report preview of the report manager shows. The first
 * view profile of a consultant is selected right away.
 */
export const ReportPreviewSource = (props: ReportPreviewSourceProps) => {
    const consultants = useSelector((state: ApplicationState) => state.adminReducer.consultantInfo);
    const dispatch = useDispatch();
    const [viewProfiles, setViewProfiles] = useState<Array<ViewProfileOption> | null>(null);
    const {initials, viewProfileId} = props.value;
    const {onChange} = props;

    useEffect(() => {
        if (consultants.length === 0) {
            dispatch(AdminActionCreator.AsyncLoadConsultantInfo());
        }
    }, [consultants.length, dispatch]);

    useEffect(() => {
        setViewProfiles(null);
        if (!initials) {
            return undefined;
        }
        let current = true;
        const client = ViewProfileServiceClient.instance();
        client.getViewProfileIds(initials)
            .then(ids => Promise.all(ids.map(id => client.getViewProfile(initials, id))))
            .then(loaded => {
                if (!current) {
                    return;
                }
                const options = loaded.map(viewProfile => ({id: viewProfile.id, name: viewProfile.viewProfileInfo.name}));
                setViewProfiles(options);
                onChange({initials, viewProfileId: options.length > 0 ? options[0].id : ''});
            })
            .catch(() => current && setViewProfiles([]));
        return () => {
            current = false;
        };
    }, [initials, onChange]);

    const sortedConsultants = [...consultants].sort((a, b) => a.name.localeCompare(b.name));
    return <div style={{display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', padding: '8px'}}>
        <FormControl variant="filled" style={{minWidth: '220px'}}>
            <InputLabel>{PowerLocalize.get('ReportPreview.Consultant')}</InputLabel>
            <Select value={initials}
                    onChange={event => onChange({initials: event.target.value as string, viewProfileId: ''})}>
                {sortedConsultants.map(consultant =>
                    <MenuItem key={consultant.initials} value={consultant.initials}>{consultant.name}</MenuItem>)}
            </Select>
        </FormControl>
        {viewProfiles && viewProfiles.length > 0 &&
        <FormControl variant="filled" style={{minWidth: '220px'}}>
            <InputLabel>{PowerLocalize.get('ReportPreview.ViewProfile')}</InputLabel>
            <Select value={viewProfileId}
                    onChange={event => onChange({initials, viewProfileId: event.target.value as string})}>
                {viewProfiles.map(viewProfile =>
                    <MenuItem key={viewProfile.id} value={viewProfile.id}>{viewProfile.name}</MenuItem>)}
            </Select>
        </FormControl>}
        {viewProfiles && viewProfiles.length === 0 &&
        <Typography color={'textSecondary'}>{PowerLocalize.get('ReportPreview.NoViewProfiles')}</Typography>}
    </div>;
};
