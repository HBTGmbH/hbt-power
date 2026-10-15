import {ApplicationState} from '../../../reducers/reducerIndex';
import {connect} from 'react-redux';
import * as React from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from '@material-ui/core/Grid/Grid';
import {ProfileEntryType} from '../../../reducers/profile-new/profile/model/ProfileEntryType';
import {ProfileTypeDataMapper} from '../../../reducers/profile-new/profile/ProfileTypeDataMapper';
import {NameEntity} from '../../../reducers/profile-new/profile/model/NameEntity';
import {PwrIconButton} from '../../general/pwr-icon-button';
import Divider from '@material-ui/core/Divider/Divider';
import {ProfileEntryDialog} from './profile-entry-edit_module';
import {ProfileEntry} from '../../../reducers/profile-new/profile/model/ProfileEntry';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {Theme, withTheme} from '@material-ui/core';
import {PwrFormSubCaption} from '../../general/pwr-typography';
import {Comparators} from '../../../utils/Comparators';
import {ThunkDispatch} from 'redux-thunk';

interface ProfileEntryProps {
    allEntries: Array<ProfileEntry>;
    suggestions: Array<string>;
    initials: string;
}

interface ProfileEntryLocalProps {
    type: ProfileEntryType;
    theme: Theme;

    renderSingleElementInfo(entry: ProfileEntry, id: number): JSX.Element;
}

interface ProfileEntryDispatch {
    updateEntity(initials: string, entry: ProfileEntry): void;

    deleteEntry(initials: string, id: number);
}

interface ProfileEntryState {
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
        const entries = (profileField && state.profileStore.profile) ? state.profileStore.profile[profileField] : [];
        const suggestionField = ProfileTypeDataMapper.getSuggestionField(localProps.type);
        const suggestionData: Array<NameEntity> = !!(suggestionField) && !!(state.suggestionStore) ? state.suggestionStore[suggestionField] : [];
        const suggestionNames = suggestionData?.map(e => e.name) || [];
        const initials = state.profileStore.consultant?.initials || '';
        return {
            allEntries: entries,
            suggestions: suggestionNames,
            initials: initials,
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>, localProps: ProfileEntryLocalProps): ProfileEntryDispatch {
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

    private handleDeleteButton = (id: number) => {
        this.props.deleteEntry(this.props.initials, id);
    };

    private handleEditButton = (entry: ProfileEntry) => {
        this.setState({
            open: true,
            selectEntry: entry
        });
    };

    private handleDialogOnClose = () => {
        this.setDefaultState();
    };

    private compareEntries = (entry1: ProfileEntry, entry2: ProfileEntry) => {
        return Comparators.compareProfileEntries(this.props.type, entry1, entry2);
    };

    private renderSingleElement = (entry: ProfileEntry) => {
        return (
            <Grid key={entry.id} item container spacing={0}>
                <Grid item xs={2} sm={2} md={1} lg={1} xl={1}>
                    <PwrIconButton iconName='delete' tooltip={PowerLocalize.get('Action.Delete')}
                                   onClick={() => this.handleDeleteButton(entry.id)}/>
                </Grid>
                <Grid xs={10} sm={10} md={11} lg={11} xl={11} key={entry.id} item container alignItems={'flex-end'}
                      spacing={0} className="cursor-pointer"
                      onClick={() => this.handleEditButton(entry)}
                >
                    <Grid item className="pwr-profile-entry-name" xs={12} sm={12} md={12} lg={12} xl={12}>
                        <Typography className="pwr-profile-entry-name" variant={'subtitle1'}>
                            {entry.nameEntity.name}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                        {
                            this.props.renderSingleElementInfo(entry, entry.id)
                        }
                    </Grid>
                </Grid>
            </Grid>
        );
    };

    private renderEmptyElement = () => {
        return <Grid item container alignItems={'flex-end'} spacing={0}>
            <Grid item className="pwr-profile-entry-name" xs={12} sm={12} md={12} lg={12} xl={12}>
                <Typography className="pwr-profile-entry-name"
                            variant={'subtitle1'}>{PowerLocalize.get('Profile.Entries.NotAvailable')}</Typography>
            </Grid>
        </Grid>;
    };

    render() {
        return (
            <div className="pwr-profile-entry-container">
                <ProfileEntryDialog open={this.state.open} onClose={this.handleDialogOnClose} type={this.props.type}
                                    entry={this.state.selectEntry}/>
                <Grid container spacing={0} alignItems={'center'}>
                    <Grid item md={9}>
                        <PwrFormSubCaption>
                            {PowerLocalize.get(`ProfileEntryType.${this.props.type}.Header`)}
                        </PwrFormSubCaption>
                        <p>
                            {PowerLocalize.get(`ProfileEntryType.${this.props.type}.Info`)}
                        </p>
                    </Grid>
                    <Grid item md={3}>
                        <PwrIconButton iconName={'add'} tooltip={PowerLocalize.get('Action.Add')}
                                       onClick={this.handleNewButton}/>
                    </Grid>
                    <Grid item md={12} sm={12} xs={12} lg={12} xl={12}>
                        <Divider variant={'fullWidth'}
                                 style={{height: '2px', backgroundColor: this.props.theme.palette.primary.dark}}/>
                    </Grid>
                    <Grid item container spacing={1} md={12} sm={12}>
                        {
                            this.props.allEntries && this.props.allEntries.length > 0 ?
                                this.props.allEntries.sort(this.compareEntries).map(this.renderSingleElement) :
                                this.renderEmptyElement()
                        }
                    </Grid>
                </Grid>
            </div>
        );
    }

}

export const ProfileEntryElement = withTheme((connect(ProfileEntryModule.mapStateToProps, ProfileEntryModule.mapDispatchToProps)(ProfileEntryModule)));
