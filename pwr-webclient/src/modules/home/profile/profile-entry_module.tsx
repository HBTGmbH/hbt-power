import {ApplicationState} from '../../../reducers/reducerIndex';
import * as redux from 'redux';
import {connect} from 'react-redux';
import * as React from 'react';
import {isNullOrUndefined} from 'util';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from '@material-ui/core/Grid/Grid';
import Button from '@material-ui/core/Button/Button';
import {ProfileEntryType} from '../../../reducers/profile-new/profile/model/ProfileEntryType';
import {ProfileTypeDataMapper} from '../../../reducers/profile-new/profile/ProfileTypeDataMapper';
import {NameEntity} from '../../../reducers/profile-new/profile/model/NameEntity';
import {PwrIconButton} from '../../general/pwr-icon-button';
import {PwrDeleteConfirm} from '../../general/pwr-delete-confirm';
import Divider from '@material-ui/core/Divider/Divider';
import {ProfileEntryDialog} from './profile-entry-edit_module';
import {ProfileEntry} from '../../../reducers/profile-new/profile/model/ProfileEntry';
import {PwrRaisedButton} from '../../general/pwr-raised-button';
import {Add} from '@material-ui/icons';
import {PowerLocalize} from '../../../localization/PowerLocalizer';

interface ProfileEntryProps {
    allEntries: Array<ProfileEntry>;
    suggestions: Array<string>;
    initials: string;
}

interface ProfileEntryLocalProps {
    type: ProfileEntryType;

    renderSingleElementInfo(entry: ProfileEntry, id: number): JSX.Element;
}

interface ProfileEntryDispatch {
    updateEntity(initials: string, entry: ProfileEntry): void;

    deleteEntry(initials: string, id: number);
}

interface ProfileEntryState {
    selectId: number;
    editId: number;
    selectEntry: ProfileEntry;
    deleteConfirm: boolean;
    searchText: string;
    addNew: boolean;
    open: boolean;
}

class ProfileEntryModule extends React.Component<ProfileEntryProps & ProfileEntryLocalProps & ProfileEntryDispatch, ProfileEntryState> {
    constructor(props) {
        super(props);
        this.resetState();
    }

    private resetState() {

        this.state = {
            selectId: -1,
            editId: -1,
            selectEntry: null,
            deleteConfirm: false,
            searchText: '',
            addNew: false,
            open: false,
        };
    }

    private setDefaultState = () => {
        this.setState({
            selectId: -1,
            editId: -1,
            selectEntry: null,
            deleteConfirm: false,
            searchText: '',
            addNew: false,
            open: false,
        });
    };

    static mapStateToProps(state: ApplicationState, localProps: ProfileEntryLocalProps): ProfileEntryProps {
        const profileField = ProfileTypeDataMapper.getProfileField(localProps.type);
        const entries = (!isNullOrUndefined(profileField) && !isNullOrUndefined(state.profileStore.profile)) ? state.profileStore.profile[profileField] : [];
        const suggestionField = ProfileTypeDataMapper.getSuggestionField(localProps.type);
        const suggestionData: Array<NameEntity> = !isNullOrUndefined(suggestionField) && !isNullOrUndefined(state.suggestionStore) ? state.suggestionStore[suggestionField] : [];
        const suggestionNames = !isNullOrUndefined(suggestionData) ? suggestionData.map(e => e.name) : [];
        const initials = !isNullOrUndefined(state.profileStore.consultant) ? state.profileStore.consultant.initials : '';
        return {
            allEntries: entries,
            suggestions: suggestionNames,
            initials: initials,
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<ApplicationState>, localProps: ProfileEntryLocalProps): ProfileEntryDispatch {
        return {
            updateEntity: ProfileTypeDataMapper.getUpdateFunction(localProps.type, dispatch),
            deleteEntry: ProfileTypeDataMapper.getDeleteFunction(localProps.type, dispatch)
        };
    }

    private handleNewButton = () => {
        this.setState({
            selectEntry: null,
            open: true,
        });
    };

    private handleUpdateButton = () => {
        this.props.updateEntity(this.props.initials, null);
    };

    private handleDeleteButton = (initials: string, id: number) => {
        this.props.deleteEntry(initials, id);
    };

    private handleEditButton = (entry: ProfileEntry, id: number) => {
        this.setState({
            open: true,
            selectEntry: entry
        });
    };

    private handleDialogOnClose = () => {
        this.setDefaultState();
    };

    private handleSingleOnClick = (entry: ProfileEntry, id: number) => {
        this.setState({
            selectEntry: entry,
            selectId: id
        });
    };

    private renderSingleElement = (entry: ProfileEntry, id: number) => {
        return (
            <Grid key={id} item container alignItems={'flex-end'} spacing={8}
                  onClick={() => this.handleSingleOnClick(entry, id)}
                  style={{minHeight: 48,cursor:'pointer'}}
            >
                <Grid item container md={2} spacing={0} style={{padding: 0}}>
                    {
                        this.state.selectId != id ? <></> :
                            <Grid>
                                <PwrIconButton iconName={'delete'} tooltip={'Löschen'}
                                               onClick={() => this.setState({deleteConfirm: true})}/>

                                <PwrDeleteConfirm onClose={() => this.setState({deleteConfirm: false})}
                                                  infoText={'Willst du \'' + entry.nameEntity.name + '\' wirklich löschen?'}
                                                  header={'Löschen Bestätigen'}
                                                  open={this.state.deleteConfirm}
                                                  onConfirm={() => this.handleDeleteButton(this.props.initials, this.state.selectEntry.id)}/>

                                <PwrIconButton iconName={'create'} tooltip={'Bearbeiten'}
                                               onClick={() => this.handleEditButton(entry, id)}/>
                            </Grid>
                    }
                </Grid>
                <Grid item>
                    <Typography variant={'h5'}> {entry.nameEntity.name}</Typography>
                </Grid>
                <Grid item>
                    {
                        this.props.renderSingleElementInfo(entry, id)
                    }
                </Grid>
            </Grid>
        );
    };

    render() {
        return (
            <div>
                <ProfileEntryDialog open={this.state.open} onClose={this.handleDialogOnClose} type={this.props.type}
                                    entry={this.state.selectEntry}/>
                <Grid container spacing={0} alignItems={'center'} style={{border: '1px', backgroundColor: '#efefef'}}>
                    <Grid item md={9}>
                        <Typography
                            variant={'h2'}
                            style={{fontSize: '2em'}}
                        >{ProfileTypeDataMapper.getHeaderText(this.props.type).toUpperCase()}</Typography>
                    </Grid>
                    <Grid item md={3}>
                        <PwrRaisedButton onClick={this.handleNewButton} color={'primary'} icon={<Add/>} text={PowerLocalize.get('Action.Add')}/>
                    </Grid>
                    <Grid item md={12}>
                        <Divider style={{marginTop: '2px'}}/>
                    </Grid>
                    <Grid item container md={10}>
                        {
                            !isNullOrUndefined(this.props.allEntries) && this.props.allEntries.length > 0 ?
                                this.props.allEntries.map(this.renderSingleElement) :
                                <Typography>Kein Eintrag Gefunden</Typography>
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export const ProfileEntryElement: React.ComponentClass<ProfileEntryLocalProps> = connect(ProfileEntryModule.mapStateToProps, ProfileEntryModule.mapDispatchToProps)(ProfileEntryModule);
