import {connect} from 'react-redux';
import * as React from 'react';
import {ApplicationState} from '../../../reducers/reducerIndex';
import {ViewProfile} from '../../../model/view/ViewProfile';
import {Button, Dialog, Icon, Paper, Tooltip, Typography} from '@material-ui/core';
import {ViewProfileEntriesOverview} from './view-profile-entries-overview_module';
import {ViewProfileProjectsOverview} from './view-profile-projects-overview_module';
import {ProfileGenerator} from './view-profile-generator_module';
import {ViewProfileSkillOverview} from './view-profile-skill-overview_module';
import {PowerLocalize} from '../../../localization/PowerLocalizer';
import {ViewProfileActionCreator} from '../../../reducers/view/ViewProfileActionCreator';
import {LimitedTextField} from '../../general/limited-text-field-module';
import {PROFILE_DESCRIPTION_LENGTH} from '../../../model/PwrConstants';
import {ViewProfileUpdateDialog} from './view-profile-update-dialog_module';
import {ThunkDispatch} from 'redux-thunk';
import {IViewEntry} from '../../../model/view/IViewEntry';
import {PwrFormActions} from '../../general/pwr-form-actions';
import {PwrButton} from '../../general/pwr-button';
import {PwrSpacer} from '../../general/pwr-spacer_module';
import {PwrFormCaption, PwrFormSubtitle} from '../../general/pwr-typography';
import {ComparableEntryButton} from './entries/comprable-entry-button_module';
import {SortableEntryType} from '../../../model/view/NameComparableType';


interface ViewProfileOverviewProps {
    viewProfile: ViewProfile;
    isInProgress: boolean;
}


interface ViewProfileOverviewLocalProps {
    match?: any;
    location?: any;
    history?: any;
}

interface ViewProfileOverviewLocalState {
    currentDescription: string;
    descriptionDisabled: boolean;
    generatorOpen: boolean;
    updateDialogOpen: boolean;
}

interface ViewProfileOverviewDispatch {
    generate(viewProfileId: string, templateId: string): void;

    setDescription(description: string, viewProfileId: string): void;
}

