import React, { Component } from 'react'
import axios from 'axios';
import sweetalert from 'sweetalert2';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class CreatePost extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            community: undefined,
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
                title: `Must be logged into a verified account in order to create a post!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
        }
        else {
            if (this._isMounted) {
                axios.get(`/communities/getCommunity/${this.props.history.location.pathname.split('/')[2]}`).then(community => {
                    if (this._isMounted)
                        this.setState({
                            community: community.data
                        });
                })
            }
        }

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const newPost = {
            title: document.querySelector('input[name="title"]').value,
            text: document.querySelector('textarea[name="text"]').value,
            userId: this.props.user.userId,
            communityId: this.state.community._id
        }

        axios.post('/posts/savePost', newPost).then(savedPost => {
            axios.patch(`/communities/comment/${this.state.community._id}/${savedPost.data._id}`).then(res => {
                sweetalert.fire({
                    toast: true,
                    timer: 4000,
                    timerProgressBar: true,
                    title: `Successfully uploaded post to ${this.state.community.name}!`,
                    position: "bottom",
                    icon: 'success',
                    showConfirmButton: false,
                    customClass: 'sweetalert'
                })
                this.props.history.push(`/communities/${this.state.community._id}`)
            }).catch(err => console.log(err));
        }).catch(_err => {
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

    render() {
        return (
            <React.Fragment>
                <main>
                    <div className='create-post-container'>
                        <h1>Create Post</h1>
                        <form onSubmit={this.handleSubmit} className='create-post-form' method='POST'>
                            <div className='create-post-user-input'>
                                <label className='create-post-label'>Title*</label>
                                <input type='text' name='title' required />
                            </div>
                            <div className='create-post-user-input'>
                                <label className='create-post-label'>Text</label>
                                <textarea rows='10' name='text' />
                            </div>
                            <button type='submit'>Post</button>
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

export default connect(mapStateToProps, mapDispatchToProps())(CreatePost);