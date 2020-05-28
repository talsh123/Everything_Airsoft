import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import bcrypt from 'bcryptjs';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class SignIn extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        if (this.props.logged === true)
            this.props.history.push('/');
        document.querySelector('input[name="remember-me"]').checked = true;

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    // Overrides default form submit behavior
    // Sends a GET request to check user password with hash
    // If true, redirects to home page with message 'logged in'
    // Also checks for verification
    submitHandler = (e) => {
        e.preventDefault();
        const { username, password, rememberMe } = {
            username: document.querySelector('input[name="username"]').value,
            password: document.querySelector('input[name="password"]').value,
            rememberMe: document.querySelector('input[name="remember-me"]').checked
        }
        if (this._isMounted)
            axios.get(`/users/getUser/${username}`).then(res => {
                const user = res.data;
                if (this._isMounted) {
                    bcrypt.compare(password, res.data.hash, (err, res) => {
                        if (err)
                            sweetalert.fire({
                                toast: true,
                                timer: 4000,
                                timerProgressBar: true,
                                title: `An error occured, please check credentials and try again.`,
                                position: "bottom",
                                icon: 'error',
                                showConfirmButton: false,
                                customClass: 'sweetalert'
                            })
                        else {
                            if (res === true) {
                                if (this._isMounted) {
                                    this.props.toggleLogged();
                                    this.props.setUser({
                                        userId: user._id,
                                        username: user.username,
                                        hash: user.hash,
                                        email: user.email,
                                        isVerified: user.isVerified,
                                        isAdmin: user.isAdmin
                                    });
                                }
                                if (rememberMe === true) {
                                    axios.get('https://api.ipify.org?format=json').then(res => {
                                        axios.get(`/users/getUser/${username}`).then(user => {
                                            axios.post('/sessions/saveSession', {
                                                userIP: res.data.ip,
                                                userId: user.data._id
                                            }).then(session => {
                                                Cookies.set('sessionId', session.data._id, { expires: 1 });
                                            })
                                        })
                                    })
                                }
                                this.props.history.push('/');
                                sweetalert.fire({
                                    toast: true,
                                    timer: 4000,
                                    timerProgressBar: true,
                                    title: `Successfully logged in!`,
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
                                    title: `An error occured, please check credentials and try again!`,
                                    position: "bottom",
                                    icon: 'error',
                                    showConfirmButton: false,
                                    customClass: 'sweetalert'
                                })
                            }
                        }
                    })
                }
            }).catch(() => {
                sweetalert.fire({
                    toast: true,
                    timer: 4000,
                    timerProgressBar: true,
                    title: `An error occured, please check credentials and try again!`,
                    position: "bottom",
                    icon: 'error',
                    showConfirmButton: false,
                    customClass: 'sweetalert'
                })
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate() {
        if (this.props.logged === true)
            this.props.history.push('/');
    }

    resetPassword = (e) => {
        e.preventDefault();
        sweetalert.fire({
            title: 'Enter Your Email Address!',
            input: 'email',
            showCancelButton: true,
            cancelButtonColor: '#ff0000',
            confirmButtonText: 'Confirm',
            icon: 'question',
            customClass: 'sweetalert-black'
        }).then((result) => {
            if (result.value) {
                axios.get(`/users/resetPassword/${result.value}`).then(_user => {
                    sweetalert.fire({
                        toast: true,
                        timer: 4000,
                        timerProgressBar: true,
                        title: 'Your new password has been sent to your email address!',
                        position: "bottom",
                        icon: 'warning',
                        showConfirmButton: false,
                        customClass: 'sweetalert'
                    })
                })
            }
        })
    }

    render() {
        return (
            // Sign In Form
            <React.Fragment>
                <main>
                    <div className='sign-in-container'>
                        <h1>Sign In</h1>
                        <form onSubmit={this.submitHandler} className='sign-in-form' action='/users/saveUser' method='POST'>
                            <div className='sign-in-user-input'>
                                <label className='sign-in-label'>Username*</label>
                                <input type='text' name='username' required />
                            </div>
                            <div className='sign-in-user-input'>
                                <label className='sign-in-label'>Password*</label>
                                <input type='password' name='password' required />
                            </div>
                            <div className='sign-in-user-input'>
                                <input type='checkbox' name='remember-me' />
                                <label>Remember me</label>
                            </div>
                            <button type='submit'>Log In</button>
                            <div className='sign-in-user-input'>
                                <label>Forgot Your Password? Press <button className='reset-password-link' onClick={this.resetPassword}>Here</button></label>
                            </div>
                            <div className='sub-sign-up-container'>
                                <h3>Don't have an account?</h3>
                                <Link to='/signUp'><button className='sign-up-link'>Sign Up</button></Link>
                            </div>
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

export default connect(mapStateToProps, mapDispatchToProps())(SignIn);