import React, { Component } from 'react';
import cloudinary from 'cloudinary-core';
import sweetalert from 'sweetalert2';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class Community extends Component {
    _isMounted = false;
    _joined = false;
    _owner = false;

    constructor(props) {
        super(props);

        this.joinRef = React.createRef();

        this.state = {
            owner: false,
            joined: false,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this.props.logged === true) {
            axios.get(`/communities/isOwner/${this.props.community._id}/${this.props.user.userId}`).then(boolean => {
                if (this._isMounted)
                    this.setState({
                        owner: boolean.data
                    })
            })

            if (this.state.owner === false) {
                axios.get(`/communities/isInCommunity/${this.props.community._id}/${this.props.user.userId}`).then(boolean => {
                    if (this._isMounted)
                        this.setState({
                            joined: boolean.data
                        })
                })
            } else {
                if (this._isMounted)
                    this.setState({
                        joined: true
                    })
            }
        }

        const joinButton = this.joinRef.current;
        joinButton.addEventListener('click', () => {
            if (this.props.logged === true && this.state.joined === false) {
                axios.patch(`/communities/joinCommunity/${this.props.community._id}/${this.props.user.userId}`).then(community => {
                    if (community.data) {
                        if (this._isMounted) {
                            this.setState({
                                joined: true
                            })
                            sweetalert.fire({
                                toast: true,
                                timer: 4000,
                                timerProgressBar: true,
                                title: `successfully joined ${community.data.name}!`,
                                position: "bottom",
                                icon: 'success',
                                showConfirmButton: false,
                                customClass: 'sweetalert'
                            })
                        }
                    } else {
                        sweetalert.fire({
                            toast: true,
                            timer: 4000,
                            timerProgressBar: true,
                            title: `Already joined ${this.props.community.name}!`,
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
                    title: `Must be logged in to join this community!`,
                    position: "bottom",
                    icon: 'error',
                    showConfirmButton: false,
                    customClass: 'sweetalert'
                })
            }
        })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    updateState = () => {
        let owner, joined = undefined;
        axios.get(`/communities/getCommunity/${this.props.community._id}`).then(community => {
            if (community.data.owner === this.props.user.userId) {
                owner = true;
                joined = false;
            }
            else {
                owner = false;
                if (community.data.membersList.find(member => member === this.props.user.userId) === undefined) {
                    joined = false;
                } else {
                    joined = true
                }
            }
            this.setState({
                owner: owner,
                joined: joined
            })
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user !== this.props.user) {
            this.updateState();
        }
    }

    render() {
        const cloudinaryCore = new cloudinary.Cloudinary({ cloud_name: 'everythingairsoft' });
        return (
            <React.Fragment>
                <div className='community-container'>
                    <Link to={`/communities/${this.props.community._id}`}><div className='community-details'>
                        <img src={cloudinaryCore.url(`${this.props.community._id}`)} alt={this.props.community.name} />
                    </div></Link>
                    <Link to={`/communities/${this.props.community._id}`}><h1>{this.props.community.name}</h1></Link>
                    <Link to={`/communities/${this.props.community._id}`}><h3>{this.props.community.description}</h3></Link>
                    <Link className='members' to={`/communities/${this.props.community._id}`}><h4>{this.props.community.numMembers} Members</h4></Link>
                    <div className='community-buttons'>
                        {
                            this.state.owner === true ? <button disabled className='joined-button'>Owner</button> :
                                this.state.joined === true ? <button disabled className='joined-button'>Joined</button> : <React.Fragment>
                                    <Link className='view-button' to={`/communities/${this.props.community._id}`}><button>View</button></Link>
                                    <button className='join-button' ref={this.joinRef}>Join</button>
                                </React.Fragment>
                        }
                    </div>
                </div>
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

export default connect(mapStateToProps, mapDispatchToProps())(Community);