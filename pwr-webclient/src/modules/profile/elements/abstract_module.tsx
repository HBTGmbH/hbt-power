import {connect} from 'react-redux';
import * as React from 'react';
import {LinearProgress, TextField} from 'material-ui';
import {Col, Grid, Row} from 'react-flexbox-grid';
import {Color} from '../../../utils/ColorUtil';


interface AbstractTextProps {

}

/**
 * Local properties of this module. These properties are used to initialize the local state and to control everything that
 * is solely used for the display layer.
 * Data that is intended not only for disply, but also for persistence operations has to be placed in the Props interface,
 * and is being managed by redux.
 */
interface AbstractTextLocalProps {
    initialMaxCharacters: number;
    hintText: string;
}

/**
 * Local state of this module. Everything that has a state, but is still view layer only. This includes modifiying colors,
 * flags that indicate if a component is displayed, etc..
 * There is no need for a non-local state, as redux will manage this part.
 */
interface AbstractTextLocalState {
    maxCharacters: number;
    currentCharacters: number;
    currentText: string;
    currentBarColor: string;
}

/**
 *
 */
interface AbstractTextDispatch {

}

/**
 * Text area module that allows coounting of input characters and enforces a max length.
 * <p>
 *     This text area is within this module is encapsulated in a grid and is, therefor, responsive.
 */
class AbstractTextModule extends React.Component<AbstractTextLocalProps, AbstractTextLocalState> {


    constructor(props: AbstractTextLocalProps) {
        super(props);
        this.state = {
            maxCharacters: props.initialMaxCharacters,
            currentCharacters: 0,
            currentText : "",
            currentBarColor: "green"
        };
    }


    handleTextChange = (event: React.FormEvent<HTMLSelectElement>) => {
        let charCount: number = event.currentTarget.value.length;
        let newString: string;
        let color: Color;
        if(charCount >= this.state.maxCharacters) {
            // Truncate the string so it fits.
            newString = event.currentTarget.value.substring(0, this.state.maxCharacters);
            color = Color.Red;
        } else {
            newString = event.currentTarget.value;
            color = Color.LERP(Color.Green, Color.Red, charCount / this.state.maxCharacters);
        }
        this.setState({
            currentText: newString,
            currentCharacters: newString.length,
            currentBarColor: color.toCSSRGBString()
        });
    };

    render() {
        return(
            <Grid fluid>
                <TextField
                    hintText = {this.props.hintText}
                    fullWidth = {true}
                    multiLine={true}
                    rows={10}
                    onChange={this.handleTextChange}
                    value={this.state.currentText}
                />
                <Row>
                    <Col xs={12} sm={8} md={3} lg={3} >
                        <LinearProgress
                            min={0}
                            max={this.state.maxCharacters}
                            value={this.state.currentCharacters}
                            mode="determinate"
                            color={this.state.currentBarColor}
                        />
                    </Col>
                    <div>Zeichen: {this.state.currentCharacters}/{this.state.maxCharacters}</div>
                </Row>
            </Grid>
        );
    }
}

export const AbstractText: React.ComponentClass<AbstractTextLocalProps> = connect()(AbstractTextModule);