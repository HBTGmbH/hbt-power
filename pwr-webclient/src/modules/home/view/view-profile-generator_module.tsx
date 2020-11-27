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
import {PwrSelectableList} from '../../general/Pwr-selecable-list';
import AppBar from '@material-ui/core/AppBar/AppBar';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {ThunkDispatch} from 'redux-thunk';


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

    navigateTo(target: string): void;

    loadAllTemplates(): void;
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

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ViewProfileGeneratorDispatch {
        return {
            navigateTo: target => dispatch(NavigationActionCreator.AsyncNavigateTo(target)),
            generate: (viewProfileId, templateId) => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId, templateId)),
            loadAllTemplates: () => dispatch(TemplateActionCreator.AsyncLoadAllTemplates())
        };
    }

    constructor(props: ViewProfileGeneratorProps
        & ViewProfileGeneratorLocalProps
        & ViewProfileGeneratorDispatch) {
        super(props);
        this.resetState(props);
    }

    componentDidMount(): void {
        this.props.loadAllTemplates();
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
                fullScreen
                style={{overflowY: 'scroll'}}
            >
                <DialogTitle>{PowerLocalize.get('Generator.Title')}</DialogTitle>
                <DialogContent>
                    <AppBar>
                        <Toolbar>
                            <Button
                                color={'secondary'}
                                variant={'outlined'}
                                className="mui-margin"
                                disabled={this.state.activeTemplateId == ''}
                                onClick={() => this.startGenerate(this.props.viewProfileId, this.state.activeTemplateId)}
                            >
                                <Icon className="material-icons">open_in_new</Icon>
                                {PowerLocalize.get('Action.Generate.Word')}
                            </Button>

                            <Button
                                variant={'outlined'}
                                color={'secondary'}
                                onClick={this.props.onClose}
                            >
                                <Icon className="material-icons">close</Icon>
                                {PowerLocalize.get('Action.Close')}
                            </Button>
                        </Toolbar>
                    </AppBar>
                    <div className="col-md-4">
                        <h4 className="row">{PowerLocalize.get('Generator.TemplateList')}</h4>
                        <div className="row">
                            <List>
                                <PwrSelectableList>
                                    {this.renderListItems()}
                                </PwrSelectableList>
                            </List>
                        </div>
                    </div>
                    <div className="col-md-8">
                        <h4 className="row"
                            style={{marginLeft: '2px'}}> {this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].name : ' '} </h4>
                        <div className={'row'} style={{marginLeft: '2px', height: 'calc(100vh - 300px)'}}>
                            <ReportPreview templateId={this.state.activeTemplateId}/>
                        </div>

                        <div className={'row'} style={{marginLeft: '2px'}}>
                            {this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].description : PowerLocalize.get('Generator.DescriptionPlaceholder')}

                            {this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].createUser + '  |  ' : ' '}
                            {this.state.activeTemplateId !== '' ? this.props.allTemplates[this.state.activeTemplateNumber].createdDate : ' '}
                        </div>

                    </div>
                </DialogContent>

            </Dialog>
        );
    }
}

export const ProfileGenerator: React.ComponentClass<ViewProfileGeneratorLocalProps> = connect(ViewProfileGenerator.mapStateToProps, ViewProfileGenerator.mapDispatchToProps)(ViewProfileGenerator) as any;
