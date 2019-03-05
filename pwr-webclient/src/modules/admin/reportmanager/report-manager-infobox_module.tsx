import * as React from 'react';
import {Template, TemplateSlice} from '../../../model/view/Template';
import Typography from '@material-ui/core/Typography/Typography';
import {InfoPaper} from '../../general/info-paper_module.';
import {PwrIconButton} from '../../general/pwr-icon-button';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import * as redux from 'redux';
import Dialog from '@material-ui/core/Dialog/Dialog';
import {ReportManagerEditDialog} from './report-manager-edit-dialog';

interface ReportManagerProps {
    selectedTemplate: Template;
}

interface ReportManagerInfoState {
    open:boolean;
}

export class ReportManagerInfoBox extends React.Component<ReportManagerProps ,ReportManagerInfoState> {

    constructor(props: ReportManagerProps) {
        super(props);
        this.state = {
            open: false,
        };
    }

    private toggleChangeTemplate = () => {

        this.setState({
            open: !this.state.open
        })
    };



    render() {
        return <InfoPaper title={'Info'}>
            <ReportManagerEditDialog open={this.state.open} templateId={this.props.selectedTemplate.id}  onClose={this.toggleChangeTemplate}/>
            <div>
                <div className={'report-text-field'}>
                    <Typography variant={'subheading'}>Name</Typography>
                    <Typography variant={'body1'}>{this.props.selectedTemplate.name}</Typography>
                </div>
                <div className={'report-text-field'}>
                    <Typography variant={'subheading'}>Beschreibung</Typography>
                    <Typography variant={'body1'}>{this.props.selectedTemplate.description}</Typography>
                </div>
                <div className={'report-text-field'}>
                    <Typography variant={'subheading'}>Ersteller</Typography>
                    <Typography variant={'body1'}>{this.props.selectedTemplate.createUser}</Typography>
                </div>
                <div className={'report-text-field'}>
                    <Typography variant={'subheading'}>Datum</Typography>
                    <Typography variant={'body1'}>{this.props.selectedTemplate.createdDate}</Typography>
                </div>
                <div className={'report-text-field'}>
                    <Typography variant={'subheading'}>Id</Typography>
                    <Typography variant={'body1'}>{this.props.selectedTemplate.id}</Typography>
                </div>
            </div>
            <div>
                <div>
                    <PwrIconButton iconName={'settings'} tooltip={'Bearbeiten'} onClick={this.toggleChangeTemplate}/>
                </div>
            </div>
        </InfoPaper>;
    }
}