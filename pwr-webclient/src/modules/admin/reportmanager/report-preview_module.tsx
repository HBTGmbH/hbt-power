import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import Iframe from 'react-iframe';
import {ReportPreviewFile} from '../../../model/view/ReportPreviewFile';
import {Template} from '../../../model/view/Template';
import {TemplateService} from '../../../API_CONFIG';


interface ReportPreviewProps {

    files:Immutable.Map<string,ReportPreviewFile>,
    templates:Immutable.Map<string,Template>,
}


interface ReportPreviewLocalProps {
    templateId: string,
}

interface ReportPreviewState {
    reportPreviewFile:ReportPreviewFile,
}

interface ReportPreviewDispatch {
    loadPreview(filename: string): void,
    loadPreviewFromReport(filename: string):void,
}


class ReportPreviewModule extends React.Component<ReportPreviewProps & ReportPreviewLocalProps & ReportPreviewDispatch, ReportPreviewState> {

    constructor(props:ReportPreviewProps & ReportPreviewLocalProps & ReportPreviewDispatch){
        super(props);
        this.state= {
            reportPreviewFile:null,
        };
        //console.log("report-preview_module#constructor: finished");
    }

    static mapStateToProps(state: ApplicationState, localProps: ReportPreviewLocalProps): ReportPreviewProps {
        return {
            files: state.templateSlice.previews(),
            templates: state.templateSlice.templates()
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportPreviewDispatch {
        return {
            loadPreview: (templateId: string) => dispatch(TemplateActionCreator.AsyncLoadPreview(templateId)),
            loadPreviewFromReport: (filename:string) => dispatch(TemplateActionCreator.AsyncLoadPreviewFromReport(filename)),
        };
    }

    public componentWillMount(){
        //console.log("report-preview_module#componentsWillMount");
        if(this.props.templateId != ""){
           this.props.loadPreview(this.props.templateId);
        }
    }

    public componentDidMount(){
        this.props.loadPreview(this.props.templateId);
        if(this.props.files != null) {
            if (this.props.files[this.props.templateId] != null) {
                this.setState({
                    reportPreviewFile: this.props.files[this.props.templateId],
                })
            }else{
                //console.log("report_preview_module#ComponentDidMount: files[templateID] == null");
            }
        }else{
           // console.log("report_preview_module#ComponentDidMount: files == null");
        }
    }

    public componentDidUpdate(){
        if(this.props.templateId != "" && this.state.reportPreviewFile == null ){
            //console.log("componentDidUpdate: loadFromReport");
            //this.props.loadPreviewFromReport(this.props.templates.get(this.props.templateId).previewFilename);
        }

       // console.log("report-preview_module: files",this.props.files);
    }


    public renderFile = () => {
        if(this.props.templateId != ""){
            return<Iframe
                //url={TemplateService.getPreview(this.props.templateId)}
                url ={"http://power02.corp.hbt.de:9000/pwr-view-profile-service/template/preview/"+this.props.templateId}
            />; // FIXME url as string works TODO
        }  else return <></>
    };



    render() {
        return <div>
            {this.renderFile()}
        </div>;
    }
}


export const ReportPreview: React.ComponentClass<ReportPreviewLocalProps> = connect(ReportPreviewModule.mapStateToProps, ReportPreviewModule.mapDispatchToProps)(ReportPreviewModule);