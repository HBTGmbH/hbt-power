import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState, LanguageSkill} from '../../Store';
import {List, Paper, Card, CardMedia, CardHeader, Divider} from 'material-ui';
import {SingleLanguage} from './singleLanguage_module';
import {PowerLocalize} from '../../localization/PowerLocalizer';

interface LanguageProps {
    languages: LanguageSkill[];
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface LanguageLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface LanguageLocalState {

}

interface LanguageDispatch {

}

class LanguagesModule extends React.Component<LanguageProps & LanguageLocalProps & LanguageDispatch, LanguageLocalState> {

    private static renderSingleLanguage(language: LanguageSkill, index: number) {
        return(<SingleLanguage index={index} key={index}/>);
    }

    static mapStateToProps(state: ApplicationState, localProps: LanguageLocalProps) : LanguageProps {
        return {
            languages: state.singleProfile.profile.languages
        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : LanguageDispatch {
        return {

        };
    }

    render() {
        return(
            <Card>
                <CardHeader actAsExpander={true}
                    title={PowerLocalize.get("Language.Plural")}
                    subtitle={this.props.languages.length + " " + PowerLocalize.get("Language.Plural")}
                >
                </CardHeader>
                <Divider/>
                <CardMedia expandable={true}>
                    <List>
                        {this.props.languages.map(LanguagesModule.renderSingleLanguage)}
                    </List>
                </CardMedia>
            </Card>
        );
    }
}

export const LanguageSkills: React.ComponentClass<LanguageLocalProps> = connect(LanguagesModule.mapStateToProps, LanguagesModule.mapDispatchToProps)(LanguagesModule);