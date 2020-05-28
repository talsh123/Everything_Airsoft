import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import cloudinary from 'cloudinary-core';
import Post from '../components/Post';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class CommunityDetails extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            community: undefined,
            joined: undefined,
            owner: undefined,
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        const communityId = this.props.history.location.pathname.split('/')[2];

        axios.get(`/communities/getCommunity/${communityId}`).then(community => {
            if (this._isMounted)
                this.setState({
                    community: community.data
                })
            if (this.props.logged)
                axios.get(`/communities/isOwner/${community.data._id}/${this.props.user.userId}`).then(boolean => {
                    if (boolean.data === true && this._isMounted)
                        this.setState({
                            owner: true,
                            joined: true
                        })
                    else {
                        axios.get(`/communities/isInCommunity/${community.data._id}/${this.props.user.userId}`).then(boolean => {
                            if (this._isMounted)
                                this.setState({
                                    owner: false,
                                    joined: boolean.data
                                })
                        })
                    }
                })
            else
                if (this._isMounted)
                    this.setState({
                        owner: false,
                        joined: false
                    })
        }).catch(err => {
            console.log(err);
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

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    formatDate = () => {
        let date = new Date(this.state.community.createdAt);
        let day, month, year, time;
        day = date.getDay() + 1;
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
                month = 'January';
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

    componentWillUnmount() {
        this._isMounted = false;
    }

    updateState = () => {
        let owner, joined = undefined;
        axios.get(`/communities/getCommunity/${this.state.community._id}`).then(community => {
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

    joinOrLeave = () => {
        if (this._isMounted === true) {
            if (this.props.logged === true) {
                if (this.state.joined === false) {
                    axios.patch(`/communities/joinCommunity/${this.state.community._id}/${this.props.user.userId}`).then(community => {
                        sweetalert.fire({
                            toast: true,
                            timer: 4000,
                            timerProgressBar: true,
                            title: `Successfully joined ${this.state.community.name}!`,
                            position: "bottom",
                            icon: 'success',
                            showConfirmButton: false,
                            customClass: 'sweetalert'
                        })
                    })
                    if (this._isMounted)
                        this.setState({
                            joined: true
                        })
                } else {
                    axios.patch(`/communities/leaveCommunity/${this.state.community._id}/${this.props.user.userId}`).then(community => {
                        sweetalert.fire({
                            toast: true,
                            timer: 4000,
                            timerProgressBar: true,
                            title: `Successfully left ${this.state.community.name}!`,
                            position: "bottom",
                            icon: 'success',
                            showConfirmButton: false,
                            customClass: 'sweetalert'
                        })
                        if (this._isMounted)
                            this.setState({
                                joined: false
                            })
                    })
                }
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
        }
    }

    redirectToCreatePost = () => {
        if (this.props.logged === true && this.state.joined === true)
            this.props.history.push(`/communities/${this.state.community._id}/createPost`);
        else
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Must join this community in order to post!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
    }

    rerender = () => {
        this.forceUpdate();
    }

    render() {
        const cloudinaryCore = new cloudinary.Cloudinary({ cloud_name: 'everythingairsoft' });
        return (
            <React.Fragment>
                <main>
                    <React.Fragment>
                        <div className='community-details-container'>
                            {
                                this.state.community !== undefined ? <React.Fragment>
                                    <div className='community-heading'>
                                        <h1>{this.state.community.name}</h1>
                                    </div>
                                    <div className='community-body'>
                                        <div className='posts-container'>
                                            {
                                                this.state.community.posts.map(post => {
                                                    return <Post rerenderParent={this.rerender} key={post} post={post} />
                                                })
                                            }
                                        </div>
                                        <div className='about-container'>
                                            <img src={cloudinaryCore.url(`${this.state.community._id}`)} alt={this.state.community.name} />
                                            <h1>About Community</h1>
                                            <p>{this.state.community.description}</p>
                                            <p>{this.state.community.numMembers} Members</p>
                                            <p>Created at {this.formatDate()['month']} {this.formatDate()['day']}, {this.formatDate()['year']}</p>
                                            <div className='about-container-buttons'>
                                                <button onClick={this.redirectToCreatePost}>Create Post</button>
                                                {
                                                    this.state.owner === false ? <button onClick={this.joinOrLeave}>{this.state.joined ? 'LEAVE' : 'JOIN'}</button> : <button disabled onClick={this.joinOrLeave}>Owner</button>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment> : ''
                            }
                        </div>
                    </React.Fragment>
                </main>
                <Circle color='#e9e9e9' background='#383838' customLoading={this.state.loaded} />
            </React.Fragment >
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

export default connect(mapStateToProps, mapDispatchToProps())(CommunityDetails);