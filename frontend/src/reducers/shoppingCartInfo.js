import { SET_SHOPPING_CART_INFO, UPDATE_AMOUNT, REMOVE_ITEM } from '../actions/index';

// On REMOVE_ITEM:
// shoppingCartInfoReducer removes the given product(action.payload) from the shopping cart items array and updates the total price
// On UPDATE_AMOUNT:
// shoppingCartInfoReducer updates the amount of a given product(action.payload) from the shopping cart items array
// and the total price
// On SET_SHOPPING_CART_INFO:
// shoppingCartInfoReducer adds a new product to the shopping cart items array and updates the total price
const shoppingCartInfoReducer = (state = {
    totalPrice: 0,
    shoppingCartItems: []
}, action) => {
    let totalPrice = state.totalPrice;
    let tempState = state.shoppingCartItems.slice();
    let isExist = false;
    switch (action.type) {
        case REMOVE_ITEM:
            tempState.splice(tempState.indexOf(action.payload), 1);
            totalPrice = tempState.reduce((accumulator, currentItem) => {
                return accumulator + (parseFloat(currentItem.price) * currentItem.amount)
            }, 0);
            return {
                totalPrice: totalPrice,
                shoppingCartItems: tempState
            };
        case UPDATE_AMOUNT:
            isExist = tempState.find(shoppingCartItem => {
                return shoppingCartItem._id === action.payload._id
            });
            tempState.forEach(shoppingCartItem => {
                if (shoppingCartItem._id === action.payload._id) {
                    shoppingCartItem.amount = parseInt(action.payload.amount)
                }
            });
            totalPrice = tempState.reduce((accumulator, currentItem) => {
                return accumulator + (parseFloat(currentItem.price) * currentItem.amount)
            }, 0);
            return {
                totalPrice: totalPrice,
                shoppingCartItems: tempState
            };
        case SET_SHOPPING_CART_INFO:
            isExist = tempState.find(shoppingCartItem => {
                return shoppingCartItem._id === action.payload._id
            });
            if (isExist === undefined) {
                tempState.push({
                    _id: action.payload._id,
                    name: action.payload.name,
                    price: action.payload.price,
                    amount: action.payload.amount
                })
            } else {
                tempState.forEach(shoppingCartItem => {
                    if (shoppingCartItem._id === action.payload._id) {
                        shoppingCartItem.amount += 1;
                    }
                })
            }
            totalPrice = tempState.reduce((accumulator, currentItem) => {
                return accumulator + (parseFloat(currentItem.price) * currentItem.amount)
            }, 0);
            return {
                totalPrice: totalPrice,
                shoppingCartItems: tempState
            };
        default:
            return state;
    }
}
export default shoppingCartInfoReducer;