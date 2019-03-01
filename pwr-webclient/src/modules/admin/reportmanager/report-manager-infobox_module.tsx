import * as React from 'react';
import {Template} from '../../../model/view/Template';
import Typography from '@material-ui/core/Typography/Typography';
import {InfoPaper} from '../../general/info-paper_module.';

interface ReportManagerProps {
    selectedTemplate: Template;
}

export class ReportManagerInfoBox extends React.Component<ReportManagerProps> {
    render() {
        return <InfoPaper title={'Info'}>
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
        </InfoPaper>;
    }
}