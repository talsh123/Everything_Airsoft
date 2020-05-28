import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class RateProduct extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            product: undefined,
            loaded: false
        }
    }

    combineOrdersAndCheck(orders) {
        let boolean = false;
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item._id === this.props.history.location.pathname.split('/')[2])
                    boolean = true;
            })
        })
        return boolean;
    }

    componentDidMount() {
        this._isMounted = true;

        if (this.props.logged === true && this.props.user.isVerified === true) {
            const productId = this.props.history.location.pathname.split('/')[2];
            if (this._isMounted) {
                axios.get(`/orders/getOrders/${this.props.user.userId}`).then(orders => {
                    const boolean = this.combineOrdersAndCheck(orders.data);
                    if (boolean === false) {
                        this.props.history.push(`/shop/view/${productId}`);
                        sweetalert.fire({
                            toast: true,
                            timer: 4000,
                            timerProgressBar: true,
                            title: `You must purchase this item first in order to review it`,
                            position: "bottom",
                            icon: 'error',
                            showConfirmButton: false,
                            customClass: 'sweetalert'
                        })
                    }
                }).catch(err => {
                    console.log(err);
                })
            }
            if (this._isMounted)
                axios.get(`/products/get/${productId}`).then(product => {
                    if (this._isMounted)
                        this.setState({
                            product: product.data
                        });
                })
        } else {
            this.props.history.push('/signIn');
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Must be logged into a verified account in order to rate a product!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
        }

        const title = document.querySelector('input[name="title"]');
        const rating = document.querySelector('input[name="rating"]');
        const text = document.querySelector('textarea[name="text"]');

        const form = document.querySelector('.rate-product-form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const ratingToSave = {
                title: title.value,
                rating: parseFloat(rating.value),
                text: text.value,
                originalPoster: this.props.user.userId,
                productId: this.state.product._id
            }

            if (this._isMounted) {
                axios.post('/ratings/saveRating', ratingToSave).then(rating => {
                    this.props.history.push(`/shop/view/${this.state.product._id}`);
                    sweetalert.fire({
                        toast: true,
                        timer: 4000,
                        timerProgressBar: true,
                        title: `Successfully uploaded rating!`,
                        position: "bottom",
                        icon: 'success',
                        showConfirmButton: false,
                        customClass: 'sweetalert'
                    })
                }).catch(err => {
                    console.log(err)
                    sweetalert.fire({
                        toast: true,
                        timer: 4000,
                        timerProgressBar: true,
                        title: `An error occured, please try again later.`,
                        position: "bottom",
                        icon: 'error',
                        showConfirmButton: false,
                        customClass: 'sweetalert'
                    })
                })
            }
        })

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <React.Fragment>
                <main>
                    <div className='rate-product-container'>
                        <form className='rate-product-form' action='/ratings/saveRating' method='POST'>
                            <h1>Rate Product</h1>
                            <div className='rate-product-user-input'>
                                <label className='rate-product-label'>Title*</label>
                                <input type='text' name='title' required />
                            </div>
                            <div className='rate-product-user-input'>
                                <label className='rate-product-label'>Text</label>
                                <textarea rows='15' name='text' />
                            </div>
                            <div className='rate-product-user-input'>
                                <label className='rate-product-label'>Rating*</label>
                                <input type='number' step='0.1' min='0.0' max='5.0' name='rating' required />
                            </div>
                            <button type='submit'>Rate</button>
                        </form>
                    </div>
                </main>
                <Circle color='#e9e9e9' background='#383838' customLoading={this.state.loaded} />
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

export default connect(mapStateToProps, mapDispatchToProps())(RateProduct);