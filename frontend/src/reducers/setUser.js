import { SET_USER } from '../actions/index';

// When invoked, setUserReducer updates user state to the current logged user
// On default, it returns the current state
const setUserReducer = (state = {
    userId: undefined,
    username: undefined,
    address: undefined,
    hash: undefined,
    email: undefined,
    isAdmin: false,
    isVerified: false,
}, action) => {
    switch (action.type) {
        case SET_USER:
            state = {
                userId: action.payload.userId,
                username: action.payload.username,
                hash: action.payload.hash,
                email: action.payload.email,
                isVerified: action.payload.isVerified,
                isAdmin: action.payload.isAdmin
            };
            return state;
        default:
            return state;
    }
}

export default setUserReducer;