class ViewProfileOverviewModule extends React.Component<ViewProfileOverviewProps
    & ViewProfileOverviewLocalProps
    & ViewProfileOverviewDispatch, ViewProfileOverviewLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ViewProfileOverviewLocalProps): ViewProfileOverviewProps {
        return {
            viewProfile: state.viewProfileSlice.viewProfiles.get(localProps.match.params.id),
            isInProgress: state.viewProfileSlice.sortInProgress
        };
    }

    static mapDispatchToProps(dispatch: ThunkDispatch<any, any, any>): ViewProfileOverviewDispatch {
        return {
            generate: viewProfileId => dispatch(ViewProfileActionCreator.AsyncGenerateDocX(viewProfileId, '2')),
            setDescription: (description, viewProfileId) => dispatch(ViewProfileActionCreator.AsyncSetDescription(description, viewProfileId))
        };
    }

    constructor(props: ViewProfileOverviewProps & ViewProfileOverviewLocalProps & ViewProfileOverviewDispatch) {
        super(props);
        this.state = {
            currentDescription: !!(props.viewProfile) ? props.viewProfile.description : '',
            descriptionDisabled: true,
            generatorOpen: false,
            updateDialogOpen: false,
        };
    }

    private readonly headerRef = React.createRef<HTMLDivElement>();

    /**
     * Opened with a section in the URL (#view-section-…): there once the view profile is loaded
     */
    public componentDidMount() {
        if (this.props.viewProfile && this.hash()) {
            window.setTimeout(() => this.scrollToSection(this.hash(), 'auto'), 0);
        }
    }

    public componentDidUpdate(prevProps: ViewProfileOverviewProps & ViewProfileOverviewLocalProps & ViewProfileOverviewDispatch) {
        if (prevProps.viewProfile !== this.props.viewProfile) {
            this.setState({
                currentDescription: !!(this.props.viewProfile) ? this.props.viewProfile.description : ''
            });
        }
        if (!prevProps.viewProfile && this.props.viewProfile && this.hash()) {
            window.setTimeout(() => this.scrollToSection(this.hash(), 'auto'), 0);
        }

    }

    private handleToggleEdit = (enabled: boolean) => {
        this.setState({
            descriptionDisabled: enabled
        });
        if (enabled) {
            this.props.setDescription(this.state.currentDescription, this.props.viewProfile.id);
        }
    };

    private setGeneratorOpen(open: boolean) {
        this.setState({
            generatorOpen: open
        });
    }

    private toggleUpdateDialog() {
        this.setState({
            updateDialogOpen: !this.state.updateDialogOpen
        });
    }

    private sections(): Array<Section> {
        const viewProfile = this.props.viewProfile;
        const masterData: Array<Array<IViewEntry>> = [viewProfile.educations, viewProfile.careers, viewProfile.keySkills,
            viewProfile.qualifications, viewProfile.trainings, viewProfile.sectors, viewProfile.projectRoles, viewProfile.languages];
        // A skill of a hidden category is not in the export either
        const skills = (viewProfile.displayCategories || []).flatMap(category =>
            (category.displaySkills || []).map(skill => category.enabled && skill.enabled));
        return [
            {
                key: 'MASTER_DATA',
                title: PowerLocalize.get('ViewProfileOverview.MasterData'),
                ...count(masterData.flatMap(entries => (entries || []).map(entry => entry.enabled))),
            },
            {
                key: 'PROJECTS',
                title: PowerLocalize.get('ViewProfileOverview.Projects'),
                ...count((viewProfile.projects || []).map(project => project.enabled)),
            },
            {
                key: 'SKILLS',
                title: PowerLocalize.get('ViewProfileOverview.Skills'),
                ...count(skills),
            },
        ];
    }

    private hash(): string {
        return ((this.props.location && this.props.location.hash) || '').replace(/^#/, '');
    }

    /**
     * Scrolls the section to just below the sticky header, which covers the top of the page
     */
    private scrollToSection(id: string, behavior: ScrollBehavior) {
        const section = document.getElementById(id);
        if (!section) {
            return;
        }
        const header = this.headerRef.current;
        const covered = header ? parseFloat(window.getComputedStyle(header).top) + header.offsetHeight : 0;
        window.scrollTo({top: section.getBoundingClientRect().top + window.scrollY - covered - 16, behavior});
    }

    private jumpTo = (event: React.MouseEvent, id: string) => {
        event.preventDefault();
        this.props.history.replace({...this.props.location, hash: '#' + id});
        this.scrollToSection(id, 'smooth');
    };

    private renderHeader(viewProfile: ViewProfile) {
        return <Paper ref={this.headerRef} className="pwr-view-profile-header">
            <div className="pwr-view-profile-title-row">
                <div className="pwr-view-profile-title">
                    <PwrFormSubtitle>{PowerLocalize.get('ViewProfileOverview.Caption')}</PwrFormSubtitle>
                    <PwrFormCaption>{viewProfile.viewProfileInfo.name}</PwrFormCaption>
                </div>
                <div className="pwr-view-profile-actions">
                    <PwrFormActions editing={false} noSpace
                                    editText={PowerLocalize.get('Action.Generate.Word')} editIcon={'open_in_new'}
                                    onEdit={() => this.setGeneratorOpen(true)}>
                        <PwrButton color={'primary'} text={PowerLocalize.get('Action.Update')}
                                   icon={<Icon className="material-icons">replay</Icon>}
                                   onClick={() => this.toggleUpdateDialog()}/>
                    </PwrFormActions>
                </div>
            </div>
            <PwrSpacer size="tight"/>
            <nav className="pwr-view-profile-nav" aria-label={PowerLocalize.get('ViewProfileOverview.Sections')}>
                {this.sections().map(section =>
                    <Tooltip key={section.key}
                             title={PowerLocalize.getFormatted('ViewProfileOverview.Count', section.enabled, section.total)}>
                        <Button color="primary" href={'#' + sectionAnchor(section.key)}
                                onClick={(e: React.MouseEvent) => this.jumpTo(e, sectionAnchor(section.key))}>
                            {section.title}
                            <span className="pwr-view-profile-nav-count">{section.enabled + '/' + section.total}</span>
                        </Button>
                    </Tooltip>)}
            </nav>
        </Paper>;
    }

    private renderSection(key: SectionKey, content: React.ReactNode, actions?: React.ReactNode) {
        const title = this.sections().find(section => section.key === key).title;
        return <>
            <PwrSpacer size="section"/>
            <section id={sectionAnchor(key)} className="pwr-view-profile-section">
                <PwrSpacer/>
                <div className="pwr-view-profile-section-title">
                    <Typography variant="h6">{title}</Typography>
                    {actions}
                </div>
                <PwrSpacer/>
                {content}
            </section>
        </>;
    }

    render() {
        if (!(this.props.viewProfile)) {
            return <Paper className="pwr-view-profile-content">
                <Typography>{PowerLocalize.get('ViewProfileOverview.NotFound')}</Typography>
            </Paper>;
        } else {
            let viewProfileId = this.props.match.params.id;
            return (<div>
                {/* Holds back clicks while the entries are being sorted */}
                <Dialog
                    open={this.props.isInProgress}
                    style={{color: 'rgb(255, 255, 255, 0)', opacity: 0}}
                >
                    <span style={{color: 'white', opacity: 1}}>{PowerLocalize.get('ViewProfileOverview.Sorting')}</span>
                </Dialog>
                <ProfileGenerator
                    open={this.state.generatorOpen}
                    onClose={() => this.setGeneratorOpen(false)}
                    viewProfileId={this.props.viewProfile.id}
                />
                <ViewProfileUpdateDialog
                    open={this.state.updateDialogOpen}
                    onClose={() => this.toggleUpdateDialog()}
                    viewProfileId={this.props.viewProfile.id}
                />

                {this.renderHeader(this.props.viewProfile)}

                <Paper className="pwr-view-profile-content">
                    <div className={this.state.descriptionDisabled ? 'pwr-read-only' : undefined}>
                        <LimitedTextField
                            disabled={this.state.descriptionDisabled}
                            onToggleEdit={this.handleToggleEdit}
                            useToggleEditButton={true}
                            maxCharacters={PROFILE_DESCRIPTION_LENGTH}
                            label={PowerLocalize.get('Profile.Description')}
                            value={this.state.currentDescription}
                            fullWidth={true}
                            minRows={this.state.descriptionDisabled ? 1 : 5}
                            multiLine={true}
                            onChange={(e, v) => {
                                this.setState({currentDescription: v});
                            }}
                        />
                    </div>
                    {this.renderSection('MASTER_DATA', <ViewProfileEntriesOverview viewProfileId={viewProfileId}/>)}
                    {this.renderSection('PROJECTS', <ViewProfileProjectsOverview viewProfileId={viewProfileId}/>)}
                    {/* The categories are cards without a header row: their sorting goes into the heading */}
                    {this.renderSection('SKILLS', <ViewProfileSkillOverview viewProfileId={viewProfileId}/>,
                        <Typography variant="body2" component="span" className="pwr-view-profile-section-sort">
                            <ComparableEntryButton sortableEntryType={SortableEntryType.DISPLAY_CATEGORY}
                                                   sortableEntryField="name"
                                                   label={PowerLocalize.get('ViewProfileOverview.SortCategories')}
                                                   viewProfileId={viewProfileId}/>
                        </Typography>)}
                </Paper>
            </div>);
        }
    }
}

type SectionKey = 'MASTER_DATA' | 'PROJECTS' | 'SKILLS';

interface Section {
    key: SectionKey;
    title: string;
    /** In the export */
    enabled: number;
    total: number;
}

function count(enabled: Array<boolean>): { enabled: number, total: number } {
    return {enabled: enabled.filter(e => e).length, total: enabled.length};
}

/**
 * Jump target of a section (#149), e.g. #view-section-PROJECTS
 */
export function sectionAnchor(key: SectionKey): string {
    return 'view-section-' + key;
}

/**
 * @see ViewProfileOverviewModule
 * @author nt
 * @since 11.09.2017
 */
export const ViewProfileOverview: React.ComponentClass<ViewProfileOverviewLocalProps> = connect(ViewProfileOverviewModule.mapStateToProps, ViewProfileOverviewModule.mapDispatchToProps)(ViewProfileOverviewModule) as any;
