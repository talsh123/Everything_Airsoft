import React, { Component } from 'react';
import axios from 'axios';
import RatingStars from 'react-rating';
import sweetalert from 'sweetalert2';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class Rating extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            rating: undefined,
            originalPoster: undefined
        }
    }

    getState = () => {
        axios.get(`/ratings/getRating/${this.props.rating}`).then(rating => {
            if (rating.data !== null) {
                axios.get(`/users/getUserById/${rating.data.originalPoster}`).then(originalPoster => {
                    if (this._isMounted)
                        this.setState({
                            originalPoster: originalPoster.data,
                            rating: rating.data
                        })
                })
            } else {
                if (this._isMounted)
                    this.setState({
                        rating: undefined,
                        originalPoster: undefined
                    })
            }
        })
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.getState();
        }
    }

    deleteRating = () => {
        axios.delete(`/ratings/deleteRating/${this.state.rating._id}`).then(rating => {
            this.getState();
            this.props.rerenderParent();
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Rating has been removed!`,
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
                title: `An error occured, please try again later.`,
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

    render() {
        return (
            < React.Fragment >
                {
                    this.state.originalPoster && this.state.rating ? <React.Fragment>
                        <div className='rating-container'>
                            <div className='user-info'>
                                <i className='fas fa-user'></i>
                                <h1>{this.state.originalPoster.username}</h1>
                                {
                                    this.state.originalPoster.username === this.props.user.username ? <i className="far fa-window-close" onClick={this.deleteRating}></i> : ''
                                }
                            </div>
                            <div className='rating-info'>
                                <div className='rating'>
                                    <RatingStars readonly className='stars' emptySymbol='far fa-star' fullSymbol='fas fa-star' fractions={10} start='0' stop='5' initialRating={this.state.rating.rating.$numberDecimal} />
                                </div>
                                <h1>{this.state.rating.title}</h1>
                            </div>
                            <p>{this.state.rating.text}</p>
                        </div>
                    </React.Fragment> : ''
                }
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

export default connect(mapStateToProps, mapDispatchToProps())(Rating);