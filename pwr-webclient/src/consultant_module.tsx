import * as React from 'react';
import * as redux from 'redux';
import {connect} from 'react-redux';
import {Card} from 'material-ui/Card';
import {CardHeader, CardMedia, List, ListItem, RaisedButton, TextField} from 'material-ui';
import {ActionCreator, AsyncActions} from './actions';
import {PowerClientState} from './Store';
import {Col, Row} from 'react-flexbox-grid';


export interface ConsultantProps {
    initials: string;
    firstName: string;
    lastName: string;
    birthDate: string;
}

/**
 * Data that composes a consultant data set.
 */
export interface ConsultantLocalProps {
    /**
     * Initials of the consultant. Usually first letter of firstName and lastName combined
     */
    index: number;

    /**
     * Ref link to the consultants image.
     * Example: "images/nt.jpg"
     */
    image_ref: string;
}

export interface ConsultantState {
    editInactive: boolean;
}

export interface ConsultantDispatch {
    changeInitials: (initials: string, index: number) => void;
    changeFirstname: (firstname: string, index: number) => void;
    changeLastname: (lastname: string, index: number) => void;
    changeBirthdate: (birthdate: string, index:number) => void;
    reloadConsultant: (initials: string) => void;
    saveConsultant: (consultant: ConsultantProps) => void;
}

function mapStateToProps(state: any, consultantProps: ConsultantLocalProps) {
    return {
        initials: state.updateConsultant.consultants[consultantProps.index].initials,
        firstName: state.updateConsultant.consultants[consultantProps.index].firstName,
        lastName: state.updateConsultant.consultants[consultantProps.index].lastName,
        birthDate: state.updateConsultant.consultants[consultantProps.index].birthDate,
    }
}

function mapDispatchToProps(dispatch: redux.Dispatch<PowerClientState>) : ConsultantDispatch {
    return {
        changeInitials: function(newInitials: string, index: number) {
            dispatch(ActionCreator.changeInitials(newInitials, index))
        },
        changeFirstname: function(firstname: string, index: number) {
            dispatch(ActionCreator.changeFirstname(firstname, index));
        },
        changeLastname: function(lastname: string, index: number) {
            dispatch(ActionCreator.changeLastname(lastname, index));
        },
        changeBirthdate: function(birthdate: string, index:number) {
            dispatch(ActionCreator.changeBirthdate(birthdate, index));
        },
        reloadConsultant: function(initials: string) {
            dispatch(AsyncActions.fetchSingleConsultant(initials));
        },
        saveConsultant: function(consultant: ConsultantProps) {
            dispatch(AsyncActions.saveSingleConsultant(consultant));
        }
    }
}


class ConsultantComponent extends
    React.Component<ConsultantProps & ConsultantLocalProps & ConsultantDispatch, ConsultantState> {

    constructor(props: ConsultantProps & ConsultantLocalProps & ConsultantDispatch) {
        super(props);
        this.state = {
            editInactive : true
        }
    }

    handleChangeInitials = (event: React.FormEvent<HTMLSelectElement>) => {
        console.log(this.props);
        console.log(event.currentTarget.value);
        this.props.changeInitials(event.currentTarget.value, this.props.index);
    };

    handelChangeFirstname = (event: React.FormEvent<HTMLSelectElement>) => {
        this.props.changeFirstname(event.currentTarget.value, this.props.index);
    };
    handleChangeLastname = (event: React.FormEvent<HTMLSelectElement>) => {
        this.props.changeLastname(event.currentTarget.value, this.props.index);
    };
    handleChangeBirthdate = (event: React.FormEvent<HTMLSelectElement>) => {
        this.props.changeInitials(event.currentTarget.value, this.props.index);
    };

    handleSaveConsultant = (event: React.MouseEvent<HTMLSelectElement>) => {
        this.props.saveConsultant({
            initials: this.props.initials,
            firstName: this.props.firstName,
            lastName: this.props.lastName,
            birthDate: this.props.birthDate
        });
    };
    handleReloadConsultant = (event: React.MouseEvent<HTMLSelectElement>) => {
        this.props.reloadConsultant(this.props.initials);
    };

    handleToggleEdit = (event: React.MouseEvent<HTMLSelectElement>) => {
        this.setState({editInactive: !this.state.editInactive});
    };


    render() {
        return (
        <Card>
            <CardHeader
                title={this.props.initials + " | hbt"}
                subtitle={this.props.firstName + " " + this.props.lastName}
                avatar={this.props.image_ref}
                actAsExpander={true}
            />
            <CardMedia expandable={true}>
                <img src={this.props.image_ref}/>
            </CardMedia>
            <CardMedia expandable={true}>
                <List>
                    <ListItem>
                        <em>Kürzel:  </em>
                        <TextField
                            disabled={this.state.editInactive}
                            value={this.props.initials}
                            onChange={this.handleChangeInitials}
                        />
                    </ListItem>
                    <ListItem>
                        <em>Vorname:  </em>
                        <TextField
                            disabled={this.state.editInactive}
                            value={this.props.firstName}
                            onChange={this.handelChangeFirstname}
                        />
                    </ListItem>
                    <ListItem>
                        <em>Nachname:  </em>
                        <TextField
                            disabled={this.state.editInactive}
                            value={this.props.lastName}
                            onChange={this.handleChangeLastname}
                        />
                    </ListItem>
                    <ListItem>
                        <em>Geburtstag:  </em>
                        <TextField
                            disabled={this.state.editInactive}
                            value={this.props.birthDate}
                            onChange={this.handleChangeBirthdate}
                        />
                    </ListItem>
                </List>
                <div>
                    <br/>
                    <RaisedButton label="Speichern" onClick={this.handleSaveConsultant} primary={true}/>
                    <RaisedButton label="Laden" onClick={this.handleReloadConsultant} secondary={true}/>
                    <RaisedButton label="ToggleEdit" onClick={this.handleToggleEdit} secondary={true}/>
                    <br/>
                </div>


            </CardMedia>
        </Card>
        );
    }
}

export const Consultant : React.ComponentClass<ConsultantLocalProps> = connect(mapStateToProps, mapDispatchToProps)(ConsultantComponent);