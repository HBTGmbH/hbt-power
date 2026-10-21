import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {Dialog, DialogActions, List, ListItem} from '@material-ui/core';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {Template} from '../../../model/view/Template';
import DialogTitle from '@material-ui/core/DialogTitle/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent/DialogContent';
import ListItemIcon from '@material-ui/core/ListItemIcon/ListItemIcon';
import DraftsIcon from '@material-ui/icons/Drafts';
import {ReportPreview} from '../../admin/reportmanager/report-preview_module';
import {PwrSelectableList} from '../../general/Pwr-selecable-list';
import {NavigationActionCreator} from '../../../reducers/navigation/NavigationActionCreator';
import {TemplateActionCreator} from '../../../reducers/template/TemplateActionCreator';
import {ThunkDispatch} from 'redux-thunk';


interface ViewProfileGeneratorProps {
    initials?: string;
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
            initials: state.profileStore.consultant.initials,
            viewProfile: state.viewProfileSlice.viewProfiles.get(localProps.viewProfileId),
            allTemplates: state.templateSlice.templates.toArray(),
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
        this.resetState();
    }

    componentDidMount(): void {
        this.props.loadAllTemplates();
    }


    private resetState() {
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
        this.resetState();
        this.props.onClose();
    };

    private renderListItems = () => {
        let items: any = [];

        if (this.props.allTemplates.length === 0) {
            items.push(
                <p key={'noTemp'}>{PowerLocalize.get('Generator.NoTemplates')}</p>
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
        if (tempID === '' || !tempID) {
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
                        {/* Full height of the screen: title and template name above (~130px), description and button bar below (~110px) */}
                        <div className={'row'} style={{marginLeft: '2px', height: 'calc(100vh - 240px)'}}>
                            <ReportPreview templateId={this.state.activeTemplateId}
                                           initials={this.props.initials}
                                           viewProfileId={this.props.viewProfileId}/>
                        </div>

                        <div className={'row'} style={{marginLeft: '2px'}}>
                            {this.state.activeTemplateId !== ''
                                ? [this.props.allTemplates[this.state.activeTemplateNumber].description,
                                    this.props.allTemplates[this.state.activeTemplateNumber].createUser,
                                    this.props.allTemplates[this.state.activeTemplateNumber].createdDate].filter(part => !!part).join('  |  ')
                                : PowerLocalize.get('Generator.DescriptionPlaceholder')}
                        </div>

                    </div>
                </DialogContent>
                {/* The button bar of the forms (#134) instead of an app bar of its own */}
                <DialogActions>
                    <PwrFormActions editing noSpace saveText={PowerLocalize.get('Action.Generate.Word')} saveIcon="open_in_new"
                                    saveDisabled={this.state.activeTemplateId === ''}
                                    onSave={() => this.startGenerate(this.props.viewProfileId, this.state.activeTemplateId)}
                                    onCancel={this.closeAndReset}/>
                </DialogActions>
            </Dialog>
        );
    }
}

export const ProfileGenerator: React.ComponentClass<ViewProfileGeneratorLocalProps> = connect(ViewProfileGenerator.mapStateToProps, ViewProfileGenerator.mapDispatchToProps)(ViewProfileGenerator) as any;
