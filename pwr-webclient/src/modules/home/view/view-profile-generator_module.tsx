import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {Button, Dialog, Icon, List, ListItem,} from '@material-ui/core';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Template} from '../../../model/view/Template';
import DialogActions from '@material-ui/core/DialogActions/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import DraftsIcon from '@material-ui/icons/Drafts';
import {ReportPreview} from '../../admin/reportmanager/report-preview_module';


interface ViewProfileGeneratorProps {
    viewProfile?: ViewProfile;
    template?: Template;
    allTemplates?: Array<Template>;
}

interface ViewProfileGeneratorLocalProps {
    open: boolean;
    viewProfileId: string;

    onClose(): void;
}

interface ViewProfileGeneratorState {
    activeTemplateId: string;
    activeTemplateNumber: number;
}


interface ViewProfileGeneratorDispatch {
    generate(viewProfileId: string, templateId: string): void;
}

class ViewProfileGenerator extends React.Component<ViewProfileGeneratorProps
    & ViewProfileGeneratorLocalProps
    & ViewProfileGeneratorDispatch,
    ViewProfileGeneratorState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileGeneratorLocalProps): ViewProfileGeneratorProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles().get(localProps.viewProfileId),
            allTemplates: state.templateSlice.templates().toArray(),
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>): ViewProfileGeneratorDispatch {
        return {
            generate: (viewProfileId, templateId) => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId, templateId)),
        };
    }

    constructor(props: ViewProfileGeneratorProps
        & ViewProfileGeneratorLocalProps
        & ViewProfileGeneratorDispatch) {
        super(props);
        this.resetState(props);
    }

    private resetState(props: ViewProfileGeneratorProps
        & ViewProfileGeneratorLocalProps
        & ViewProfileGeneratorDispatch) {
        this.state = {
            activeTemplateId: '',
            activeTemplateNumber: -1,
        };
    }

    private setTemplateId(id: string, localNumber: number) {
        this.setState(
            {
                activeTemplateId: id,
                activeTemplateNumber: localNumber,
            }
        );
    }

    private closeAndReset = () => {
        this.resetState(this.props);
        this.props.onClose();
    };

    private renderListItems = () => {
        let items: any = [];
        let label: string = '';

        if (this.props.allTemplates.length === 0) {
            items.push(
                <p key={'noTemp'}> Keine Templates vorhanden.</p>
            );
        }
        this.props.allTemplates.map((value, index) => {
            items.push(
                <ListItem button title={value.name} className={'pwr-selected-list-item'}
                          key={'TempalteItem_' + value.id} onClick={() => this.setTemplateId(value.id, index)}>
                    <ListItemIcon><DraftsIcon/></ListItemIcon>
                    {value.name}

                </ListItem>
            );
        });

        return items;
    };

    private startGenerate = (viewID: string, tempID: string) => {
        if (tempID == '' || tempID == null) {
            tempID = '-1';
        }

        this.props.generate(viewID, tempID);
    };


    render() {
        return (
            <Dialog
                title={PowerLocalize.get('Generator.Title')}
                open={this.props.open}
                onClose={this.closeAndReset}
                fullWidth
            >
                <DialogTitle>{PowerLocalize.get('Generator.Title')}</DialogTitle>
                <DialogContent>
                    <div className="col-md-5">
                        <h4 className="row">{PowerLocalize.get('Generator.TemplateList')}</h4>
                        <div className="row"
                             style={{maxHeight: 350, overflowY: 'auto', overflowX: 'hidden', minWidth: '200px'}}>
                            <List>
                                {this.renderListItems()}
                            </List>
                        </div>
                    </div>
                    <div className="col-md-6" >
                        <h4 className="row" style={{marginLeft:"2px"}}> {this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].name : ' '}</h4>
                        <div className={"row"} style={{marginLeft:"2px", minHeight:"150px"}}>
                            <ReportPreview templateId={this.state.activeTemplateId}/>
                        </div>
                        {/*
                        <div className={"row"} style={{marginLeft:"2px"}}>
                            {this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].description : PowerLocalize.get('Generator.DescriptionPlaceholder')}
                            <br/>
                            {this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].createUser + '  |  ' : ' '}
                            {this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].createdDate : ' '}
                        </div>
                        */}
                        {/*<div>{this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].id : ' '}</div>*/}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant={'raised'}
                        className="mui-margin"
                        color={'primary'}
                        disabled={this.state.activeTemplateId == ""}
                        onClick={() => this.startGenerate(this.props.viewProfileId, this.state.activeTemplateId)}
                    >
                        <Icon className="material-icons">open_in_new</Icon>
                        {PowerLocalize.get('Action.Generate.Word')}
                    </Button>

                    <Button
                        onClick={this.props.onClose}
                    >
                        <Icon className="material-icons">close</Icon>
                        {PowerLocalize.get('Action.Close')}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ProfileGenerator: React.ComponentClass<ViewProfileGeneratorLocalProps> = connect(ViewProfileGenerator.mapStateToProps, ViewProfileGenerator.mapDispatchToProps)(ViewProfileGenerator);