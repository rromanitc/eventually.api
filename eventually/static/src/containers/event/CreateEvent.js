import React from 'react';
import axios from 'axios';
import { GetTeamsListService, PostEventService } from './EventService';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import SelectField from 'material-ui/SelectField';
import DatePicker from 'material-ui/DatePicker';
import TimePicker from 'material-ui/TimePicker';


const FlatButtonStyle = {
    position: 'fixed',
    right: '3%',
    top: '85%'
};

const dateStyle = {
    display: 'inline-block',
    width: '50%'
};

class CreateEvent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            team: 0,
            description: '',
            startAt: new Date() / 1000,
            timeEnd: new Date() / 1000,
            budget: 0,
            status: 0,
            teams: [],
            open: false
        };
    }

    getData = () => {
        GetTeamsListService().then(response => {
            this.setState({teams: response.data.teams});
        });
    }

    componentWillMount() {
        this.getData();
    }

    handleChangeName = event => {
        this.setState({name: event.target.value});
    };

    handleChangeStartAt = (event, date) => {
        this.setState({startAt: date / 1000});
    };

    handleChangeTimeEnd = (event, date) => {
        this.setState({timeEnd: date / 1000});
    };

    handleChangeDuration = event => {
        this.setState({duration: event.target.value});
    };

    handleChangeBudget = event => {
        this.setState({budget: event.target.value});
    };

    handleChangeTeam = (event, index, value) => {
        this.setState({team: value});
    };

    handleChangeDescription = event => {
        this.setState({description: event.target.value});
    };

    handleChangeStatus = (event, index, value) => {
        this.setState({status: value});
    };

    handleSubmit = event => {
        event.preventDefault();

        const data = {
            'name': this.state.name,
            'description': this.state.description,
            'start_at': this.state.startAt,
            'duration': this.state.timeEnd - this.state.startAt,
            'budget': Number(this.state.budget),
            'team': this.state.team,
            'status': this.state.status
        };
        PostEventService(data);
        this.handleClose();
    }

    handleOpen = () => {
        this.setState({ open: true });
    }

    handleClose = () => {
        this.setState({ open: false });
    }

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleClose}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                keyboardFocused={true}
                onClick={this.handleSubmit}
            />,
        ];

        return (
            <div>
                <form>
                    <FloatingActionButton
                        onClick={this.handleOpen}
                        style={FlatButtonStyle}>
                        <ContentAdd />
                    </FloatingActionButton>
                    <Dialog
                        title={this.props.title}
                        actions={actions}
                        modal={false}
                        open={this.state.open}
                        onRequestClose={this.handleClose}
                        autoScrollBodyContent={true}>
                        <TextField
                            hintText="Name"
                            fullWidth={true}
                            value={this.state.name}
                            onChange={this.handleChangeName}/>
                        <TextField
                            value={this.state.description}
                            hintText="Description"
                            multiLine={true}
                            rowsMax={4}
                            fullWidth={true}
                            onChange={this.handleChangeDescription}/>
                        <DatePicker hintText="Portrait Dialog"
                            floatingLabelText="Start date and time"
                            style={dateStyle}
                            mode="landscape"
                            value={new Date(this.state.startAt * 1000)}
                            onChange={this.handleChangeStartAt}/>
                        <TimePicker hintText="12hr Format"
                            style={dateStyle}
                            value={new Date(this.state.startAt * 1000)}
                            format="24hr"
                            onChange={this.handleChangeStartAt}/>
                        <DatePicker hintText="Portrait Dialog"
                            floatingLabelText="End date and time"
                            style={dateStyle}
                            mode="landscape"
                            value={new Date(this.state.timeEnd * 1000)}
                            onChange={this.handleChangeTimeEnd}/>
                        <TimePicker hintText="12hr Format"
                            style={dateStyle}
                            value={new Date(this.state.timeEnd * 1000)}
                            format="24hr"
                            onChange={this.handleChangeTimeEnd}/>
                        <SelectField
                            floatingLabelText="Team"
                            value={this.state.team}
                            fullWidth={true}
                            onChange={this.handleChangeTeam}>
                            {
                                this.state.teams.map(team => {
                                    return <MenuItem value={team.id} key={team.id} primaryText={team.name} />;
                                })
                            }
                        </SelectField>
                        <TextField
                            hintText="Budget"
                            floatingLabelText="Budget"
                            fullWidth={true}
                            value={this.state.budget}
                            onChange={this.handleChangeBudget}/>
                        <SelectField
                            floatingLabelText="Status"
                            value={this.state.status}
                            onChange={this.handleChangeStatus}>
                            <MenuItem value={0} primaryText="draft" />
                            <MenuItem value={1} primaryText="published" />
                            <MenuItem value={2} primaryText="going" />
                            <MenuItem value={3} primaryText="finished" />
                        </SelectField>
                    </Dialog>
                </form>
            </div>
        );
    }
}

export default CreateEvent;