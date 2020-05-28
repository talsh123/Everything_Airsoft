import React, { Component } from 'react';
import sweetalert from 'sweetalert2';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import cloudinary from 'cloudinary-core';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class ManageProducts extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            selectedProducts: [],
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
                                this.fetchProducts();
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

    fetchProducts = () => {
        axios.get('/products/all').then(products => {
            if (this._isMounted)
                this.setState({
                    selectedProducts: products.data
                })
        })
    }

    updateProducts = () => {
        const searchText = document.querySelector('.manage-products-text-field').value;
        if (searchText) {
            axios.get(`/products/likeProduct/${searchText}`).then(products => {
                if (this._isMounted)
                    this.setState({
                        selectedProducts: products.data
                    })
            })
        } else {
            this.fetchProducts();
        }
    }

    redirectToUpdateProduct = (e) => {
        this.props.history.push(`/updateProduct/${e.target.getAttribute('aria-label')}`);
    }

    removeProduct = (e) => {
        const productToDelete = e.target.getAttribute('aria-label');
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
                axios.delete(`/products/delete/${productToDelete}`).then(productRes => {
                    if (this._isMounted)
                        this.setState({
                            selectedProducts: this.state.selectedProducts.filter(product => {
                                return product.name !== productRes.data.name;
                            })
                        })
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
                })
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
            }
        })
    }

    render() {
        const cloudinaryCore = new cloudinary.Cloudinary({ cloud_name: 'everythingairsoft' });
        return (
            <React.Fragment>
                <main>
                    <div className='manage-products-container'>
                        <input placeholder='search products...' className='manage-products-text-field' type='text' onChange={this.updateProducts} />
                        <table className='manage-products-table'>
                            <thead>
                                <tr>
                                    <th><strong>Product Image</strong></th>
                                    <th><strong>ID</strong></th>
                                    <th><strong>Name</strong></th>
                                    <th><strong>Main Category</strong></th>
                                    <th><strong>Rating</strong></th>
                                    <th><strong>Price</strong></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    this.state.showTable === true ? this.state.selectedProducts.map(product => {
                                        return <React.Fragment key={product._id}>
                                            <tr>
                                                <td><img className='manage-products-image' src={cloudinaryCore.url(`${product._id}`)} alt={product.name} /></td>
                                                <td>{product._id}</td>
                                                <td>{product.name}</td>
                                                <td>{product.mainCategory.slice(0, 1).toUpperCase() + product.mainCategory.slice(1)}</td>
                                                <td>{product.details.rating.$numberDecimal}</td>
                                                <td>&#8362;{product.details.price.$numberDecimal}</td>
                                                <td>
                                                    <button className='update-product-button' aria-label={product._id} onClick={this.redirectToUpdateProduct}>Update</button>
                                                    <button className='remove-product-button' aria-label={product._id} onClick={this.removeProduct}>Remove</button>
                                                </td>
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

export default connect(mapStateToProps, mapDispatchToProps())(ManageProducts);