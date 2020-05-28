import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import bcrypt from 'bcryptjs';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class ManageUsers extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        this.state = {
            selectedUsers: [],
            loaded: false,
            showTable: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this.props.user.isAdmin !== true)
            this.props.history.push('/');
        else {
            sweetalert.fire({
                title: 'Confirm Your Password!',
                text: 'Please confirm your password before continuing.',
                input: 'password',
                showCancelButton: true,
                cancelButtonColor: '#ff0000',
                confirmButtonText: 'Confirm',
                icon: 'question',
                customClass: 'sweetalert-black'
            }).then((result) => {
                if (result.value) {
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
                                this.fetchUsers();
                                if (this._isMounted)
                                    this.setState({
                                        showTable: true
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

    updateUsers = () => {
        if (this.state.showTable) {
            const searchText = document.querySelector('.add-admin-text-field').value;
            if (searchText) {
                axios.get(`/users/likeUser/${searchText}`).then(users => {
                    const usersWithoutMe = users.data.filter(user => {
                        return user.username !== this.props.user.username;
                    })
                    if (this._isMounted)
                        this.setState({
                            selectedUsers: usersWithoutMe
                        })
                })
            } else {
                this.fetchUsers();
            }
        }
    }

    fetchUsers = () => {
        if (this._isMounted) {
            axios.get('/users/all').then(users => {
                const usersWithoutMe = users.data.filter(user => {
                    return user.username !== this.props.user.username
                })
                if (this._isMounted) {
                    this.setState({
                        selectedUsers: usersWithoutMe
                    });
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }

    saveChanges = (e) => {
        let success = true;
        const action = e.target.getAttribute('aria-label');
        const username = e.target.getAttribute('aria-labelledby');
        let checkbox = undefined;
        let checked = undefined;
        if (e.target.type === 'checkbox') {
            checked = e.target.checked
            checkbox = e.target;
        }
        sweetalert.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, save my changes!',
            customClass: 'sweetalert-black'
        }).then((result) => {
            if (result.value) {
                switch (action) {
                    case 'admin':
                        axios.patch(`/users/toggleAdmin/${username}/${checked}`).catch(_err => {
                            success = false;
                        })
                        break;
                    case 'verified':
                        axios.patch(`/users/toggleVerify/${username}/${checked}`).catch(_err => {
                            success = false;
                        })
                        break;
                    case 'delete':
                        axios.delete(`/users/deleteUser/${username}`).catch(_err => {
                            success = false;
                        })
                        break;
                    default:
                }
                if (success) {
                    sweetalert.fire({
                        toast: true,
                        timer: 4000,
                        timerProgressBar: true,
                        title: 'Your changes have been saved!',
                        position: "bottom",
                        icon: 'success',
                        showConfirmButton: false,
                        customClass: 'sweetalert'
                    })
                    if (action === 'delete')
                        this.setState({
                            selectedUsers: this.state.selectedUsers.filter(user => {
                                return user.username !== username;
                            })
                        })
                }
                else
                    sweetalert.fire({
                        toast: true,
                        timer: 4000,
                        timerProgressBar: true,
                        title: 'An error occured while attempting to save your changes, please try again later.',
                        position: "bottom",
                        icon: 'error',
                        showConfirmButton: false,
                        customClass: 'sweetalert'
                    });
            } else if (result.dismiss === sweetalert.DismissReason.cancel) {
                sweetalert.fire({
                    toast: true,
                    timer: 4000,
                    timerProgressBar: true,
                    title: 'Cancelled!',
                    position: "bottom",
                    icon: 'info',
                    showConfirmButton: false,
                    customClass: 'sweetalert'
                })
                if (checkbox !== undefined)
                    checkbox.checked = !checked;
            }
        })
    }

    render() {
        return (
            <React.Fragment>
                <main>
                    <div className='add-admin-container'>
                        <input placeholder='search users...' className='manage-users-text-field' type='text' onChange={this.updateUsers} />
                        <table className='manage-users-table'>
                            <thead>
                                <tr>
                                    <th><strong>Username</strong></th>
                                    <th><strong>Email</strong></th>
                                    <th><strong>Admin</strong></th>
                                    <th><strong>Verified</strong></th>
                                    <th><strong>Delete</strong></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.showTable === true ? this.state.selectedUsers.map(user => {
                                        return <React.Fragment key={user._id}>
                                            <tr>
                                                <td className='username'>{user.username}</td>
                                                <td>{user.email}</td>
                                                <td><input className='admin' type='checkbox' onChange={this.saveChanges} aria-label='admin' aria-labelledby={user.username} defaultChecked={user.isAdmin === true ? true : false} /></td>
                                                <td><input className='verified' type='checkbox' onChange={this.saveChanges} aria-label='verified' aria-labelledby={user.username} defaultChecked={user.isVerified === true ? true : false} /></td>
                                                <td><button className='remove-user-button' onClick={this.saveChanges} aria-label='delete' aria-labelledby={user.username}>Delete User</button></td>
                                            </tr>
                                        </React.Fragment>
                                    }) : ''
                                }
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

export default connect(mapStateToProps, mapDispatchToProps())(ManageUsers);