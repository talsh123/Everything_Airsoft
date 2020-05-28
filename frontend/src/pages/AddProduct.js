import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import bcrypt from 'bcryptjs';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class AddProduct extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            showForm: undefined,
            loaded: false
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
                                title: `An error occured, please try again later.`,
                                position: "bottom",
                                icon: 'error',
                                showConfirmButton: false,
                                customClass: 'sweetalert',
                            })
                            this.props.history.push('/');
                        }
                        else {
                            if (boolean === true) {
                                if (this._isMounted) {
                                    this.setState({
                                        showForm: true
                                    })
                                    const mainCategory = document.querySelector('.main-category');
                                    const categoryWeapon = document.querySelector('.category-weapon');
                                    const categoryAccessory = document.querySelector('.category-accessory');
                                    const categoryWeaponPart = document.querySelector('.category-weapon-part');
                                    const categoryAmmunition = document.querySelector('.category-ammunition');
                                    const weaponSpecifications = document.querySelector('.weapon-specifications');
                                    const accessorySpecifications = document.querySelector('.accessory-specifications');
                                    const ammunitionSpecifications = document.querySelector('.ammunition-specifications');

                                    const weaponType = document.querySelector('.weapon-type');
                                    const weaponLength = document.querySelector('.weapon-length');
                                    const fps = document.querySelector('.fps');
                                    const weight = document.querySelector('.weight');
                                    const ammunitionSize = document.querySelector('.ammunition-size');
                                    const ammunitionQuantity = document.querySelector('.ammunition-quantity');
                                    const accessorySize = document.querySelector('.accessory-size');

                                    categoryWeapon.style.display = 'unset';
                                    categoryAccessory.style.display = 'none';
                                    categoryWeaponPart.style.display = 'none';
                                    categoryAmmunition.style.display = 'none';
                                    weaponSpecifications.style.display = 'unset';
                                    ammunitionSpecifications.style.display = 'none';
                                    accessorySpecifications.style.display = 'none';

                                    mainCategory.addEventListener('change', () => {
                                        switch (mainCategory.value) {
                                            case 'weapon':
                                                weaponType.required = true;
                                                weaponLength.required = true;
                                                fps.required = true;
                                                weight.required = true;
                                                ammunitionSize.required = false;
                                                ammunitionQuantity.required = false;
                                                accessorySize.required = false;
                                                categoryWeapon.style.display = 'unset';
                                                categoryAccessory.style.display = 'none';
                                                categoryWeaponPart.style.display = 'none';
                                                categoryAmmunition.style.display = 'none';
                                                weaponSpecifications.style.display = 'unset';
                                                ammunitionSpecifications.style.display = 'none';
                                                accessorySpecifications.style.display = 'none';
                                                break;
                                            case 'accessory':
                                                weaponType.required = false;
                                                weaponLength.required = false;
                                                fps.required = false;
                                                weight.required = false;
                                                ammunitionSize.required = false;
                                                ammunitionQuantity.required = false;
                                                accessorySize.required = true;
                                                categoryWeapon.style.display = 'none';
                                                categoryAccessory.style.display = 'unset';
                                                categoryWeaponPart.style.display = 'none';
                                                categoryAmmunition.style.display = 'none';
                                                weaponSpecifications.style.display = 'none';
                                                ammunitionSpecifications.style.display = 'none';
                                                accessorySpecifications.style.display = 'unset';
                                                break;
                                            case 'weaponPart':
                                                weaponType.required = false;
                                                weaponLength.required = false;
                                                fps.required = false;
                                                weight.required = false;
                                                ammunitionSize.required = false;
                                                ammunitionQuantity.required = false;
                                                accessorySize.required = false;
                                                categoryWeapon.style.display = 'none';
                                                categoryAccessory.style.display = 'none';
                                                categoryWeaponPart.style.display = 'unset';
                                                categoryAmmunition.style.display = 'none';
                                                weaponSpecifications.style.display = 'none';
                                                ammunitionSpecifications.style.display = 'none';
                                                accessorySpecifications.style.display = 'none';
                                                break;
                                            case 'ammunition':
                                                weaponType.required = false;
                                                weaponLength.required = false;
                                                fps.required = false;
                                                weight.required = false;
                                                ammunitionSize.required = true;
                                                ammunitionQuantity.required = true;
                                                accessorySize.required = false;
                                                categoryWeapon.style.display = 'none';
                                                categoryAccessory.style.display = 'none';
                                                categoryWeaponPart.style.display = 'none';
                                                categoryAmmunition.style.display = 'unset';
                                                weaponSpecifications.style.display = 'none';
                                                ammunitionSpecifications.style.display = 'unset';
                                                accessorySpecifications.style.display = 'none';
                                                break;
                                            default:
                                        }
                                    })
                                }
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
                }
                else if (result.dismiss === sweetalert.DismissReason.cancel || result.value === '') {
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

    handleSubmit = (e) => {
        e.preventDefault();
        const name = document.querySelector('.product-name').value;
        const price = document.querySelector('.product-price').value;
        const amountInStock = document.querySelector('.amount-in-stock').value;
        const manufacturer = document.querySelector('.manufacturer').value;
        const material = document.querySelector('.material').value;
        const color = document.querySelector('.color').value;

        const mainCategory = document.querySelector('.main-category').value;
        let secondaryCategory;

        switch (mainCategory) {
            case 'weapon':
                secondaryCategory = document.querySelector('.category-weapon').value;
                break;
            case 'ammunition':
                secondaryCategory = document.querySelector('.category-ammunition').value;
                break;
            case 'accessory':
                secondaryCategory = document.querySelector('.category-accessory').value;
                break;
            case 'weaponPart':
                secondaryCategory = document.querySelector('.category-weapon-part').value;
                break;
            default:
        }

        const file = document.querySelector('.file-upload');

        let newProduct;

        switch (mainCategory) {
            case 'weapon':
                const weaponType = document.querySelector('.weapon-type').value;
                const weaponLength = document.querySelector('.weapon-length').value;
                const fps = document.querySelector('.fps').value;
                const weight = document.querySelector('.weight').value;
                const magCapacity = document.querySelector('.mag-capacity').value ? document.querySelector('.mag-capacity').value : undefined;
                const innerBarrelLength = document.querySelector('.inner-barrel-length').value ? document.querySelector('.inner-barrel-length').value : undefined;
                newProduct = {
                    name,
                    mainCategory,
                    secondaryCategory,
                    details: {
                        ratings: [],
                        rating: 0.0,
                        price,
                        numInStock: amountInStock,
                        material,
                        color,
                        manufacturer,
                        type: weaponType,
                        magCapacity,
                        innerBarrelLength,
                        weaponLength,
                        fps,
                        weight
                    }
                }
                break;
            case 'accessory':
                const accessorySize = document.querySelector('.accessory-size').value;
                newProduct = {
                    name,
                    mainCategory,
                    secondaryCategory,
                    details: {
                        ratings: [],
                        rating: 0.0,
                        price,
                        numInStock: amountInStock,
                        material,
                        color,
                        manufacturer,
                        accessorySize
                    }
                }
                break;
            case 'ammunition':
                const ammunitionQuantity = document.querySelector('.ammunition-quantity').value;
                const ammunitionSize = document.querySelector('.ammunition-size').value;
                newProduct = {
                    name,
                    mainCategory,
                    secondaryCategory,
                    details: {
                        ratings: [],
                        rating: 0.0,
                        price,
                        numInStock: amountInStock,
                        material,
                        color,
                        manufacturer,
                        ammunitionSize,
                        ammunitionQuantity
                    }
                }
                break;
            case 'weaponPart':
                newProduct = {
                    name,
                    mainCategory,
                    secondaryCategory,
                    details: {
                        ratings: [],
                        rating: 0.0,
                        price,
                        numInStock: amountInStock,
                        material,
                        color,
                        manufacturer
                    }
                }
                break;
            default:
        }

        const formData = new FormData();
        formData.append('file', file.files[0]);
        const product = JSON.stringify(newProduct);
        formData.append('product', product);

        axios.post('/products/post', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            console.log(res.data);
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Successfully saved product!`,
                position: "bottom",
                icon: 'success',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
        }).catch(err => {
            console.log(err)
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
        });
    }

    render() {
        return (
            <React.Fragment >
                {
                    this.state.showForm === true ? <React.Fragment>
                        <main>
                            <div className='add-product-container'>
                                <h1>Add Product</h1>
                                <form onSubmit={this.handleSubmit} className='add-product-form' method='POST'>
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Product Name*</label>
                                        <input type='text' className='product-name' name='product-name' required />
                                    </div>
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Product Price*</label>
                                        <input type='number' min="0" className='product-price' name='product-price' required />
                                    </div>
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Amount In Stock*</label>
                                        <input type='number' min="0" className='amount-in-stock' name='product-in-stock' required />
                                    </div>
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Manufacturer*</label>
                                        <input type='text' className='manufacturer' name='product-manufacturer' required />
                                    </div>
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Material*</label>
                                        <input type='text' className='material' name='product-material' required />
                                    </div>
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Color*</label>
                                        <input type='text' className='color' name='product-color' required />
                                    </div>
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Product Type*</label>
                                        <select defaultValue="weapon" className='main-category' required>
                                            <option value='weapon'>Weapon</option>
                                            <option value='accessory'>Accessory</option>
                                            <option value='weaponPart'>Weapon Part</option>
                                            <option value='ammunition'>Ammunition</option>
                                        </select>
                                    </div>
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Category*</label>
                                        <select className='category-weapon' required>
                                            <option value='sniperRifles'>Sniper Rifle</option>
                                            <option value='assaultRifles'>Assault Rifle</option>
                                            <option value='handguns'>Handgun</option>
                                            <option value='shotguns'>Shotgun</option>
                                            <option value='machineguns'>Machine Gun</option>
                                            <option value='machineguns'>Revolver</option>
                                            <option value='grenadeLaunchers'>Grenade Launcher</option>
                                        </select>
                                        <select className='category-accessory' required>
                                            <option value='gloves'>Gloves</option>
                                            <option value='vests'>Vest</option>
                                            <option value='helmets'>Helmet</option>
                                            <option value='boots'>Boots</option>
                                            <option value='belts'>Belt</option>
                                            <option value='shades'>Shades</option>
                                            <option value='uniforms'>Uniform</option>
                                        </select>
                                        <select className='category-weapon-part' required>
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
                                        <select className='category-ammunition' required>
                                            <option value='6mm'>6mm</option>
                                            <option value='8mm'>8mm</option>
                                            <option value='tracer'>Tracer</option>
                                            <option value='0.12g'>0.12g</option>
                                        </select>
                                    </div>
                                    {/* Weapon Specifications */}
                                    <div className='weapon-specifications'>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>Weapon Type*</label>
                                            <select className='weapon-type'>
                                                <option value='spring'>Spring</option>
                                                <option value='electric'>Electric</option>
                                                <option value='gas'>Gas</option>
                                            </select>
                                        </div>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>Magazine Capacity</label>
                                            <input type='number' min="0" className='mag-capacity' name='product-mag-capacity' />
                                        </div>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>Weapon Length(mm)*</label>
                                            <input type='number' className='weapon-length' min="0" name='product-weapon-length' />
                                        </div>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>Inner Barrel Length(mm)</label>
                                            <input type='number' className='inner-barrel-length' min="0" name='product-inner-barrel-length' />
                                        </div>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>FPS*</label>
                                            <input type='number' className='fps' min="0" name='product-fps' />
                                        </div>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>Weight*</label>
                                            <input type='number' className='weight' min="0" step='0.1' name='product-weight' />
                                        </div>
                                    </div>
                                    {/* Accessory Specifications */}
                                    <div className='accessory-specifications'>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>Size*</label>
                                            <select defaultValue='xxl' className='accessory-size'>
                                                <option value='xxl'>XXL</option>
                                                <option value='xl'>XL</option>
                                                <option value='l'>L</option>
                                                <option value='m'>M</option>
                                                <option value='s'>S</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Ammunition Specifications */}
                                    <div className='ammunition-specifications'>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>Quantity*</label>
                                            <input type='number' className='ammunition-quantity' min="0" name='product-ammunition-quantity' />
                                        </div>
                                        <div className='add-product-user-input'>
                                            <label className='add-product-label'>Size*</label>
                                            <select defaultValue='xxl' className='ammunition-size'>
                                                <option value='6mm'>6mm</option>
                                                <option value='8mm'>8mm</option>
                                                <option value='0.12g'>0.12g</option>
                                                <option value='tracer'>Tracer</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Universal */}
                                    <div className='add-product-user-input'>
                                        <label className='add-product-label'>Product Image*</label>
                                        <input type='file' className='file-upload' name='file-upload' required />
                                    </div>
                                    <button type='submit'>Add Product</button>
                                </form>
                            </div>
                        </main>
                    </React.Fragment> : ''
                }
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

export default connect(mapStateToProps, mapDispatchToProps())(AddProduct);