import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Subheader from 'material-ui/Subheader';
import SuggestedTopicsEdit from './SuggestedTopicsEdit';
import InterestedUsersChips from './InterestedUsersChips';
import {getUserId} from 'src/helper';
import Chip from 'material-ui/Chip';
import {putSuggestedTopicsItem} from './SuggestedTopicsService';


const styles = {
    container: {
        'backgroundRepeat': 'no-repeat',
        'backgroundPosition': 'center',
        'backgroundSize': 'cover',
        'borderRadius': 10,
        'borderWidth': 1,
        'borderColor': 'black',
        'borderStyle': 'solid',
        'padding': 15,
        'width': '90%',
        'margin': '0 auto',
        'marginTop': 37
    },
    topics: {
        backgroundColor: 'rgba(208, 208, 208, 0.8)',
        borderRadius: 10,
        padding: 7,
    },
    header: {
        fontSize: '21px',
        color: 'black',
    },
    description: {
        textAlign: 'justify',
    },
    button: {
        float: 'right',
        marginTop: 10,
    },
    footer: {
        clear: 'both'
    },
    chip: {
        margin: 4,
    },
    wrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
};


export default class SuggestedTopicsItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open : false,
            name: this.props.name,
            description: this.props.description,
            owner: this.props.owner,
            interestedUsersId: this.props.interestedUsersId,
            interestedUsersName: this.props.interestedUsersName,
            removeInterest: false,
            joinButtonLabel: '',
        };
    }

    componentWillMount(){
        this.handleUserInTopic();
    }

    handleUserInTopic = () => {
        if (this.state.interestedUsersId.indexOf(getUserId()) === -1){
            this.setState({joinButtonLabel: 'Join'});
            this.setState({removeInterest: false});
        } else {
            this.setState({joinButtonLabel: 'Leave'});
            this.setState({removeInterest: true});
        }
    };

    /*update old prop*/
    componentWillReceiveProps(nextProps){
        this.setState({
            name: nextProps.name,
            description: nextProps.description,
        });
    }

    /*open dialog for editing*/
    handleOpen = () => {
        this.setState({open: true});
    };

    /*close dialog for editing*/
    handleClose = () => {
        this.setState({open: false});
    };

    /*check if user is author of suggested topic*/
    ownerCheck = () => {
        if (getUserId() == this.state.owner){
            return true;
        } else {
            return false;
        }
    };

    /*switch button from 'Join' to 'Leave' and backwards */
    switchJoinButton = () => {
        if (this.state.removeInterest === false){
            this.setState({joinButtonLabel: 'Leave'});
            this.setState({removeInterest: true});
        } else {
            this.setState({joinButtonLabel: 'Join'});
            this.setState({removeInterest: false});
        }
        this.handleInterested();
    }

    handleInterested = () => {
        const id = this.props.id;
        const name = this.state.name;
        const description = this.state.description;
        const interestedUser = getUserId();
        const removeInterest = this.state.removeInterest;
        putSuggestedTopicsItem(id, name, description, interestedUser, removeInterest).then(response => {
            this.props.updateTopic(id, name, description, interestedUser);
        });
    };

    render() {
        let editButton = '';
        if (this.ownerCheck()==true && ((this.state.interestedUsersId.length == 0)
        || ((this.state.interestedUsersId.includes(getUserId())) && (this.state.interestedUsersId.length <= 1))))
        {
            editButton = <RaisedButton
                label='Edit'
                secondary={true}
                style={styles.button}
                onClick={this.handleOpen}
            />;
        }

        return (
            <div style={styles.container}>
                <div style={styles.topics}>
                    <Subheader style={styles.header}> {this.state.name} </Subheader>
                    <div style={styles.description}> {this.state.description} </div>
                    {editButton}
                    <RaisedButton
                        onClick={this.switchJoinButton}
                        label={this.state.joinButtonLabel}
                        primary={true}
                        style={styles.button}
                    />
                    <div style={styles.wrapper}>
                        {this.state.interestedUsersName.map( involved => (
                            <InterestedUsersChips
                                key={involved}
                                text={involved} />
                        ))}
                    </div>
                    <div style={styles.footer}></div>
                </div>

                <SuggestedTopicsEdit
                    id = {this.props.id}
                    name = {this.props.name}
                    description = {this.props.description}
                    updateTopic = {this.props.updateTopic}
                    open = {this.state.open}
                    handleClose = {this.handleClose}
                />
            </div>
        );
    }
}
