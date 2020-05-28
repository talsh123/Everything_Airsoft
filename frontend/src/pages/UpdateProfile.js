import React, { Component } from 'react';
import { Circle } from 'react-preloaders';
import sweetalert from 'sweetalert2';
import bcrypt from 'bcryptjs';
import axios from 'axios';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class UpdateProfile extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this.props.logged !== true) {
            this.setState({
                loaded: true
            })
            this.props.history.push('/');
        }
        else
            if (this._isMounted)
                this.setState({
                    loaded: true
                })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    updatePassword = (e) => {
        e.preventDefault();
        if (this.props.user.isVerified)
            sweetalert.mixin({
                input: 'password',
                confirmButtonText: 'Confirm',
                showCancelButton: true,
                progressSteps: ['1', '2'],
                icon: 'info',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                customClass: 'sweetalert-black'
            }).queue([
                {
                    title: 'Please confirm your current password'
                },
                {
                    title: 'Please enter your new password.'
                }
            ]).then((result) => {
                if (result.value) {
                    bcrypt.compare(result.value[0], this.props.user.hash, (err, boolean) => {
                        if (err)
                            sweetalert.fire({
                                toast: true,
                                timer: 4000,
                                timerProgressBar: true,
                                title: 'An error has occured, please try again later.',
                                position: "bottom",
                                icon: 'error',
                                showConfirmButton: false,
                                customClass: 'sweetalert'
                            })
                        else {
                            if (boolean === true) {
                                bcrypt.genSalt(10, (err, salt) => {
                                    if (err)
                                        console.log(err);
                                    else {
                                        bcrypt.hash(result.value[1], salt, (err, hash) => {
                                            if (err)
                                                console.log(err);
                                            else {
                                                console.log(hash);
                                                axios.patch(`/users/updateHash/${this.props.user.userId}`, {
                                                    hash: hash
                                                }).then(user => {
                                                    console.log(user);
                                                }).catch(_err => {
                                                    sweetalert.fire({
                                                        toast: true,
                                                        timer: 4000,
                                                        timerProgressBar: true,
                                                        title: 'An error has occured, please try again later.',
                                                        position: "bottom",
                                                        icon: 'error',
                                                        showConfirmButton: false,
                                                        customClass: 'sweetalert'
                                                    })
                                                })
                                                this.props.setUser({
                                                    userId: this.props.user.userId,
                                                    username: this.props.user.username,
                                                    hash: hash,
                                                    email: this.props.user.email,
                                                    isVerified: this.props.user.isVerified,
                                                    isAdmin: this.props.user.isAdmin,
                                                });
                                                sweetalert.fire({
                                                    toast: true,
                                                    timer: 4000,
                                                    timerProgressBar: true,
                                                    title: 'Your new password has been saved!',
                                                    position: "bottom",
                                                    icon: 'success',
                                                    showConfirmButton: false,
                                                    customClass: 'sweetalert'
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
                                    title: 'Your passowrd is incorrect, please try again.',
                                    position: "bottom",
                                    icon: 'error',
                                    showConfirmButton: false,
                                    customClass: 'sweetalert'
                                })
                            }
                        }
                    })
                }
            })
        else
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: 'You must be a verified user in order to change your password!',
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
    }

    updateEmail = (e) => {
        e.preventDefault();
        if (this.props.user.isVerified)
            sweetalert.mixin({
                confirmButtonText: 'Confirm',
                showCancelButton: true,
                progressSteps: ['1', '2', '3'],
                icon: 'info',
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                customClass: 'sweetalert-black'
            }).queue([
                {
                    title: 'Please confirm your current email address!',
                    input: 'email'
                },
                {
                    title: 'Please confirm your password!',
                    input: 'password'
                },
                {
                    title: 'Please enter your new email address!',
                    input: 'email'
                }
            ]).then((result) => {
                if (result.value) {
                    if (result.value[0] === this.props.user.email) {
                        bcrypt.compare(result.value[1], this.props.user.hash, (err, boolean) => {
                            if (err)
                                console.log(err);
                            else
                                if (boolean === true) {
                                    axios.patch(`/users/updateEmail/${this.props.user.userId}`, {
                                        email: result.value[2]
                                    }).then(user => {
                                        console.log(user);
                                        this.props.setUser({
                                            userId: this.props.user.userId,
                                            username: this.props.user.username,
                                            hash: this.props.hash,
                                            email: result.value[2],
                                            isVerified: false,
                                            isAdmin: this.props.user.isAdmin,
                                        });
                                        sweetalert.fire({
                                            toast: true,
                                            timer: 4000,
                                            timerProgressBar: true,
                                            title: 'A verification email has been sent to your new email address! You will be unverified until you confirm your new email address!',
                                            position: "bottom",
                                            icon: 'warning',
                                            showConfirmButton: false,
                                            customClass: 'sweetalert'
                                        })
                                    }).catch(_err => {
                                        sweetalert.fire({
                                            toast: true,
                                            timer: 4000,
                                            timerProgressBar: true,
                                            title: 'An error has occured, please try again later.',
                                            position: "bottom",
                                            icon: 'error',
                                            showConfirmButton: false,
                                            customClass: 'sweetalert'
                                        })
                                    })
                                } else {
                                    sweetalert.fire({
                                        toast: true,
                                        timer: 4000,
                                        timerProgressBar: true,
                                        title: 'Your password is incorrect, please try again later.',
                                        position: "bottom",
                                        icon: 'error',
                                        showConfirmButton: false,
                                        customClass: 'sweetalert'
                                    })
                                }
                        })
                    } else {
                        sweetalert.fire({
                            toast: true,
                            timer: 4000,
                            timerProgressBar: true,
                            title: 'Email address is incorrect, please try again.',
                            position: "bottom",
                            icon: 'error',
                            showConfirmButton: false,
                            customClass: 'sweetalert'
                        })
                    }
                }
            })
        else
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: 'You must be a verified user in order to change your password!',
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
    }

    render() {
        return (
            <React.Fragment>
                <main>
                    <div className='update-profile-container'>
                        <h1>Update Profile</h1>
                        <form onSubmit={this.UpdateProfile} className='update-profile-form' method='POST'>
                            <div className='update-profile-user-input'>
                                <label className='update-profile-label'>Email</label>
                                <button onClick={this.updateEmail} className='update-profile-button'>Change</button>
                            </div>
                            <div className='update-profile-user-input'>
                                <label className='update-profile-label'>Password</label>
                                <button onClick={this.updatePassword} className='update-profile-button'>Change</button>
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

export default connect(mapStateToProps, mapDispatchToProps())(UpdateProfile);