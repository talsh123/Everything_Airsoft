import React, { Component } from 'react';
import { Circle } from 'react-preloaders';
import axios from 'axios';
import sweetalert from 'sweetalert2';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class UpdateProduct extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            product: undefined
        }
    }
    componentDidMount() {
        this._isMounted = true;

        if (this.props.user.isAdmin !== true)
            this.props.history.push('/');
        else {
            const productId = this.props.location.pathname.split('/')[2];
            axios.get(`/products/get/${productId}`).then(product => {
                if (this._isMounted)
                    this.setState({
                        product: product.data,
                        loaded: true
                    })
            })
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    updateProduct = (e) => {
        e.preventDefault();
        const mainCategory = document.querySelector('select[name="product-main-category"]').value;
        let secondaryCategory = undefined;
        switch (mainCategory) {
            case 'weapon':
                secondaryCategory = document.querySelector('.category-weapon').value;
                break;
            case 'accessory':
                secondaryCategory = document.querySelector('.category-accessory').value;
                break;
            case 'weaponPart':
                secondaryCategory = document.querySelector('.category-weapon-part').value;
                break;
            case 'ammunition':
                secondaryCategory = document.querySelector('.category-ammunition').value;
                break;
            default:
        }
        const updatedFields = {
            name: document.querySelector('input[name="product-name"]').value,
            mainCategory: mainCategory,
            secondaryCategory: secondaryCategory,
            details: {
                price: document.querySelector('input[name="product-price"]').value,
                numInStock: document.querySelector('input[name="product-amount-in-stock"]').value,
                material: document.querySelector('input[name="product-material"]').value,
                color: document.querySelector('input[name="product-color"]').value,
                manufacturer: document.querySelector('input[name="product-manufacturer"]').value,
                type: document.querySelector('select[name="product-weapon-type"]') !== null ? document.querySelector('select[name="product-weapon-type"]').value : null,
                magCapacity: document.querySelector('input[name="product-mag-capacity"]') !== null ? document.querySelector('input[name="product-mag-capacity"]').value : null,
                innerBarrelLength: document.querySelector('input[name="product-inner-barrel-length"]') !== null ? document.querySelector('input[name="product-inner-barrel-length"]').value : null,
                weaponLength: document.querySelector('input[name="product-weapon-length"]') !== null ? document.querySelector('input[name="product-weapon-length"]').value : null,
                fps: document.querySelector('input[name="product-fps"]') !== null ? document.querySelector('input[name="product-fps"]').value : null,
                weight: document.querySelector('input[name="product-weight"]') !== null ? document.querySelector('input[name="product-weight"]').value : null,
                accessorySize: document.querySelector('select[name="product-accessory-size"]') !== null ? document.querySelector('select[name="product-accessory-size"]').value : null,
                ammunitionSize: document.querySelector('select[name="product-ammunition-size"]') !== null ? document.querySelector('select[name="product-ammunition-size"]').value : null,
                ammunitionQuantity: document.querySelector('input[name="product-ammunition-quantity"]') !== null ? document.querySelector('input[name="product-ammunition-quantity"]').value : null,
            }
        }

        const file = document.querySelector('.file-upload');
        const formData = new FormData();
        formData.append('file', file.files[0]);
        const product = JSON.stringify(updatedFields);
        formData.append('product', product);

        axios.put(`/products/updateProduct/${this.state.product._id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Product has been updated!`,
                position: "bottom",
                icon: 'success',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
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
                    {
                        this.state.product !== undefined ? <React.Fragment>
                            <div className='update-product-container'>
                                <h1>Update Product</h1>
                                <h3>Please change the fields you would like to update!</h3>
                                <form onSubmit={this.updateProduct} className='update-product-form'>
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Product Name*</label>
                                        <input type='text' defaultValue={this.state.product.name} className='product-name' name='product-name' />
                                    </div>
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Product Price*</label>
                                        <input type='number' defaultValue={this.state.product.details.price.$numberDecimal} min="0" className='product-price' name='product-price' />
                                    </div>
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Amount In Stock*</label>
                                        <input type='number' min="0" defaultValue={this.state.product.details.numInStock} className='amount-in-stock' name='product-amount-in-stock' />
                                    </div>
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Manufacturer*</label>
                                        <input type='text' defaultValue={this.state.product.details.manufacturer} className='manufacturer' name='product-manufacturer' />
                                    </div>
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Material*</label>
                                        <input type='text' className='material' defaultValue={this.state.product.details.material} name='product-material' />
                                    </div>
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Color*</label>
                                        <input type='text' defaultValue={this.state.product.details.color} className='color' name='product-color' />
                                    </div>
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Product Type*</label>
                                        <select defaultValue={this.state.product.mainCategory} className='main-category' name='product-main-category'>
                                            <option value='weapon'>Weapon</option>
                                            <option value='accessory'>Accessory</option>
                                            <option value='weaponPart'>Weapon Part</option>
                                            <option value='ammunition'>Ammunition</option>
                                        </select>
                                    </div>
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Category*</label>
                                        {
                                            this.state.product.mainCategory === 'weapon' ? <React.Fragment>
                                                <select defaultValue={this.state.product.secondaryCategory} className='category-weapon' name='product-category-weapon'>
                                                    <option value='sniperRifles'>Sniper Rifle</option>
                                                    <option value='assaultRifles'>Assault Rifle</option>
                                                    <option value='handguns'>Handgun</option>
                                                    <option value='shotguns'>Shotgun</option>
                                                    <option value='machineguns'>Machine Gun</option>
                                                    <option value='machineguns'>Revolver</option>
                                                    <option value='grenadeLaunchers'>Grenade Launcher</option>
                                                </select>
                                            </React.Fragment> : ''
                                        }
                                        {
                                            this.state.product.mainCategory === 'accessory' ? <React.Fragment>
                                                <select className='category-accessory' name='product-category-accessory'>
                                                    <option value='gloves'>Gloves</option>
                                                    <option value='vests'>Vest</option>
                                                    <option value='helmets'>Helmet</option>
                                                    <option value='boots'>Boots</option>
                                                    <option value='belts'>Belt</option>
                                                    <option value='shades'>Shades</option>
                                                    <option value='uniforms'>Uniform</option>
                                                </select>
                                            </React.Fragment> : ''
                                        }
                                        {
                                            this.state.product.mainCategory === 'weaponPart' ? <React.Fragment>
                                                <select className='category-weapon-part' name='product-category-weapon-part'>
                                                    <option value='grips'>Grip</option>
                                                    <option value='optics'>Optic</option>
                                                    <option value='suppressors'>Suppressor</option>
                                                    <option value='silencers'>Silencer</option>
                                                    <option value='stocks'>Stock</option>
                                                    <option value='batteries'>Batteries</option>
                                                    <option value='magazines'>Magazine</option>
                                                    <option value='bipods'>Bipod</option>
                                                    <option value='lasers'>Laser</option>
                                                </select>
                                            </React.Fragment> : ''
                                        }
                                        {
                                            this.state.product.mainCategory === 'ammunition' ? <React.Fragment>
                                                <select className='category-ammunition' name='product-category-ammunition'>
                                                    <option value='6mm'>6mm</option>
                                                    <option value='8mm'>8mm</option>
                                                    <option value='tracer'>Tracer</option>
                                                    <option value='0.12g'>0.12g</option>
                                                </select>
                                            </React.Fragment> : ''
                                        }
                                    </div>
                                    {
                                        this.state.product.mainCategory === 'weapon' ? <React.Fragment>
                                            {/* Weapon Specifications */}
                                            <div className='weapon-specifications'>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>Weapon Type*</label>
                                                    <select defaultValue={this.state.product.details.type} className='weapon-type' name='product-weapon-type'>
                                                        <option value='spring'>Spring</option>
                                                        <option value='electric'>Electric</option>
                                                        <option value='gas'>Gas</option>
                                                    </select>
                                                </div>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>Magazine Capacity</label>
                                                    <input type='number' defaultValue={this.state.product.details.magCapacity} min="0" className='mag-capacity' name='product-mag-capacity' />
                                                </div>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>Weapon Length(mm)*</label>
                                                    <input type='number' defaultValue={this.state.product.details.weaponLength} className='weapon-length' min="0" name='product-weapon-length' />
                                                </div>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>Inner Barrel Length(mm)</label>
                                                    <input type='number' defaultValue={this.state.product.details.innerBarrelLength} className='inner-barrel-length' min="0" name='product-inner-barrel-length' />
                                                </div>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>FPS*</label>
                                                    <input type='number' defaultValue={this.state.product.details.fps} className='fps' min="0" name='product-fps' />
                                                </div>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>Weight*</label>
                                                    <input type='number' defaultValue={this.state.product.details.weight} className='weight' min="0" step='0.1' name='product-weight' />
                                                </div>
                                            </div>
                                        </React.Fragment> : ''
                                    }
                                    {
                                        this.state.product.mainCategory === 'accessory' ? <React.Fragment>
                                            {/* Accessory Specifications */}
                                            <div className='accessory-specifications'>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>Size*</label>
                                                    <select defaultValue={this.state.product.details.accessorySize} className='accessory-size' name='product-accessory-size'>
                                                        <option value='xxl'>XXL</option>
                                                        <option value='xl'>XL</option>
                                                        <option value='l'>L</option>
                                                        <option value='m'>M</option>
                                                        <option value='s'>S</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </React.Fragment> : ''
                                    }
                                    {
                                        this.state.product.mainCategory === 'ammunition' ? <React.Fragment>
                                            {/* Ammunition Specifications */}
                                            <div className='ammunition-specifications'>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>Quantity*</label>
                                                    <input type='number' defaultValue={this.state.product.details.ammunitionQuantity} className='ammunition-quantity' min="0" name='product-ammunition-quantity' />
                                                </div>
                                                <div className='update-product-user-input'>
                                                    <label className='update-product-label'>Size*</label>
                                                    <select defaultValue={this.state.product.details.ammunitionSize} className='ammunition-size' name='product-ammunition-size'>
                                                        <option value='6mm'>6mm</option>
                                                        <option value='8mm'>8mm</option>
                                                        <option value='0.12g'>0.12g</option>
                                                        <option value='tracer'>Tracer</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </React.Fragment> : ''
                                    }
                                    {/* Universal */}
                                    <div className='update-product-user-input'>
                                        <label className='update-product-label'>Product Image*</label>
                                        <input type='file' className='file-upload' name='file-upload' />
                                    </div>
                                    <button type='submit'>Update Product</button>
                                </form>
                            </div>
                        </React.Fragment> : ''
                    }
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

export default connect(mapStateToProps, mapDispatchToProps())(UpdateProduct);