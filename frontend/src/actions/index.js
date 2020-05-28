// Actions (types)
export const TOGGLE_LOGGED = 'TOGGLE_LOGGED';
export const SET_SHOPPING_CART_INFO = 'SET_SHOPPING_CART_INFO';
export const UPDATE_AMOUNT = 'UPDATE_AMOUNT';
export const REMOVE_ITEM = 'REMOVE_ITEM';
export const SET_USER = 'SET_USER';

// Action Creators 
export const toggleLogged = () => {
    return {
        type: TOGGLE_LOGGED
    }
}

export const setShoppingCartInfo = shoppingCartItem => {
    return {
        type: SET_SHOPPING_CART_INFO,
        payload: shoppingCartItem
    }
}

export const updateAmount = amount => {
    return {
        type: UPDATE_AMOUNT,
        payload: amount
    }
}

export const removeItem = itemToRemove => {
    return {
        type: REMOVE_ITEM,
        payload: itemToRemove
    }
}

export const setUser = user => {
    return {
        type: SET_USER,
        payload: user
    }
}