import React, { Component } from 'react';

import ShoppingCartCard from './ShoppingCartCard';
import PaypalButtons from './PaypalButtons';

import shoppingCart from '../static/images/shoppingCart.png';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class ShoppingCart extends Component {
    _isMounted = false;

    componentDidMount = () => {
        this._isMounted = true;
    }

    // Toggles Shopping Cart view(Hides and unhides)
    toggleCart = () => {
        if (this._isMounted) {
            const cartInner = document.querySelector('.cart-inner');
            if (cartInner.style.height !== '0px') {
                cartInner.style.height = '0px';
                document.querySelector('.cart-toggle-button').style.transform = 'rotate(180deg)';
            } else {
                cartInner.style.height = '550px';
                document.querySelector('.cart-toggle-button').style.transform = 'rotate(0deg)';
            }
        }
    }

    // Counts the number of unique items inside the shopping cart redux state
    countUniqueItems = () => {
        if (this._isMounted) {
            let IdArray = this.props.shoppingCartInfo.shoppingCartItems.map(item => {
                return item._id;
            })
            return [...new Set(IdArray)].length;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            // Shopping Cart
            <React.Fragment>
                <div className="shopping-cart-container">
                    <div className="cart-top">
                        <label onClick={this.toggleCart} className="cart-toggle-button fas fa-angle-down"></label>
                        <img src={shoppingCart} alt="Shopping Cart" />
                        <div>
                            <label>{this.countUniqueItems()}</label>
                            <label>Total: &#8362;{this.props.shoppingCartInfo.totalPrice}</label>
                        </div>
                    </div>
                    <div className="cart-inner">
                        {
                            this.props.shoppingCartInfo.shoppingCartItems.map(item => {
                                return <ShoppingCartCard name={item.name} price={item.price} key={item._id} _id={item._id} amount={item.amount} />
                            })
                        }
                    </div>
                    <div className="cart-bottom">
                        {this.props.user.isVerified === true ? <PaypalButtons toggleCart={this.toggleCart} /> : <p className='error-msg'>You can't purchase items unless you're logged into a verified account!</p>}
                    </div>
                </div>
            </React.Fragment >
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

export default connect(mapStateToProps, mapDispatchToProps())(ShoppingCart);