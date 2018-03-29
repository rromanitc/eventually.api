import React from 'react';
import { Link } from 'react-router';
import { withRouter } from 'react-router-dom';
import { Card, CardActions, CardHeader } from 'material-ui/Card';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import { lightGreen400 } from 'material-ui/styles/colors';
import ParticipantListDialog from './ParticipantListDialog';
import {getAnswers} from './VoteService';
import {getAnswersWithMembers} from './VoteService';
import {putAnswer} from './VoteService';
import {getUserId} from 'src/helper';

const raisedButtonDivStyle = {
    display: 'flex',
    justifyContent: 'flex-end'
};

const styles = {
    radioButton: {
        marginBottom: 16
    },
    raisedButton: {
        marginLeft: 10
    }
};

class StandardVote extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            answers: [],
            radioButtons: [],
            teamId: this.props.teamId,
            participants: [],
            potentialParticipants: [],
            openParticipants: false,
            openPotentialParticipants: false
        };
    }

    getData = () => {
        getAnswers(this.props.eventId, this.props.voteId).then(response => {
            this.setState(response.data);

            const buttons = this.getRadioButtons();
            this.setState({radioButtons: buttons});

            this.setParticipants();
            this.setPotentialParticipants();
        });
    }

    setParticipants = () => {
        getAnswersWithMembers(this.props.eventId, this.props.voteId).then(response => {
            const answer = response.data['answers_members'].find(answer => {
                return answer['text'] == 'I will go';
            });
            this.setState({participants: answer.members});
        });
    };

    setPotentialParticipants = () => {
        getAnswersWithMembers(this.props.eventId, this.props.voteId).then(response => {
            const answer = response.data['answers_members'].find(answer => {
                return answer['text'] == 'Maybe I will come';
            });
            this.setState({potentialParticipants: answer.members});
        });
    };

    getRadioButtons() {
        return this.state.answers.map(answer => {
            let choice = 'checked' + answer.id;
            if (answer.checked) {
                choice = 'checked';
            }

            return <RadioButton
                key={answer.id.toString()}
                value={choice}
                label={answer.text}
                style={styles.radioButton}
                id={answer.id}
                disabled={this.props.disabled}
            />;
        });
    }

    getAnswer = answerId => {
        return this.state.answers.find(function(answer) {
            return answer.id == answerId;
        });
    };

    getPreviousAnswer = userId => {
        return this.state.answers.find(function(answer) {
            return answer.members.includes(userId);
        });
    };

    handleChangeButton = event => {
        const answerId = event.target.id;
        let previousAnswerId = undefined;
        const previousAnswer = this.getPreviousAnswer(getUserId());
        if (previousAnswer) {
            previousAnswerId = previousAnswer.id;
        }

        if (!this.getAnswer(answerId).members.includes(getUserId())) {
            this.submitAnswer(
                this.state.teamId,
                this.props.eventId,
                this.props.voteId,
                answerId
            ).then(response => {
                this.setState({answers: this.state.answers});

                this.setParticipants();
                this.setPotentialParticipants();

                if (previousAnswerId) {
                    this.reSubmitAnswer(
                        this.state.teamId,
                        this.props.eventId,
                        this.props.voteId,
                        previousAnswerId
                    ).then(response => {
                        this.setState({answers: this.state.answers});

                        this.setParticipants();
                        this.setPotentialParticipants();
                    });
                }
            });
        }
    }

    getAnswerByText = (text) => {
        return this.state.answers.find(function(answer) {
            return answer.text == text;
        });
    };

    submitAnswer = (teamId, eventId, voteId, answerId) => {
        let answer = this.getAnswer(answerId);
        answer.members.push(getUserId());

        const members = answer.members;
        return putAnswer(teamId, eventId, voteId, answerId, members);
    };

    reSubmitAnswer = (teamId, eventId, voteId, previousAnswerId) => {
        let previousAnswer = this.getAnswer(previousAnswerId);
        const index = previousAnswer.members.indexOf(getUserId());
        previousAnswer.members.splice(index, 1);

        const members = previousAnswer.members;
        return putAnswer(teamId, eventId, voteId, previousAnswerId, members);
    };

    componentWillMount() {
        this.getData();
    }

    handleOpenParticipants = () => {
        this.setState({openParticipants: true});
    }

    handleOpenPotentialParticipants = () => {
        this.setState({openPotentialParticipants: true});
    }

    handleCloseParticipants = () => {
        this.setState({openParticipants: false});
    };

    handleClosePotentialParticipants = () => {
        this.setState({openPotentialParticipants: false});
    };

    render() {
        return (
            <div>
                <Card>
                    <CardHeader
                        actAsExpander={true}
                        showExpandableButton={false}
                        title={this.props.title}
                    />
                    <CardActions>
                        <div>
                            <RadioButtonGroup name="shipSpeed" defaultSelected="checked"
                                onChange={this.handleChangeButton}>
                                {this.state.radioButtons}
                            </RadioButtonGroup>
                        </div>
                        <div style={raisedButtonDivStyle}>
                            <RaisedButton
                                label={'Participants'}
                                onClick={this.handleOpenParticipants}
                                style={styles.raisedButton}
                                backgroundColor={lightGreen400}
                                disabled={this.state.participants.length == 0 ? true : false}/>
                            <ParticipantListDialog
                                participants={this.state.participants}
                                open={this.state.openParticipants}
                                handleCloseParticipants={this.handleCloseParticipants}
                            />
                            <RaisedButton
                                label={'Potential Participants'}
                                onClick={this.handleOpenPotentialParticipants}
                                style={styles.raisedButton}
                                backgroundColor={lightGreen400}
                                disabled={this.state.potentialParticipants.length == 0 ? true : false}/>
                            <ParticipantListDialog
                                participants={this.state.potentialParticipants}
                                open={this.state.openPotentialParticipants}
                                handleCloseParticipants={this.handleClosePotentialParticipants}
                            />
                        </div>
                    </CardActions>
                </Card>
            </div >
        );
    }
}
export default withRouter(StandardVote);
