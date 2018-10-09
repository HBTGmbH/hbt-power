import * as React from "react";
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import Iframe from 'react-iframe';



interface ReportPreviewLocalProps{
    id?:string,
    htmlString?: string,
    url?: string,
}

interface ReportPreviewDispatch{
    loadPreview(id:string):void,
}


class ReportPreviewModule extends React.Component<ReportPreviewLocalProps & ReportPreviewDispatch> {

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportPreviewDispatch {
        return {
            loadPreview: (id:string) => dispatch(TemplateActionCreator.AsyncLoadPreview(id)),
        }
    }

    render(){
        return <Iframe
            url={this.props.url}
            position={"relative"}
            height={"900px"}

        />;
    }
}


export const ReportPreview: React.ComponentClass<ReportPreviewLocalProps> = connect(ReportPreviewModule.mapDispatchToProps)(ReportPreviewModule);