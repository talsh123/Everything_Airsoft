import React, { Component } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Circle } from 'react-preloaders';

export default class Shop extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            categoryProducts: undefined,
            chosenProducts: undefined,
            uniqueManufacturers: undefined,
            uniqueColors: undefined,
            uniqueTypes: undefined,
            minFPS: undefined,
            maxFPS: undefined,
            uniqueSizes: undefined,
            minQuantity: undefined,
            maxQuantity: undefined,
            pickedCategory: undefined,
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        const mainSelectors = document.querySelectorAll('.first');
        const secondSelectors = document.querySelectorAll('.second');

        mainSelectors.forEach((selector, index) => {
            selector.addEventListener('mouseover', () => {
                secondSelectors[index].style.visibility = 'visible';
            })
            selector.addEventListener('mouseleave', () => {
                secondSelectors[index].style.visibility = 'hidden';
            })
        });

        secondSelectors.forEach((secondSelector, index) => {
            secondSelector.addEventListener('mouseover', () => {
                secondSelectors[index].style.visibility = 'visible';
            })
            secondSelector.addEventListener('mouseleave', () => {
                secondSelectors[index].style.visibility = 'hidden';
            })
        })

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    chooseProducts = (e) => {
        const label = e.target.getAttribute('aria-labelledby');
        if (label !== 'weapon' && label !== 'weaponPart' && label !== 'accessory' && label !== 'ammunition') {
            axios.get(`/products/getProductsBySecondaryCategory/${label}`).then(products => {
                if (this._isMounted) {
                    this.setState({
                        pickedCategory: label,
                        categoryProducts: products.data
                    })
                    this.getState(products.data);
                }
            })
        }
        else {
            axios.get(`/products/getProductsByMainCategory/${label}`).then(products => {
                if (this._isMounted) {
                    this.setState({
                        pickedCategory: label,
                        categoryProducts: products.data
                    })
                    this.getState(products.data);
                }
            })
        }
    }

    getState = (chosenProducts) => {
        let colors = [];
        let manufacturers = [];
        let types = [];
        let fps = [];
        let sizes = [];
        let ammunitionQuantities = [];
        chosenProducts.forEach(product => {
            colors.push(product.details.color);
            manufacturers.push(product.details.manufacturer);
            if (product.details.type !== undefined)
                types.push(product.details.type.charAt(0).toUpperCase() + product.details.type.slice(1))
            if (product.details.fps !== undefined)
                fps.push(product.details.fps);
            if (product.details.accessorySize !== undefined)
                sizes.push(product.details.accessorySize.toUpperCase());
            if (product.details.ammunitionQuantity !== undefined)
                ammunitionQuantities.push(product.details.ammunitionQuantity);
        })
        const uniqueColors = Array.from([...new Set(colors)]);
        const uniqueManufacturers = Array.from([...new Set(manufacturers)]);
        // Optional Filters
        let uniqueTypes = Array.from([...new Set(types)]);
        let minFPS = Math.min.apply(null, fps);
        let maxFPS = Math.max.apply(null, fps);
        let uniqueSizes = Array.from([...new Set(sizes)]);
        let minQuantity = Math.min.apply(null, ammunitionQuantities);
        let maxQuantity = Math.max.apply(null, ammunitionQuantities);
        if (uniqueTypes.length === 0)
            uniqueTypes = undefined
        if (uniqueSizes.length === 0)
            uniqueSizes = undefined
        if (maxQuantity === Infinity || minQuantity === Infinity)
            maxQuantity = minQuantity = undefined;
        if (maxFPS === Infinity || minFPS === Infinity)
            maxFPS = minFPS = undefined;

        if (this._isMounted)
            this.setState({
                chosenProducts: chosenProducts,
                uniqueManufacturers: uniqueManufacturers,
                uniqueColors: uniqueColors,
                uniqueTypes: uniqueTypes,
                minFPS: minFPS,
                maxFPS: maxFPS,
                uniqueSizes: uniqueSizes,
                minQuantity: minQuantity,
                maxQuantity: maxQuantity
            })
    }

    filter = () => {
        const checkboxes = Array.from(document.querySelectorAll('input[aria-labelledby]'));
        const checkedBoxes = checkboxes.filter(checkbox => checkbox.checked);
        const manufacturerFilters = [];
        const colorFilters = [];
        const typeFilters = [];
        const sizeFilters = [];
        let filteredProducts = [];
        checkedBoxes.forEach(checkedCheckbox => {
            switch (checkedCheckbox.attributes[1].value) {
                case 'manufacturer':
                    manufacturerFilters.push(checkedCheckbox.value);
                    break;
                case 'color':
                    colorFilters.push(checkedCheckbox.value);
                    break;
                case 'type':
                    typeFilters.push(checkedCheckbox.value);
                    break;
                case 'accessorySize':
                    sizeFilters.push(checkedCheckbox.value);
                    break;
                default:
            }
        })

        filteredProducts = this.state.categoryProducts.filter(product => manufacturerFilters.includes(product.details.manufacturer))
            .concat(this.state.categoryProducts.filter(product => colorFilters.includes(product.details.color)))
            .concat(this.state.categoryProducts.filter(product => typeFilters.includes(product.details.type)))
            .concat(this.state.categoryProducts.filter(product => sizeFilters.includes(product.details.accessorySize)))


        filteredProducts = Array.from([...new Set(filteredProducts)]);

        if (this._isMounted)
            if (filteredProducts.length > 0)
                this.setState({
                    chosenProducts: filteredProducts
                })
            else
                this.setState({
                    chosenProducts: this.state.categoryProducts
                })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    sort = (e) => {
        this.filter();
        let sortedProducts = [];
        switch (e.target.value) {
            case 'lowestToHighest':
                sortedProducts = this.state.chosenProducts.sort(function (a, b) {
                    return (a.details.price.$numberDecimal - b.details.price.$numberDecimal);
                });
                break;
            case 'highestToLowest':
                sortedProducts = this.state.chosenProducts.sort(function (a, b) {
                    return (b.details.price.$numberDecimal - a.details.price.$numberDecimal);
                });
                break;
            case 'rating':
                sortedProducts = this.state.chosenProducts.sort(function (a, b) {
                    return (b.details.rating.$numberDecimal - a.details.rating.$numberDecimal);
                });
                break;
            default:
        }
        if (this._isMounted)
            this.setState({
                chosenProducts: sortedProducts
            })
    }

    render() {
        return (
            <React.Fragment>
                <main>
                    <div className='shop-container'>
                        <div className='shop-menu-container'>
                            <ul>
                                <li className='first'>
                                    <i className="fas fa-crosshairs"></i>
                                    <button onClick={this.chooseProducts} aria-labelledby='weapon' className='first-shop-link'>Weapons</button>
                                    <i className='fas fa-angle-right'></i>
                                </li>
                                <li className='first'>
                                    <i className="fas fa-cog"></i>
                                    <button onClick={this.chooseProducts} aria-labelledby='weaponPart' className='first-shop-link'>Weapon Parts</button>
                                    <i className='fas fa-angle-right'></i>
                                </li>
                                <li className='first'>
                                    <i className="fas fa-hard-hat"></i>
                                    <button onClick={this.chooseProducts} aria-labelledby='accessory' className='first-shop-link'>Accessories</button>
                                    <i className='fas fa-angle-right'></i>
                                </li>
                                <li className='first'>
                                    <i className="fas fa-bullseye"></i>
                                    <button onClick={this.chooseProducts} aria-labelledby='ammunition' className='first-shop-link'>Ammunition</button>
                                    <i className='fas fa-angle-right'></i>
                                </li>
                            </ul>
                        </div>
                        <div className='second'>
                            <h1>Weapons</h1>
                            <ul>
                                <li><button onClick={this.chooseProducts} aria-labelledby='assaultRifles'>Assault Rifles</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='sniperRifles'>Sniper Rifles</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='handguns'>Handguns</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='shotguns'>Shotguns</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='revolvers'>Revolvers</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='grenadeLaunchers'>Grenade Launchers</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='machineguns'>Machineguns</button></li>
                            </ul>
                        </div>
                        <div className='second'>
                            <h1>Weapon Parts</h1>
                            <ul>
                                <li><button onClick={this.chooseProducts} aria-labelledby='grips'>Grips</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='optics'>Optics</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='suppressors'>Suppressors</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='silencers'>Silencers</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='stocks'>Stocks</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='batteries'>Batteries</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='magazines'>Magazines</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='bipods'>Bipods</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='lasers'>Lasers</button></li>
                            </ul>
                        </div>
                        <div className='second'>
                            <h1>Accessories</h1>
                            <ul>
                                <li><button onClick={this.chooseProducts} aria-labelledby='uniforms'>Uniforms</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='vests'>Vests</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='belts'>Belts</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='boots'>Boots</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='gloves'>Gloves</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='shades'>Shades</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='helmets'>Helmets</button></li>
                            </ul>
                        </div>
                        <div className='second'>
                            <h1>Ammunation</h1>
                            <ul>
                                <li><button onClick={this.chooseProducts} aria-labelledby='6mm'>6mm BS</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='8mm'>8mm BS</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='tracer'>Tracer BBS</button></li>
                                <li><button onClick={this.chooseProducts} aria-labelledby='0.12g'>0.12g BBS</button></li>
                            </ul>
                        </div >
                        <div className='shop-products-container'>
                            {
                                this.state.chosenProducts !== undefined ? <div className="popular-container">
                                    <div className="popular-items">
                                        {this.state.chosenProducts.map(product => {
                                            return <div className="popular-item" key={product._id}>
                                                <ProductCard name={product.name} rating={product.details.rating.$numberDecimal} price={product.details.price.$numberDecimal} _id={product._id} key={product._id} />
                                            </div>
                                        })}
                                    </div>
                                </div> : ''
                            }
                        </div>
                        {
                            this.state.pickedCategory !== undefined ? <div className='shop-filters'>
                                <h1>Filters</h1>
                                <select onChange={this.sort} className='sorting-options'>
                                    <option value='lowestToHighest'>Sort by lowest to highest</option>
                                    <option value='highestToLowest'>Sort by highest to lowest</option>
                                    <option value='rating'>Sort by rating</option>
                                </select>
                                {
                                    this.state.uniqueManufacturers !== undefined ?
                                        <React.Fragment>
                                            <h3>Manufacturer</h3>
                                            {this.state.uniqueManufacturers.map(manufacturer => {
                                                return <div key={manufacturer} className='manufacturer'>
                                                    <input type='checkbox' onChange={this.filter} aria-labelledby='manufacturer' value={manufacturer} />
                                                    <label>{manufacturer}</label>
                                                </div>
                                            })}
                                        </React.Fragment> : ''
                                }
                                {
                                    this.state.uniqueColors !== undefined ?
                                        <React.Fragment>
                                            <h3>Color</h3>
                                            {this.state.uniqueColors.map(color => {
                                                return <div key={color} className='manufacturer'>
                                                    <input type='checkbox' onChange={this.filter} aria-labelledby='color' value={color} />
                                                    <label>{color}</label>
                                                </div>
                                            })}
                                        </React.Fragment> : ''
                                }
                                {
                                    this.state.uniqueTypes !== undefined ?
                                        <React.Fragment>
                                            <h3>Type</h3>
                                            {this.state.uniqueTypes.map(type => {
                                                return <div key={type} className='manufacturer'>
                                                    <input type='checkbox' onChange={this.filter} aria-labelledby='type' value={type.toLowerCase()} />
                                                    <label>{type}</label>
                                                </div>
                                            })}
                                        </React.Fragment> : ''
                                }
                                {
                                    this.state.uniqueSizes !== undefined ?
                                        <React.Fragment>
                                            <h3>Size</h3>
                                            {this.state.uniqueSizes.map(size => {
                                                return <div key={size} className='manufacturer'>
                                                    <input type='checkbox' onChange={this.filter} aria-labelledby='accessorySize' value={size.toLowerCase()} key={size} />
                                                    <label>{size}</label>
                                                </div>
                                            })}
                                        </React.Fragment> : ''
                                }
                            </div> : ''
                        }
                    </div >
                </main >
                <Circle color='#e9e9e9' background='#383838' customLoading={this.state.loaded} />
            </React.Fragment >
        )
    }
}