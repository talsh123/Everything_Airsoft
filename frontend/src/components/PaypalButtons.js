import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import bcrypt from 'bcryptjs';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';
class PaypalButtons extends Component {
    _isMounted = false;

    componentDidMount() {
        this._isMounted = true;

        // Renders PayPal Checkout buttons on page load
        // Post request send after approved payment to backend to save new order in database
        const paypalRef = document.querySelector('.paypal');
        window.paypal.Buttons({
            locale: 'en_IL',
            style: {
                color: 'gold',
                shape: 'pill',
                size: 'responsive',
                label: 'checkout',
                height: 40
            },
            commit: true,
            createOrder: (_data, actions) => {
                if (this._isMounted) {
                    return actions.order.create({
                        purchase_units: [
                            {
                                description: 'EverythingAirsoft online payment',
                                amount: {
                                    currency_code: 'ILS',
                                    value: this.props.shoppingCartInfo.totalPrice,
                                },
                            },
                        ],
                    });
                }
            },
            onApprove: async (_data, actions) => {
                if (this._isMounted) {
                    sweetalert.fire({
                        title: 'Confirm Your Password!',
                        text: 'Please confirm your password before continuing.',
                        input: 'password',
                        showCancelButton: true,
                        confirmButtonText: 'Confirm',
                        cancelButtonColor: '#ff0000',
                        icon: 'question',
                        customClass: 'sweetalert-black'
                    }).then((result) => {
                        if (result.value) {
                            bcrypt.compare(result.value, this.props.user.hash, (err, boolean) => {
                                if (err)
                                    sweetalert.fire({
                                        toast: true,
                                        timer: 4000,
                                        timerProgressBar: true,
                                        title: `An error occured while attempting to purchase, please try again later.`,
                                        position: "bottom",
                                        icon: 'error',
                                        showConfirmButton: false,
                                        customClass: 'sweetalert'
                                    })
                                else {
                                    if (boolean === true) {
                                        axios.post('/orders/saveOrder', {
                                            userId: this.props.user.userId,
                                            totalPrice: this.props.shoppingCartInfo.totalPrice,
                                            items: this.props.shoppingCartInfo.shoppingCartItems
                                        }).catch(err => console.log(err))
                                        axios.patch('/products/updateStock', {
                                            shoppingCartItems: this.props.shoppingCartInfo.shoppingCartItems
                                        }).catch(err => console.log(err));
                                        actions.order.capture();
                                        this.props.shoppingCartInfo.shoppingCartItems.forEach(product => {
                                            this.props.removeItem(product);
                                        });
                                        sweetalert.fire({
                                            toast: true,
                                            timer: 4000,
                                            timerProgressBar: true,
                                            title: `Thank you for choosing EverythingAirsoft.com`,
                                            position: "bottom",
                                            icon: 'success',
                                            showConfirmButton: false,
                                            customClass: 'sweetalert'
                                        })
                                    } else {
                                        sweetalert.fire({
                                            toast: true,
                                            timer: 4000,
                                            timerProgressBar: true,
                                            title: `Password is incorrect, please try again.`,
                                            position: "bottom",
                                            icon: 'error',
                                            showConfirmButton: false,
                                            customClass: 'sweetalert'
                                        })
                                    }
                                }
                            })
                        } else if (result.value === '' || result.dismiss === sweetalert.DismissReason.cancel) {
                            sweetalert.fire({
                                toast: true,
                                timer: 4000,
                                timerProgressBar: true,
                                title: `Transaction cancelled!`,
                                position: "bottom",
                                icon: 'error',
                                showConfirmButton: false,
                                customClass: 'sweetalert'
                            })
                        }
                    })
                }
            },
            onError: function (err) {
                sweetalert.fire({
                    toast: true,
                    timer: 4000,
                    timerProgressBar: true,
                    title: `An error occured while attempting to purchase, please try again later.`,
                    position: "bottom",
                    icon: 'error',
                    showConfirmButton: false,
                    customClass: 'sweetalert'
                })
            },
        }).render(paypalRef);
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate() {
        if (this.props.shoppingCartInfo.totalPrice > 0)
            document.querySelector('.paypal').classList.remove('pointer-events');
        else
            document.querySelector('.paypal').classList.add('pointer-events');

    }

    render() {
        return (
            // PayPal Checkout 2.0 Buttons
            <React.Fragment>
                <div className="paypal pointer-events" />
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

export default connect(mapStateToProps, mapDispatchToProps())(PaypalButtons);