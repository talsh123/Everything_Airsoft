import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class Post extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            post: undefined,
            originalPoster: undefined
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.getState();
        }
    }

    getState = () => {
        axios.get(`/posts/getPost/${this.props.post}`).then(post => {
            if (this._isMounted) {
                this.setState({
                    post: post.data
                });
            }
            if (this.state.post) {
                axios.get(`/users/getUserById/${this.state.post.originalPoster}`).then(user => {
                    if (this._isMounted) {
                        this.setState({
                            originalPoster: user.data
                        })
                    }
                    this.setColors();
                })
            }
        });
    }

    setColors = () => {
        const like = document.querySelector('.like');
        const dislike = document.querySelector('.dislike');
        const numOfLikes = document.querySelector('.likes-container p');

        if (this.state.post.usersLiked.indexOf(this.props.user.userId) !== -1) {
            like.style.color = '#25e000';
            like.style.backgroundColor = '#2b2b2c'
            dislike.style.backgroundColor = ''
            dislike.style.color = '';
            numOfLikes.style.color = '#25e000';
        } else if (this.state.post.usersDisliked.indexOf(this.props.user.userId) !== -1) {
            like.style.color = '';
            dislike.style.color = '#e03400';
            dislike.style.backgroundColor = '#2b2b2c'
            like.style.backgroundColor = ''
            numOfLikes.style.color = '#e03400';
        } else {
            like.style.backgroundColor = ''
            dislike.style.backgroundColor = ''
            like.style.color = '';
            dislike.style.color = '';
            numOfLikes.style.color = '';
        }
    }

    componentDidUpdate() {
        this.props.rerenderParent();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    dateDiffInDays = (a, b) => {
        const diffMs = (a - b);
        const diffDays = Math.floor(diffMs / 86400000); // days
        if (diffDays === 0) {
            const diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
            if (diffHrs === 0) {
                const diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
                return `${diffMins} minutes ago`;
            } else
                return `${diffHrs} hours ago`;
        } else
            return `${diffDays} days ago`;
    }

    deletePost = () => {
        axios.delete(`/posts/deletePost/${this.state.post._id}`).then(post => {
            if (this._isMounted) {
                this.setState({
                    originalPoster: undefined,
                    post: undefined
                });
                this.props.rerenderParent();
                sweetalert.fire({
                    toast: true,
                    timer: 4000,
                    timerProgressBar: true,
                    title: `Post has been successfully deleted!`,
                    position: "bottom",
                    icon: 'success',
                    showConfirmButton: false,
                    customClass: 'sweetalert'
                })
            }
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
    }

    like = () => {
        if (this.props.logged) {
            axios.patch(`/posts/like/${this.state.post._id}/${this.props.user.userId}`).then(post => {
                this.getState();
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
        }
        else {
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Must be logged in to rate a post!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
        }
    }

    dislike = () => {
        if (this.props.logged) {
            axios.patch(`/posts/dislike/${this.state.post._id}/${this.props.user.userId}`).then(post => {
                this.getState();
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
        }
        else {
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Must be logged in to rate a post!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
        }
    }

    render() {
        return (
            <React.Fragment>
                <div className='post-container'>
                    {
                        (this.state.post && this.state.originalPoster) ? <React.Fragment>
                            <div className='post-body'>
                                <div className='likes-container'>
                                    <i className='fa fa-thumbs-up like' onClick={this.like}></i>
                                    <p>{this.state.post.likes}</p>
                                    <i className='fa fa-thumbs-down dislike' onClick={this.dislike}></i>
                                </div>
                                <div className='post-info-container'>
                                    <div className='post-info-header'>
                                        <h3>Posted by {this.state.originalPoster.username} {this.dateDiffInDays(new Date(), new Date(this.state.post.createdAt))}</h3>
                                        {
                                            this.state.originalPoster._id === this.props.user.userId ? <i className="far fa-window-close" onClick={this.deletePost}></i> : ''
                                        }
                                    </div>
                                    <h1>{this.state.post.title}</h1>
                                    <p>{this.state.post.text}</p>
                                    <div className='post-info'>
                                        <h4>{this.state.post.comments.length} Comments</h4>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment> : ''
                    }
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

export default connect(mapStateToProps, mapDispatchToProps())(Post);