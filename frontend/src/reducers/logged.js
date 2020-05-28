import { TOGGLE_LOGGED } from '../actions/index';

// When invoked, loggedReducer updates isLogged state to it's opposite
// On default, it returns the current state
const loggedReducer = (state = false, action) => {
    switch (action.type) {
        case TOGGLE_LOGGED:
            return !state;
        default:
            return state;
    }
}

export default loggedReducer;