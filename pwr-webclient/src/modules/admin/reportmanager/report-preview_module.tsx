import * as React from 'react';
import Iframe from 'react-iframe';
import {TemplateClient} from '../../../clients/TemplateClient';


interface ReportPreviewLocalProps {
    templateId: string,
}


export const ReportPreview = (props: ReportPreviewLocalProps) => {

    return <div style={{height: '100%'}}>
        {
            (props.templateId != '') ?
                <Iframe url={TemplateClient.instance().getPreviewURL(props.templateId)} width={'100%'} height={'100%'}/>
                : <>Template auswählen</>
        }
    </div>;
};
