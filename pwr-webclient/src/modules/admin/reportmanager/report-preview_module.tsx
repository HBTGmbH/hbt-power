import * as React from 'react';
import {TemplateClient} from '../../../clients/TemplateClient';


interface ReportPreviewLocalProps {
    templateId: string,
}


export const ReportPreview = (props: ReportPreviewLocalProps) => {

    return <div style={{height: '100%'}}>
        {
            (props.templateId != '') ?
                <iframe src={TemplateClient.instance().getPreviewURL(props.templateId)}
                        style={{width: '100%', height: '10ß0%'}}/>
                : <>Template auswählen</>
        }
    </div>;
};
