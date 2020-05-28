// Reducer Imports
import loggedReducer from './logged';
import shoppingCartInfoReducer from './shoppingCartInfo';
import setUserReducer from './setUser';
import { combineReducers } from 'redux';

const reducers = combineReducers({
    loggedReducer: loggedReducer,
    shoppingCartInfoReducer: shoppingCartInfoReducer,
    setUserReducer: setUserReducer
});

export default reducers;