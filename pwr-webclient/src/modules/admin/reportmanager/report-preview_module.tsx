import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import Iframe from 'react-iframe';
import {TemplateService} from '../../../API_CONFIG';


interface ReportPreviewProps {

}


interface ReportPreviewLocalProps {
    templateId: string,
}

interface ReportPreviewState {
}

interface ReportPreviewDispatch {

}


class ReportPreviewModule extends React.Component<ReportPreviewProps & ReportPreviewLocalProps & ReportPreviewDispatch, ReportPreviewState> {

    constructor(props: ReportPreviewProps & ReportPreviewLocalProps & ReportPreviewDispatch) {
        super(props);
        this.state = {};

    }

    static mapStateToProps(state: ApplicationState, localProps: ReportPreviewLocalProps): ReportPreviewProps {
        return {};
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ReportPreviewDispatch {
        return {};
    }




    public renderFile = () => {
        if (this.props.templateId != '') {
            return <Iframe url={TemplateService.getPreview(this.props.templateId)} width={'100%'} height={'100%'}/>;
        } else return <>Template auswählen</>;
    };


    render() {
        return <div>
            {this.renderFile()}
        </div>;
    }
}


export const ReportPreview: React.ComponentClass<ReportPreviewLocalProps> = connect(ReportPreviewModule.mapStateToProps, ReportPreviewModule.mapDispatchToProps)(ReportPreviewModule);