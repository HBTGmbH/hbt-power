import {combineReducers} from 'redux';
import {databaseReducer} from './singleProfile/database-reducer';

const ApplicationStore = combineReducers({
    databaseReducer
});

export default ApplicationStore;