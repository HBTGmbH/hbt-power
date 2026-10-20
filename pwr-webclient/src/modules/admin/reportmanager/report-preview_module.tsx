import * as React from 'react';
import {useEffect, useState} from 'react';
import {CircularProgress, Typography} from '@material-ui/core';
import {ViewProfileServiceClient} from '../../../clients/ViewProfileServiceClient';
import {PowerApiError} from '../../../clients/PowerHttpClient';
import {PowerLocalize} from '../../../localization/PowerLocalizer';


interface ReportPreviewLocalProps {
    templateId: string;
    initials: string;
    viewProfileId: string;
}

type PreviewState =
    | { status: 'loading' }
    | { status: 'failed', textKey: string }
    | { status: 'loaded', url: string };

const PreviewMessage = (props: { textKey: string }) =>
    <Typography color={'textSecondary'} style={{padding: '16px'}}>{PowerLocalize.get(props.textKey)}</Typography>;

/**
 * 422: the template cannot be rendered with this data, e.g. an element higher than the page
 */
const failureTextKey = (error: PowerApiError) =>
    error && error.status === 422 ? 'ReportPreview.CannotRender' : 'ReportPreview.Failed';

/**
 * Live preview of a report: the template filled with the data of the view profile, rendered as PDF by the report
 * service and not stored. It is loaded with the token and shown through a blob URL: an iframe pointing at the API
 * directly would not send the token, and the edge would reject the request. Rendered again only when template, consultant
 * or view profile change.
 */
export const ReportPreview = (props: ReportPreviewLocalProps) => {
    const [preview, setPreview] = useState<PreviewState>({status: 'loading'});
    const complete = !!props.templateId && !!props.initials && !!props.viewProfileId;

    useEffect(() => {
        if (!complete) {
            return undefined;
        }
        let url: string | null = null;
        let current = true;
        setPreview({status: 'loading'});
        ViewProfileServiceClient.instance().getReportPreview(props.initials, props.viewProfileId, props.templateId)
            .then(pdf => {
                if (!current) {
                    return;
                }
                url = URL.createObjectURL(pdf);
                setPreview({status: 'loaded', url});
            })
            .catch((error: PowerApiError) => current && setPreview({status: 'failed', textKey: failureTextKey(error)}));
        return () => {
            current = false;
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [complete, props.templateId, props.initials, props.viewProfileId]);

    if (!props.templateId) {
        return <PreviewMessage textKey={'ReportPreview.SelectTemplate'}/>;
    }
    if (!complete) {
        return <PreviewMessage textKey={'ReportPreview.SelectViewProfile'}/>;
    }
    switch (preview.status) {
        case 'loading':
            return <div style={{display: 'flex', alignItems: 'center', padding: '16px'}}>
                <CircularProgress size={24}/>
                <PreviewMessage textKey={'ReportPreview.Rendering'}/>
            </div>;
        case 'failed':
            return <PreviewMessage textKey={preview.textKey}/>;
        case 'loaded':
            return <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
                <Typography variant={'caption'} color={'textSecondary'} style={{padding: '4px 8px'}}>
                    {PowerLocalize.get('ReportPreview.PdfHint')}
                </Typography>
                <iframe src={preview.url} title={PowerLocalize.get('ReportPreview.Title')}
                        style={{width: '100%', flex: 1, border: 'none'}}/>
            </div>;
    }
};
