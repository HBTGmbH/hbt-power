import * as React from 'react';
import {useEffect, useState} from 'react';
import {Typography} from '@material-ui/core';
import {TemplateClient} from '../../../clients/TemplateClient';
import {PowerLocalize} from '../../../localization/PowerLocalizer';


interface ReportPreviewLocalProps {
    templateId: string,
}

type PreviewState =
    | { status: 'loading' }
    | { status: 'missing' }
    | { status: 'failed' }
    | { status: 'loaded', url: string };

const PreviewMessage = (props: { textKey: string }) =>
    <Typography color={'textSecondary'} style={{padding: '16px'}}>{PowerLocalize.get(props.textKey)}</Typography>;

/**
 * Shows the stored PDF preview of a template. It is loaded with the token and shown through a blob URL: an iframe
 * pointing at the API directly would not send the token, and the edge would reject the request.
 */
export const ReportPreview = (props: ReportPreviewLocalProps) => {
    const [preview, setPreview] = useState<PreviewState>({status: 'loading'});

    useEffect(() => {
        if (!props.templateId) {
            return undefined;
        }
        let url: string | null = null;
        let current = true;
        setPreview({status: 'loading'});
        TemplateClient.instance().getPreviewPdf(props.templateId)
            .then(pdf => {
                if (!current) {
                    return;
                }
                if (!pdf) {
                    setPreview({status: 'missing'});
                    return;
                }
                url = URL.createObjectURL(pdf);
                setPreview({status: 'loaded', url});
            })
            .catch(() => current && setPreview({status: 'failed'}));
        return () => {
            current = false;
            if (url) {
                URL.revokeObjectURL(url);
            }
        };
    }, [props.templateId]);

    if (!props.templateId) {
        return <PreviewMessage textKey={'ReportPreview.SelectTemplate'}/>;
    }
    switch (preview.status) {
        case 'loading':
            return <PreviewMessage textKey={'ReportPreview.Loading'}/>;
        case 'missing':
            return <PreviewMessage textKey={'ReportPreview.NotAvailable'}/>;
        case 'failed':
            return <PreviewMessage textKey={'ReportPreview.Failed'}/>;
        case 'loaded':
            return <iframe src={preview.url} title={PowerLocalize.get('ReportPreview.Title')}
                           style={{width: '100%', height: '100%', border: 'none'}}/>;
    }
};
