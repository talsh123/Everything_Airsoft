import React, { Component } from 'react';
import axios from 'axios';
import cloudinary from 'cloudinary-core';
import RatingStars from 'react-rating';
import Rating from '../components/Rating';
import sweetalert from 'sweetalert2';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class ProductDetails extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            product: undefined,
            loaded: false
        }
    }

    componentDidMount() {
        this._isMounted = true;

        axios.get(`/products/get/${this.props.history.location.pathname.split('/')[3]}`).then(product => {
            if (this._isMounted)
                this.setState({
                    product: product.data,
                });
        })

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    formatMainCategory = () => {
        switch (this.state.product.mainCategory) {
            case 'weapon':
                return 'Weapon';
            case 'weaponPart':
                return 'Weapon Part';
            case 'accessory':
                return 'Accessory';
            case 'ammunition':
                return 'Ammunition';
            default:
                return '';
        }
    }

    formatSecondaryCategory = () => {
        switch (this.state.product.secondaryCategory) {
            case 'assaultRifles':
                return 'Assault Rifle';
            case 'sniperRifles':
                return 'Sniper Rifle';
            case 'shotguns':
                return 'Shotgun';
            case 'handguns':
                return 'Handguns';
            case 'revolvers':
                return 'Revolver';
            case 'machineguns':
                return 'Machine Gun';
            case 'grenadeLaunchers':
                return 'Grenade Launcher';
            case 'gloves':
                return 'Gloves';
            case 'vests':
                return 'Vest';
            case 'helmets':
                return 'Helmet';
            case 'uniforms':
                return 'Uniform';
            case 'belts':
                return 'Belts';
            case 'boots':
                return 'Boots';
            case 'shades':
                return 'Shades';
            case 'grips':
                return 'Grip';
            case 'optics':
                return 'Optic';
            case 'suppressors':
                return 'Suppressor';
            case 'silencers':
                return 'Silencers';
            case 'stocks':
                return 'Stock';
            case 'batteries':
                return 'Batteries';
            case 'magazines':
                return 'Magazine';
            case 'bipods':
                return 'Bipod';
            case 'lasers':
                return 'Laser';
            case '6mm':
                return '6mm BBS';
            case '8mm':
                return '8mm BBS';
            case 'tracer':
                return 'Tracer BBS';
            case '0.12g':
                return '0.12 BBS';
            default:
                return '';
        }
    }

    formatType = () => {
        switch (this.state.product.details.type) {
            case 'electric':
                return 'Electric';
            case 'spring':
                return 'Spring';
            case 'gas':
                return 'Gas';
            default:
                return '';
        }
    }

    getManufacturerInfo = () => {
        switch (this.state.product.details.manufacturer) {
            case 'AW Custom':
                return "While the world around us has moved to less demanding production techniques, AW Custom has stayed true to its original values based on craftsmanship and quality, that is why AW Custom products are able to last a lifetime. We are the keepers of a culture's ancient craft, a symbol of the airsoft gun maker's desire to stay true to tradition. Each stage of the process: from manufacturing to finishing, is a specialized skill that takes time and careful attention.";
            case '6mmProShop':
                return 'Established in 2011, 6mmProShop Inc. is a USA based manufacturer and distributor with a mission to bring law enforcement training, Airsoft sporting events, and military simulation to the next level. 6mmProShop features exclusive licensed products, unique innovations, and distribution rights of many exciting products from Japan, Europe, South America, and Asia. With headquarters located in the USA, 6mmProShop offers unmatched product support, inventory availability for resellers, and worldwide exclusive products!';
            case 'SRC':
                return 'SRC, which is short for Starrainbow Company, was founded in Taiwan back in 1993. It first started out as a wholesaling company focusing on supplying the domestic toy market. SRC distributed many popular brands from all over the world including scale models. SRC developed by that a very strong position in the market. Because of the ever growing interest in Airsoft throughout the globe, SRC decided to start selling imported Airsoft Guns. In the same time plans of starting in house manufacturing of Airsoft guns. The step from being a sales company to becoming a producing company is a major leap that involves huge investments. But the aim was clear, to become one of the world’s best Airsoft producers.'
            case 'ASG':
                return 'ActionSportGames is a worldwide leader in the business of replica firearms and accessories manufacturing – including Airsoft guns, Airguns, CO2 guns and firearms replicas. We specialize in 1:1 scale replica guns and accessories for fun, action, sports, entertainment and collection. Today were proud to be recognized as the innovator and manufacturer of the CZ EVO3 A1 AEG and having introduced several Airsoft versions of this popular Airsoft gun to the market.One of our goals is to become the preferred supplier in the firearms replica business through worldwide license agreements, quality brands and premium service – before, during and after sales.';
            case 'Cybergun':
                return 'Cybergun is the world leader in designing and distributing replica dummy weapons for video game aficionados, sport or outdoor shooting, and collectors.';
            case 'PTS':
                return 'When it comes to training, simulation, and the ultimate experience, theres PTS and then theres everyone else. With RDT&E (Research, Development, Test & Evaluation) Teams in both USA and Asia and using the best materials and manufacturing processes, PTS Syndicate is committed to bringing the highest quality and most innovative products onto the market to meet and exceed the exacting standards of the most discriminating end user. PTS is also a prolific exclusive licensee of the latest and greatest products in the tactical market. We have an excellent reputation as a trusted license partner that works closely with our licensors to extend awareness of their brands into a new market space.';
            case 'Angel Custom':
                return 'Angel Custom was founded on a mission to promote satisfaction and excitement on the Airsoft battlefield. Founded by Airsofters searching for perfections, it is our joy and pride to present you our battle tested creations. We strive to provide quality products and services that are reliable and trustworthy to be worthy of the trust placed in us.';
            case 'Condor':
                return "Condor Outdoor founds its beginnings early on as a camping goods manufacturer. The earlier days of the company were more focused on getting people out into nature and experiencing the wonder of the outdoors. As our product line expanded, the demand for function focused gear instead of general storage became more prevalent and as the War on Terror started we could not keep up with the demand for our products.Our quality and price of the 3-day Assault Pack drew so much attention that it became the heart of our tactical product line. From here we've expanded from camping vests to tactical vests, and expanding the product offering to equip warfighters, law enforcement, and hunters with quality and affordable gear.";
            case 'CYMA':
                return 'CYMA is among the oldest, most experienced and the largest Airsoft manufacturing facility in the world. Known for their unmatched quality control and professionalism, CYMA is selected to be the OEM of a vast amount of Airsoft products. Durability and performance meets affordability!';
            case 'Evike Exclusive':
                return 'Evike Exclusive provides superior outdoor recreational products. That is why we develop, innovate, and pioneer to bring you the perfect experience, service, and products.';
            case 'Matrix':
                return 'Established in 2001 for Airsofters by Airsofters. Team Matrix thrive on the vision to better the sport of Airsoft with affordable high quality Airsoft equipment. With decades of experiences as Airsoft enthusiasts ourselves, we live, sleep, and breathe Airsoft. Matrix offers a wide selection of skirmish grade replicas from rifles to pistols, a wide variety of accessories, and tactical equipment from helmets to boots. It is the Matrix mission to prepare every Airsoft shooter the perfect experience!';
            case 'EMG':
                return "The EMG vision is to manufacture products the world has never seen before; products we would put our name on, and products that hit the spot! EMG (Evike Manufacturing Group) was spawned from the realization that if you want something done exactly the way you want it, you need to do it yourself, and we did just that. We took our 16 years of knowledge as the market's lead retailer, our network of 300+ superior manufacturers, to work with inspiring top innovators in the firearms industry. That combined with the vision to invest into the Airsoft industry, an industry we believe in, EMG was born.";
            case 'Madbull':
                return "MAD BULL Airsoft, established in 2004, is world famous for it's Airsoft accessories. Our major focus points are: Airsoft guns, Airsoft Toy Launchers, Airsoft Toy B.B. Showers, and Upgrade kits.We have a very strong R&D team and we put a lot of effort in designing new and exciting new products for the airsoft community.";
            case 'ICS':
                return 'ICS follows the market demand and has globalization and localization strategies. Local distributors, wholesalers, or dealers are our distribution channels to ensure our best products and best services can be delivered to the end users. We expect ourselves to be the market leader to explore and create the market.We take care of our brand and good will by constantly improving first tier R&D, middle tier production quality, and the last tier marketing capabilities. ICS keeps expanding the quality and quantity of R&D teams. Our product lines will be more and more completed by our excellent innovative and developing capabilities. All of these make ICS the best Taiwan made AEG brand in every aspect.';
            default:
                return undefined;
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    rerender = () => {
        this.forceUpdate();
    }

    // Adds the selected product to the cart items redux state
    // If the item exists in the cart, the item's amount in the cart will increment by 1
    addToCart = () => {
        if (this._isMounted) {
            this.props.setShoppingCartInfo({
                _id: this.state.product._id,
                name: this.state.product.name,
                price: this.state.product.details.price.$numberDecimal,
                amount: 1
            });
        }
    }

    checkIfUserPurchasedProduct = () => {
        if (this.props.logged === false) {
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Must be logged in to review this item!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
        } else {
            axios.get(`/orders/getOrders/${this.props.user.userId}`).then(orders => {
                let boolean = false;
                orders.data.forEach(order => {
                    order.items.forEach(item => {
                        if (item._id === this.props.history.location.pathname.split('/')[3])
                            boolean = true;
                    })
                })
                if (boolean === true)
                    this.props.history.push(`/shop/${this.props.history.location.pathname.split('/')[3]}/rate`);
                else {
                    sweetalert.fire({
                        toast: true,
                        timer: 4000,
                        timerProgressBar: true,
                        title: `Must purchase this item before rating it!`,
                        position: "bottom",
                        icon: 'error',
                        showConfirmButton: false,
                        customClass: 'sweetalert'
                    })
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }

    render() {
        const cloudinaryCore = new cloudinary.Cloudinary({ cloud_name: 'everythingairsoft' });
        return (
            <React.Fragment>
                <main>
                    {
                        this.state.product !== undefined ? <React.Fragment>
                            <div className='product-details-container'>
                                <div className='product-img-container'>
                                    <img src={cloudinaryCore.url(`${this.state.product._id}`)} alt={this.state.product.name} />
                                </div>
                                <div className='product-info-container'>
                                    <h1>{this.state.product.name}</h1>
                                    <div className='rating-desc'>
                                        <RatingStars readonly className='stars' emptySymbol='far fa-star' fullSymbol='fas fa-star' fractions={10} start='0' stop='5' initialRating={this.state.product.details.rating.$numberDecimal} />
                                        <h3>{this.state.product.details.ratings.length} ratings</h3>
                                    </div>
                                    <h1 className='price-container'>Price: <span className='price'>&#8362;{this.state.product.details.price.$numberDecimal}</span></h1>
                                    <div className='details'>
                                        <h4>Category: {this.formatMainCategory()}</h4>
                                        <h4>Type: {this.formatSecondaryCategory()}</h4>
                                        {
                                            this.state.product.details.ratings.length >= 0 ? <h4>Available: {this.state.product.details.numInStock} in stock</h4> : <h4>This item is out of stock</h4>
                                        }
                                        <ul>
                                            {/* Non-optional */}
                                            <li><span>Material:</span> {this.state.product.details.material}</li>
                                            <li><span>Color:</span> {this.state.product.details.color}</li>
                                            <li><span>Manufacturer:</span> {this.state.product.details.manufacturer}</li>
                                            {/* Optional */}
                                            {
                                                this.state.product.mainCategory === 'weapon' ? <React.Fragment>
                                                    <li><span>Weight:</span> {this.state.product.details.weight} kg</li>
                                                    <li><span>FPS Range:</span> {this.state.product.details.fps}</li>
                                                    <li><span>Type:</span> {this.formatType()}</li>
                                                    <li><span>Weapon Length:</span> {this.state.product.details.weaponLength} mm</li>
                                                </React.Fragment> : ''
                                            }
                                            {
                                                this.state.product.details.magCapacity ? <li><span>Magazine Capacity:</span> {this.state.product.details.magCapacity} rounds</li> : ''
                                            }
                                            {
                                                this.state.product.details.innerBarrelLength ? <li><span>Inner Barrel Length:</span> {this.state.product.details.innerBarrelLength} mm</li> : ''
                                            }
                                            {
                                                this.state.product.details.accessorySize ? <li><span>Size:</span> {this.state.product.details.accessorySize.toUpperCase()}</li> : ''
                                            }
                                            {
                                                this.state.product.details.ammunitionSize ? <li><span>Type:</span> {this.state.product.details.ammunitionSize}</li> : ''
                                            }
                                            {
                                                this.state.product.details.ammunitionQuantity ? <li><span>Quantity:</span> {this.state.product.details.ammunitionQuantity} Pellets</li> : ''
                                            }
                                        </ul>
                                        <br />
                                        {
                                            this.getManufacturerInfo() !== undefined ? <React.Fragment>
                                                <h4>About The Manufacturer:</h4>
                                                <p>{this.getManufacturerInfo()}</p>
                                            </React.Fragment> : ''
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className='buttons-container'>
                                <button className='review-button' onClick={this.checkIfUserPurchasedProduct}>Review Product</button>
                                <button onClick={this.addToCart}>Add To Cart</button>
                            </div>
                            <div className='ratings-container'>
                                {
                                    this.state.product.details.ratings.map(rating => {
                                        return <Rating key={rating} rerenderParent={this.rerender} rating={rating} />
                                    })
                                }
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

export default connect(mapStateToProps, mapDispatchToProps())(ProductDetails);