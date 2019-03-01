import * as React from 'react';
import Iframe from 'react-iframe';
import {TemplateService} from '../../../API_CONFIG';


interface ReportPreviewLocalProps {
    templateId: string,
}


export const ReportPreview = (props: ReportPreviewLocalProps) => {

    return <div style={{height: '100%'}}>
        {
            (props.templateId != '') ?
                <Iframe url={TemplateService.getPreview(props.templateId)} width={'100%'} height={'100%'}/>
                : <>Template auswählen</>
        }
    </div>;
};
