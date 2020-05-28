import React, { Component } from 'react';
import cloudinary from 'cloudinary-core';
import Rating from 'react-rating';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class ProductCard extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        this.ratingRef = React.createRef();
        this.starsRef = React.createRef();
    }

    // Adds the selected product to the cart items redux state
    // If the item exists in the cart, the item's amount in the cart will increment by 1
    addToCart = () => {
        if (this._isMounted) {
            this.props.setShoppingCartInfo({
                _id: this.props._id,
                name: this.props.name,
                price: this.props.price,
                amount: 1
            });
        }
    }

    componentDidMount() {
        this._isMounted = true;

        const starsRef = this.starsRef.current;
        starsRef.addEventListener('mouseover', () => {
            this.setLabel(this.props.rating);
        })

        starsRef.addEventListener('mouseleave', () => {
            this.setLabel(-1);
        })

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    setLabel = (rate) => {
        const currentRef = this.ratingRef.current;
        if (rate >= 0) {
            if (this.props.rating % 1 !== 0)
                currentRef.innerHTML = `${Math.round(this.props.rating * 10) / 10} out of 5.0`;
            else
                currentRef.innerHTML = `${Math.round(this.props.rating * 10) / 10}.0 out of 5.0`;
        } else {
            currentRef.innerHTML = '';
        }
    }

    render() {
        // Sets cloud_name in cloudinary API image requests
        const cloudinaryCore = new cloudinary.Cloudinary({ cloud_name: 'everythingairsoft' });
        return (
            // Product Card
            <React.Fragment>
                <Link to={`/shop/view/${this.props._id}`}><img src={cloudinaryCore.url(`${this.props._id}`)} alt={this.props.name} /></Link>
                <Link to={`/shop/view/${this.props._id}`}><h3>{this.props.name.length > 50 ? `${this.props.name.substring(0, 50)}...` : this.props.name}</h3></Link>
                <Link to={`/shop/view/${this.props._id}`}><h4>&#8362;{this.props.price}</h4></Link>
                <Link to={`/shop/view/${this.props._id}`}><label className='rating' ref={this.ratingRef}></label></Link>
                <Link to={`/shop/view/${this.props._id}`}><div ref={this.starsRef} className='stars'>
                    <Rating readonly className='stars' emptySymbol='far fa-star' fullSymbol='fas fa-star' fractions={10} start='0' stop='5' initialRating={this.props.rating} />
                </div></Link>
                <div className="buttons">
                    <Link to={`/shop/view/${this.props._id}`}><button className="view-button" type="button">View</button></Link>
                    <button onClick={this.addToCart} className="cart-button" type="button">Add to Cart</button>
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

export default connect(mapStateToProps, mapDispatchToProps())(ProductCard);