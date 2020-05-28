import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class Contact extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;
        const form = document.querySelector('.contact-form');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const { firstName, lastName, email, subject, body } = {
                firstName: document.querySelector('input[name="first-name"]').value,
                lastName: document.querySelector('input[name="last-name"]').value,
                email: this.props.logged ? this.props.user.email : document.querySelector('input[name="email"]').value,
                subject: document.querySelector('input[name="subject"]').value,
                body: document.querySelector('textarea').value
            };
            if (this._isMounted) {
                axios.post('/contact/send', {
                    firstName,
                    lastName,
                    email,
                    subject,
                    body
                }).then(() => {
                    sweetalert.fire({
                        toast: true,
                        timer: 4000,
                        timerProgressBar: true,
                        title: `Thank you for contacting EverythingAirsoft.com!`,
                        position: "bottom",
                        icon: 'success',
                        showConfirmButton: false,
                        customClass: 'sweetalert'
                    })
                }).catch(err => {
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
                    <div className='contact-container'>
                        <h1>Contact Us!</h1>
                        <h3>Let’s get this conversation started. Tell us a bit about yourself, and we’ll get in touch as soon as we can.</h3>
                        <form className='contact-form' method='POST'>
                            <div className='name-input'>
                                <div className='name'>
                                    <label>First Name</label>
                                    <input type='text' name='first-name' />
                                </div>
                                <div className='name'>
                                    <label>Last Name</label>
                                    <input type='text' name='last-name' />
                                </div>
                            </div>
                            {
                                this.props.logged ? '' : <div className='contact-user-input'>
                                    <label className='contact-label'>Work Email*</label>
                                    <input type='text' name='email' required />
                                </div>
                            }
                            <div className='contact-user-input'>
                                <label className='contact-label'>Subject*</label>
                                <input type='text' name='subject' required />
                            </div>
                            <div className='contact-user-input'>
                                <label className='contact-label'>Message</label>
                                <textarea name='body' rows='10' cols='80' />
                            </div>
                            <button type='submit'>Contact</button>
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

export default connect(mapStateToProps, mapDispatchToProps())(Contact);