import React, { Component } from 'react';
import axios from 'axios';
import cloudinary from 'cloudinary-core';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class OrderDetails extends Component {
    _isMounted = true;

    constructor(props) {
        super(props);

        this.state = {
            order: undefined,
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted)
            if (this.props.logged !== true || this.props.user.isVerified !== true) {
                this.props.history.push('/');
            } else {
                axios.get(`/orders/getOrder/${this.props.history.location.pathname.split('/')[2]}`).then(order => {
                    if (this._isMounted)
                        this.setState({
                            order: order.data
                        })
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

    redirectToProductInShop = (e) => {
        this.props.history.push(`/shop/view/${e.target.getAttribute('aria-label')}`);
    }

    render() {
        const cloudinaryCore = new cloudinary.Cloudinary({ cloud_name: 'everythingairsoft' });
        return (
            <React.Fragment>
                <main>
                    {
                        this.state.order !== undefined ? <React.Fragment>
                            <div className='order-details-container'>
                                <h1>Order Details</h1>
                                <table className='order-details-table'>
                                    <thead>
                                        <tr>
                                            <th>Item Image</th>
                                            <th>Item Name</th>
                                            <th>Item Price</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.order.items.map(item => {
                                            return <React.Fragment key={item._id}>
                                                <tr>
                                                    <td><img className='order-details-image' src={cloudinaryCore.url(`${item._id}`)} alt={item.name} /></td>
                                                    <td><p>{item.name}</p></td>
                                                    <td><p>&#8362;{item.price}</p></td>
                                                    <td><p>{item.amount}</p></td>
                                                    <td><button className='order-view-button' aria-label={item._id} onClick={this.redirectToProductInShop}>View</button></td>
                                                </tr>
                                            </React.Fragment>
                                        })}
                                    </tbody>
                                </table>
                                <h3>Total Price: &#8362;{this.state.order.totalPrice.$numberDecimal}</h3>
                            </div>
                        </React.Fragment> : ''
                    }
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

export default connect(mapStateToProps, mapDispatchToProps())(OrderDetails);