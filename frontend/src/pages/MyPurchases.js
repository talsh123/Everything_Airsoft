import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import bcrypt from 'bcryptjs';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class MyPurchases extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        // Component State
        this.state = {
            orders: [],
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this.props.logged !== true || this.props.user.isVerified !== true) {
            this.props.history.push('/');
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Must be logged into a verified account in order to view purchase history!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
        } else {
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
                    console.log('accepted')
                    bcrypt.compare(result.value, this.props.user.hash, (err, boolean) => {
                        if (err) {
                            sweetalert.fire({
                                toast: true,
                                timer: 4000,
                                timerProgressBar: true,
                                title: `An error occured while attempting to access this page, please try again later.`,
                                position: "bottom",
                                icon: 'error',
                                showConfirmButton: false,
                                customClass: 'sweetalert'
                            })
                            this.props.history.push('/');
                        }
                        else {
                            if (boolean === true) {
                                // Axios GET request setting state to current user's orders 
                                axios.get(`/orders/getOrders/${this.props.user.userId}`).then(orders => {
                                    if (this._isMounted) {
                                        this.setState({
                                            orders: orders.data
                                        })
                                    }
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
                                this.props.history.push('/');
                            }
                        }
                    })
                } else if (result.dismiss === sweetalert.DismissReason.cancel || result.value === '') {
                    console.log('rejected')
                    this.props.history.push('/');
                }
            })
        }

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    formatDate = (createdAt) => {
        let date = new Date(createdAt);
        let day, month, year, time;
        day = date.getDate();
        switch (date.getMonth()) {
            case 0:
                month = 'January';
                break;
            case 1:
                month = 'Febuary';
                break;
            case 2:
                month = 'March';
                break;
            case 3:
                month = 'April';
                break;
            case 4:
                month = 'May';
                break;
            case 5:
                month = 'June';
                break;
            case 6:
                month = 'July';
                break;
            case 7:
                month = 'August';
                break;
            case 8:
                month = 'September';
                break;
            case 9:
                month = 'October';
                break;
            case 10:
                month = 'November';
                break;
            case 11:
                month = 'December';
                break;
            default:
        }
        year = date.getFullYear();
        let hour = date.getHours();
        if (hour < 10)
            hour = "0" + hour.toString();
        let minutes = date.getMinutes();
        if (minutes < 10)
            minutes = "0" + minutes.toString();
        let seconds = date.getSeconds();
        if (seconds < 10)
            seconds = "0" + seconds.toString();
        time = {
            hour, minutes, seconds
        };
        return {
            day, month, year, time
        };
    }

    redirectToOrderDetails = (e) => {
        if (this.props.logged === true && this.props.user.isVerified) {
            this.props.history.push(`/myPurchases/${e.target.getAttribute('aria-label')}`);
        }
    }

    render() {
        return (
            // Purchase History
            <React.Fragment>
                <main>
                    <div className='my-purchases-container'>
                        <h1>Payment History</h1>
                        <table className='orders-table'>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Payment Date</th>
                                    <th>Payment Via</th>
                                    <th>Order Status</th>
                                    <th>Total Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.orders.map(order => {
                                    const orderDate = this.formatDate(order.createdAt);
                                    return <React.Fragment key={order._id}>
                                        <tr>
                                            <td><p>#{order._id}</p></td>
                                            <td><p>{`${orderDate.month} ${orderDate.day}, ${orderDate.year} ${orderDate.time.hour}:${orderDate.time.minutes}:${orderDate.time.seconds}`}</p></td>
                                            <td><p>PayPal</p></td>
                                            <td><p className='order-status'>Pending...</p></td>
                                            <td><p>&#8362;{order.totalPrice.$numberDecimal}</p></td>
                                            <td><button className='order-view-button' aria-label={order._id} onClick={this.redirectToOrderDetails}>View</button></td>
                                        </tr>
                                    </React.Fragment>
                                })}
                            </tbody>
                        </table>
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

export default connect(mapStateToProps, mapDispatchToProps())(MyPurchases);