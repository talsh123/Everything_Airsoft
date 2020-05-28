import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class CreateCommunity extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this.props.logged !== true || this.props.user.isVerified !== true) {
            this.props.history.push('/signIn');
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Must be logged into a verified account in order to create a community!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
        }

        if (this._isMounted) {
            const name = document.querySelector('.community-name');
            const description = document.querySelector('.community-description');
            const file = document.querySelector('.file-upload');
            const form = document.querySelector('.add-community-form');

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                axios.get(`/users/getUser/${this.props.user.username}`).then(user => {
                    const owner = user.data;

                    const newCommunity = {
                        name: name.value,
                        owner: owner,
                        description: description.value
                    }

                    const formData = new FormData();
                    formData.append('file', file.files[0]);
                    const community = JSON.stringify(newCommunity);
                    formData.append('community', community);


                    axios.post('/communities/saveCommunity', formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }).then(res => {
                        console.log(res.data);
                        sweetalert.fire({
                            toast: true,
                            timer: 4000,
                            timerProgressBar: true,
                            title: `Successfully created community!`,
                            position: "bottom",
                            icon: 'success',
                            showConfirmButton: false,
                            customClass: 'sweetalert'
                        })
                    }).catch(err => {
                        console.log(err);
                        sweetalert.fire({
                            toast: true,
                            timer: 4000,
                            timerProgressBar: true,
                            title: `An error has occured, please try again later.`,
                            position: "bottom",
                            icon: 'error',
                            showConfirmButton: false,
                            customClass: 'sweetalert'
                        })
                    });
                }).catch(_err => {
                    sweetalert.fire({
                        toast: true,
                        timer: 4000,
                        timerProgressBar: true,
                        title: `An error occured, please check input fields and try again.`,
                        position: "bottom",
                        icon: 'error',
                        showConfirmButton: false,
                        customClass: 'sweetalert'
                    })
                });
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

    render() {
        return (
            <React.Fragment>
                <main>
                    <div className='add-community-container'>
                        <form className='add-community-form' action='/communities/saveCommunity' method='POST'>
                            <h1>Create Community</h1>
                            <div className='add-community-user-input'>
                                <label className='add-community-label'>Community Name*</label>
                                <input type='text' className='community-name' required name='name' />
                            </div>
                            <div className='add-community-user-input'>
                                <label className='add-community-label'>Community Description</label>
                                <textarea className='community-description' rows='15' name='description' />
                            </div>
                            <div className='add-product-user-input'>
                                <label className='add-product-label'>Community Image*</label>
                                <input type='file' className='file-upload' name='Community-image' required />
                            </div>
                            <button type='submit'>Add Community</button>
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

export default connect(mapStateToProps, mapDispatchToProps())(CreateCommunity);