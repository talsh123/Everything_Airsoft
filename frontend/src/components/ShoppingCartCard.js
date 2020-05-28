import React, { Component } from 'react';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class ShoppingCartCard extends Component {
    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;
    }

    updateAmount = () => {
        const amountField = document.querySelectorAll('.amount-field');
        let index = this.props.shoppingCartInfo.shoppingCartItems.findIndex(shoppingCartItem => {
            return this.props._id === shoppingCartItem._id;
        });
        let currentValue = amountField[index].value;
        if (currentValue >= 1) {
            this.props.updateAmount({
                _id: this.props._id,
                amount: currentValue
            })
        } else {
            amountField[index].value = "1";
            this.props.updateAmount({
                _id: this.props._id,
                amount: 1
            })
        }
    }

    componentDidUpdate() {
        // Updates the input field number value according to shopping cart item amount state on props value change
        // When user presses 'Add to Cart' button when item already exists in cart, it increments input number value by 1 
        const amountField = document.querySelectorAll('.amount-field');
        let index = this.props.shoppingCartInfo.shoppingCartItems.findIndex(shoppingCartItem => {
            return this.props._id === shoppingCartItem._id;
        });
        amountField[index].value = this.props.amount;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    removeItem = () => {
        // Removes a certain item from the shopping cart items inside the redux state
        if (this._isMounted) {
            let itemToRemove = {}
            this.props.shoppingCartInfo.shoppingCartItems.forEach(item => {
                if (item._id === this.props._id) {
                    itemToRemove = item;
                }
            })
            this.props.removeItem(itemToRemove);
        }
    }

    render() {
        return (
            // Shopping Cart Card
            <React.Fragment>
                <div className="shopping-cart-card-container">
                    <input className="amount-field" onChange={this.updateAmount} min="1" data-prev-value={this.props.amount} defaultValue="1" type="number" />
                    <h1>{this.props.name}</h1>
                    <h3>&#8362;{this.props.price}</h3>
                    <button onClick={this.removeItem} className="remove-item-button"><span role="img" aria-label="cross-mark">&#10060;</span></button>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = state => {
    return {
        logged: state.loggedReducer,
        shoppingCartInfo: state.shoppingCartInfoReducer,
        user: state.setUserReducer
    }
}

const mapDispatchToProps = () => {
    return {
        toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser
    }
}

export default connect(mapStateToProps, mapDispatchToProps())(ShoppingCartCard);