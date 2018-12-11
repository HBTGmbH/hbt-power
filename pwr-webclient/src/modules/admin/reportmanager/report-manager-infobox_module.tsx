import {connect} from 'react-redux';
import * as React from 'react';
import {Template} from '../../../model/view/Template';
import Button from '@material-ui/core/Button/Button';
import Divider from '@material-ui/core/Divider/Divider';
import Typography from '@material-ui/core/Typography/Typography';
import {PwrIconHeader} from '../../general/pwr-icon-header';

interface ReportManagerProps {
    selectedTemplate:Template;
}

export class ReportManagerInfoBox extends React.Component<ReportManagerProps>{
    render(){
        return <div>
            <PwrIconHeader muiIconName={'info_outline'} title={'Info'}/>
            <div>
                <div className={'report-text-field'}>
                    <Typography variant={'body2'}>Name</Typography>
                    <Typography variant={'subheading'}>{this.props.selectedTemplate.name}</Typography>
                </div>
                <div className={'report-text-field'}>
                    <Typography variant={'body2'}>Beschreibung</Typography>
                    <Typography
                        variant={'subheading'}>{this.props.selectedTemplate.description}</Typography>
                </div>
                <div className={'report-text-field'}>
                    <Typography variant={'body2'}>Ersteller</Typography>
                    <Typography
                        variant={'subheading'}>{this.props.selectedTemplate.createUser}</Typography>
                </div>
                <div className={'report-text-field'}>
                    <Typography variant={'body2'}>Datum</Typography>
                    <Typography
                        variant={'subheading'}>{this.props.selectedTemplate.createdDate}</Typography>
                </div>
                <div className={'report-text-field'}>
                    <Typography variant={'body2'}>Id</Typography>
                    <Typography variant={'subheading'}>{this.props.selectedTemplate.id}</Typography>
                </div>
            </div>
        </div>
    }
}