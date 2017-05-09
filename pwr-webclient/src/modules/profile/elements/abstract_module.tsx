import {connect} from 'react-redux';
import * as React from 'react';
import * as redux from 'redux';
import {AllConsultantsState, ApplicationState} from '../../../Store';
import {Color} from '../../../utils/ColorUtil';
import {Col, Grid, Row} from 'react-flexbox-grid';
import {LinearProgress, TextField} from 'material-ui';
import {ProfileActionCreator} from '../../../reducers/singleProfile/ProfileActionCreator';

interface DescriptionProps {
    abstractText: string;
}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface DescriptionLocalProps {
    initialMaxCharacters: number;
    hintText: string;
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface DescriptionLocalState {
    maxCharacters: number;
    currentBarColor: string;
}

/**
 *
 */
interface DescriptionDispatch {
    changeAbstract(newAbstract: string) : void;
}

/**
 * Text area module that allows coounting of input characters and enforces a max length.
 * <p>
 *     This text area is within this module is encapsulated in a grid and is, therefor, responsive.
 */
class DescriptionModule extends React.Component<DescriptionLocalProps & DescriptionProps & DescriptionDispatch, DescriptionLocalState> {


    constructor(props: DescriptionLocalProps & DescriptionProps & DescriptionDispatch) {
        super(props);
        this.state = {
            maxCharacters: props.initialMaxCharacters,
            currentBarColor: DescriptionModule.calcColor(props.abstractText.length, props.initialMaxCharacters).toCSSRGBString()
        }
    }

    private static calcColor(charCount: number, maxChars: number): Color {
        let color: Color;
        if(charCount >= maxChars) {
            color = Color.Red;
        } else {
            color = Color.LERP(Color.Green, Color.Red, charCount / maxChars);
        }
        return color;
    }

    public static mapStateToProps(state: ApplicationState, localProps: DescriptionLocalProps) : DescriptionProps {
        return {
            abstractText: state.databaseReducer.profile().description()
        };
    }

    public static mapDispatchToProps(dispatch: redux.Dispatch<AllConsultantsState>) : DescriptionDispatch {
        return {
            changeAbstract : function(newAbstract: string) {
                dispatch(ProfileActionCreator.changeAbstract(newAbstract));
            }
        };
    }

    private handleTextChange = (event: React.FormEvent<HTMLSelectElement>) => {
        let charCount: number = event.currentTarget.value.length;
        let newString: string = event.currentTarget.value.substring(0, this.state.maxCharacters);
        this.props.changeAbstract(newString);
        this.setState({
            currentBarColor: DescriptionModule.calcColor(newString.length, this.state.maxCharacters).toCSSRGBString()
        });
    };

    render() {
        return(
            <Grid fluid>
                <TextField
                    hintText = {this.props.hintText}
                    floatingLabelText = {this.props.hintText}
                    fullWidth = {true}
                    multiLine={true}
                    rows={10}
                    onChange={this.handleTextChange}
                    value={this.props.abstractText}
                />
                <Row>
                    <Col xs={12} sm={8} md={3} lg={3} >
                        <LinearProgress
                            min={0}
                            max={this.state.maxCharacters}
                            value={this.props.abstractText.length}
                            mode="determinate"
                            color={this.state.currentBarColor}
                        />
                    </Col>
                    <div>Zeichen: {this.props.abstractText.length}/{this.state.maxCharacters}</div>
                </Row>
            </Grid>
        );
    }
}

export const ProfileDescription: React.ComponentClass<DescriptionLocalProps> = connect(DescriptionModule.mapStateToProps, DescriptionModule.mapDispatchToProps)(DescriptionModule);