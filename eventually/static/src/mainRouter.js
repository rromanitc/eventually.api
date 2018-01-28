import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import Home from './containers/Home';
import Profile from './containers/profile/Profile';
import UserProgress from './containers/userProgress/UserProgress';
import Item from './containers/item/Item';
import CurriculumList from './containers/curriculum/CurriculumList';
import MentorItem from './containers/mentor_item/MentorItem';
import MentorDashboard from './containers/mentorDashboard/MentorDashboard';
import TeamList from './containers/teamList/TeamList';
import EventList from './containers/event/EventList';
import AddEventTask from './containers/eventTask/AddEventTask';
import EventTaskList from './containers/eventTaskList/EventTaskList';
import EventEditButton from './containers/event/EventEditButton';

export default class MainRouter extends React.Component {
    render() {
        return (
            <main>
                <Switch>
                    <Route path='/home' component={Home} />
                    <Route path='/profile/:profileId' component={Profile}/>
                    <Route path='/progress' component={UserProgress}/>
                    <Route path='/curriculums' component={CurriculumList}/>
                    <Route path='/item/:itemId' component={Item} />
                    <Route path='/mentoritem' component={MentorItem}/>
                    <Route path='/dashboard' component={MentorDashboard}/>
                    <Route path='/teamlist' component={TeamList}/>
                    <Route path='/events/:eventId/tasks' component={EventTaskList}/>
                    <Route path='/events' component={EventList}/>
                    <Route path='/new_task' component={AddEventTask}/>
                    <Route path='/events/:eventId' component={CurriculumList}/>
                    <Route path='/eventedit/' component={EventEditButton}/>
                    <Redirect path='*' to='/home' />
                </Switch>
            </main>
        );
    }
}
