import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import bcrypt from 'bcryptjs';
import Cookies from 'js-cookie';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class SignUp extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    // Overrides default form submit behavior
    // Creates axios POST request and saved user credentials in database
    submitHandler = (e) => {
        if (this._isMounted) {
            e.preventDefault();
            const { username, password, repassword, email } = {
                username: document.querySelector('input[name="username"]').value,
                password: document.querySelector('input[name="password"]').value,
                repassword: document.querySelector('input[name="repassword"]').value,
                email: document.querySelector('input[name="email"]').value
            }
            if (this._isMounted) {
                if (password === repassword) {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err)
                            console.log(err)
                        else {
                            bcrypt.hash(password, salt, (err, hash) => {
                                if (err)
                                    console.log(err)
                                else {
                                    axios.post('/users/saveUser', {
                                        username,
                                        hash,
                                        email
                                    }).then(user => {
                                        console.log(user)
                                        if (user.data === 11000) {
                                            sweetalert.fire({
                                                toast: true,
                                                timer: 4000,
                                                timerProgressBar: true,
                                                title: `Username or email already taken!`,
                                                position: "bottom",
                                                icon: 'error',
                                                showConfirmButton: false,
                                                customClass: 'sweetalert'
                                            })
                                        } else {
                                            this.props.toggleLogged();
                                            this.props.setUser({
                                                userId: user.data._id,
                                                email: user.data.email,
                                                hash: user.data.hash,
                                                isAdmin: user.data.isAdmin,
                                                isVerified: user.data.isVerified
                                            });
                                            axios.get('https://api.ipify.org?format=json').then(res => {
                                                axios.post('/sessions/saveSession', {
                                                    userIP: res.data.ip,
                                                    userId: user.data._id
                                                }).then(session => {
                                                    Cookies.set('sessionId', session.data._id, { expires: 1 });
                                                })
                                            })
                                            this.props.history.push('/');
                                            sweetalert.fire({
                                                toast: true,
                                                timer: 4000,
                                                timerProgressBar: true,
                                                title: `Successfully registered account!`,
                                                position: "bottom",
                                                icon: 'success',
                                                showConfirmButton: false,
                                                customClass: 'sweetalert'
                                            })
                                            setTimeout(() => {
                                                sweetalert.fire({
                                                    toast: true,
                                                    timer: 5000,
                                                    timerProgressBar: true,
                                                    title: `A verification email has been sent to your email address!`,
                                                    position: "bottom",
                                                    icon: 'info',
                                                    showConfirmButton: false,
                                                    customClass: 'sweetalert'
                                                })
                                            }, 4500)
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
                            })
                        }
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
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    componentDidUpdate() {
        if (this.props.logged === true)
            this.props.history.push('/');
    }

    render() {
        return (
            // Sign Up Form
            <React.Fragment>
                <main>
                    <div className='sign-up-container'>
                        <h1>Sign Up</h1>
                        <form onSubmit={this.submitHandler} className='sign-up-form' action='/users/saveUser' method='POST'>
                            <div className='sign-up-user-input'>
                                <label className='sign-up-label'>Username*</label>
                                <input type='text' name='username' required />
                            </div>
                            <div className='sign-up-user-input'>
                                <label className='sign-up-label'>Email*</label>
                                <input type='email' name='email' required />
                            </div>
                            <div className='sign-up-user-input'>
                                <label className='sign-up-label'>Password*</label>
                                <input type='password' name='password' required />
                            </div>
                            <div className='sign-up-user-input'>
                                <label className='sign-up-label'>Repeat Password*</label>
                                <input type='password' name='repassword' required />
                            </div>
                            <button type='submit'>Sign Up</button>
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

export default connect(mapStateToProps, mapDispatchToProps())(SignUp);