import React, { Component } from 'react'
import axios from 'axios';
import sweetalert from 'sweetalert2';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class EmailVerification extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (window.location.pathname.includes('key=') && window.location.pathname.includes('userId=')) {
            const userDetails = window.location.pathname.split('/key=')[1].split('/userId=');
            console.log(userDetails);
            axios.get(`/users/getUserById/${userDetails[1]}`).then(user => {
                if (user.data) {
                    if (user.data.hash === userDetails[0]) {
                        axios.patch(`/users/verify/${user.data.username}`).then(user => {
                            if (user.data) {
                                this.props.toggleLogged();
                                this.props.setUser({
                                    userId: user.data._id,
                                    username: user.data.username,
                                    hash: user.data.hash,
                                    email: user.data.email,
                                    isVerified: true,
                                    isAdmin: user.data.isAdmin
                                });
                                sweetalert.fire({
                                    toast: true,
                                    timer: 5000,
                                    title: `Successfully Verified Account! Redirecting now...`,
                                    position: "bottom",
                                    icon: 'success',
                                    showConfirmButton: false,
                                    customClass: 'sweetalert'
                                })
                                setTimeout(() => {
                                    this.props.history.push('/');
                                }, 5000)
                            } else {
                                sweetalert.fire({
                                    toast: true,
                                    timer: 4000,
                                    title: `An error occured while verifying account, please try again later.`,
                                    position: "bottom",
                                    icon: 'error',
                                    showConfirmButton: false,
                                    customClass: 'sweetalert'
                                })
                            }
                        }).catch(err => {
                            this.alertFailedVerification();
                        })
                    } else {
                        this.alertFailedVerification();
                    }
                } else
                    this.alertFailedVerification();
            })
        }

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    alertFailedVerification = () => {
        sweetalert.fire({
            toast: true,
            timer: 4000,
            timerProgressBar: true,
            title: `Account verification failed, please try again later.`,
            position: "bottom",
            icon: 'error',
            showConfirmButton: false,
            customClass: 'sweetalert'
        })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <div>
                <Circle color='#e9e9e9' background='#383838' customLoading={this.state.loaded} />
            </div >
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

export default connect(mapStateToProps, mapDispatchToProps())(EmailVerification);