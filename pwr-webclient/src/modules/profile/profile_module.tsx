
import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../Store';
import {Card, CardHeader, Divider, Drawer, Menu, MenuItem, Paper} from 'material-ui';
import {Grid, Row} from 'react-flexbox-grid';
import {AbstractText} from './elements/abstract_module';
import {LanguageSkills} from './elements/languages_module';
import {Sectors} from './elements/sectors_module';
import {Career} from './elements/career_module';
import {Education} from './elements/eduction_module';
import {Qualifications} from './elements/qualification_module';

interface ProfileProps {

}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface ProfileLocalProps {

}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface ProfileLocalState {

}

interface ProfileDispatch {

}

class ProfileModule extends React.Component<ProfileProps & ProfileLocalProps & ProfileDispatch, ProfileLocalState> {

    static mapStateToProps(state: ApplicationState, localProps: ProfileLocalProps) : ProfileProps {
        return {

        };
    }

    static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : ProfileDispatch {
        return {

        };
    }

    render() {
        return(
            <div className="row">
                <div className="col-md-1"/>
                <div className="col-md-2">
                    <Paper>
                        <Drawer docked={false}>
                            <MenuItem primaryText="Werbetext"/>
                            <MenuItem primaryText="Sprache"/>
                            <MenuItem primaryText="Branchen"/>
                            <MenuItem primaryText="Werdegang"/>
                            <MenuItem primaryText="Ausbildung"/>
                        </Drawer>
                    </Paper>
                </div>
                <div className="col-md-7">
                    <Card>
                        <CardHeader
                            title="John Doe"
                            avatar="/img/crazy_lama.jpg"
                        />
                        <br/>
                        <Divider/>
                        <AbstractText
                            hintText="Werbetext"
                            initialMaxCharacters={500}
                        />
                        <Divider/>
                        <LanguageSkills/>
                        <Divider/>
                        <Sectors/>
                        <Divider/>
                        <Career/>
                        <Divider/>
                        <Education/>
                        <Divider/>
                        <Qualifications/>
                    </Card>
                </div>
                <div className="col-md-2"/>
            </div>
        );
    }
}

export const Profile: React.ComponentClass<ProfileLocalProps> = connect(ProfileModule.mapStateToProps, ProfileModule.mapDispatchToProps)(ProfileModule);