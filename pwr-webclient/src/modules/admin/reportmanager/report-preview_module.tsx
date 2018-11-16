import * as React from "react";
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import Iframe from 'react-iframe';



interface ReportPreviewLocalProps{
    id?:string,
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
        return <div>
            {  ((this.props.url != null) && (this.props.url != "")) ?
                <Iframe
                    url={this.props.url}
                    position={"relative"}
                    height={"calc(100vh - 88px)"}

                /> : <div>NO PREVIEW - TODO make pretty</div>
            }
            </div>
    }
}


export const ReportPreview: React.ComponentClass<ReportPreviewLocalProps> = connect(ReportPreviewModule.mapDispatchToProps)(ReportPreviewModule);