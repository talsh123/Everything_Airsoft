import React from 'react';
import axios from 'axios';
import $ from 'jquery';
import sweetalert from 'sweetalert2';
import { Circle } from 'react-preloaders';

import carousel1 from '../static/images/carousel1.jpg';
import carousel2 from '../static/images/carousel2.jpg';
import carousel3 from '../static/images/carousel3.jpg';
import carousel4 from '../static/images/carousel4.jpg';
import carousel5 from '../static/images/carousel5.jpg';

import ProductCard from '../components/ProductCard';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class Home extends React.Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        // Component State
        this.state = {
            newArrivals: [],
            mostPopular: [],
            loaded: false
        }
    }

    componentDidMount = () => {
        this._isMounted = true;

        // Axios GET request to fetch all products, setting Redux products state and setting component newArrivals state
        // to the the last 15 products added to the database
        axios.get('/products/newArrivals').then(res => {
            if (this._isMounted) {
                this.setState({
                    newArrivals: res.data.slice(0, 14)
                });
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
        });

        // Axios GET request to fetch the top 10 rated products in the store
        axios.get('/products/popular').then(res => {
            if (this._isMounted) {
                this.setState({
                    mostPopular: res.data.slice(0, 12)
                })
            }
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

        // Carousel Next and Previous Buttons
        const nextButton = document.querySelector('.carousel-buttons .next-button');
        const prevButton = document.querySelector('.carousel-buttons .prev-button');
        // Carousel Container, Image Container and Indicator Container
        const carouselInner = document.querySelector('.carousel-inner .carousel-images');
        const carouselImages = document.querySelectorAll('.carousel-inner .carousel-images img');
        const carouselIndicators = document.querySelectorAll('.carousel-inner .carousel-indicators .indicator');
        // Carousel Caption
        const carouselCaption = document.querySelector('.carousel-caption');
        // Carousel Indicators Container
        const carouselIndicatorsContainer = document.querySelector('.carousel-indicators');
        // Carousel Buttons Container
        const carouselButtonsContainer = document.querySelector('.carousel-buttons');
        // Counter to keep track of which image the carousel is on
        let counter = 1;
        // Width size of the viewport at a certain moment
        let size;

        // Next Carousel Button Event Listener
        nextButton.addEventListener('click', () => {
            if (counter >= carouselImages.length - 1) return;
            size = carouselImages[0].clientWidth;
            carouselInner.style.transition = 'margin-left .5s ease-in-out';
            counter++;
            carouselInner.style.marginLeft = `-${size * counter}px`;
            let activeIndicator = document.querySelector('.carousel-inner .carousel-indicators label.active');
            activeIndicator.classList.remove('active');
            if (counter > carouselImages.length - 2) {
                carouselIndicators[0].classList.add('active');
            } else {
                carouselIndicators[counter - 1].classList.add('active');
            }
        });

        // Previous Carousel Button Event Listener
        prevButton.addEventListener('click', () => {
            if (counter < 1) return;
            size = carouselImages[0].clientWidth;
            carouselInner.style.transition = 'margin-left .5s ease-in-out';
            counter--;
            carouselInner.style.marginLeft = `-${size * (counter)}px`;
            let activeIndicator = document.querySelector('.carousel-inner .carousel-indicators label.active');
            activeIndicator.classList.remove('active');
            if (counter < 1) {
                carouselIndicators[carouselImages.length - 3].classList.add('active');
            } else {
                carouselIndicators[counter - 1].classList.add('active');
            }
        });

        // Resize Carousel Event Listener
        window.addEventListener('resize', () => {
            size = carouselImages[0].clientWidth;
            carouselInner.style.transition = 'margin-left 0s ease-in-out';
            carouselInner.style.marginLeft = `-${size * counter}px`;
        });

        // Transition End Event Listener, important for images to loop in carousel
        window.addEventListener('transitionend', (e) => {
            if (carouselImages[counter].id === 'first-clone' && e.propertyName === 'margin-left') {
                carouselInner.style.transition = 'margin-left 0s ease-in-out';
                size = carouselImages[0].clientWidth;
                carouselInner.style.marginLeft = `-${size}px`;
                counter = 1;
            }
            if (carouselImages[counter].id === 'last-clone' && e.propertyName === 'margin-left') {
                carouselInner.style.transition = 'margin-left 0s ease-in-out';
                size = carouselImages[0].clientWidth;
                carouselInner.style.marginLeft = `-${(carouselImages.length - 2) * size}px`;
                counter = 5;
            }
        });

        // Event Listener set on each indicator
        $('.carousel-inner .carousel-indicators .indicator').on('click', (e) => {
            carouselInner.style.transition = 'margin-left .5s ease-in-out';
            let activeIndicator = document.querySelector('.carousel-inner .carousel-indicators label.active');
            activeIndicator.classList.remove('active');
            e.target.classList.add('active');
            size = carouselImages[0].clientWidth;
            carouselInner.style.marginLeft = `-${(size * e.target.dataset.num)}px`;
            counter = parseInt(e.target.dataset.num);
        });

        // Scroll event Handler, handles parallax effect on carousel and opacity change on carousel caption 
        window.addEventListener('scroll', function () {
            if (window.scrollY < 690) {
                carouselInner.style.transform = `translate3d(0px, ${window.scrollY * 0.2}px, 0px)`;
                carouselCaption.style.transform = `translate3d(0px, ${window.scrollY * (0.4)}px, 0px)`;
                carouselIndicatorsContainer.style.transform = `translate3d(0px, ${-window.scrollY * -0.02}px, 0px)`;
                carouselButtonsContainer.style.transform = `translate3d(0px, ${window.scrollY * 0.52}px, 0px)`;
            }
            if ($(".carousel-caption").css("opacity") >= 0 && window.scrollY < 700)
                $(".carousel-caption").css("opacity", 1 - $(window).scrollTop() / 600);
            else
                $(".carousel-caption").css("opacity", 0);
        });

        // This code makes sure carousel is set to the correct initial position
        carouselInner.style.transition = 'margin-left 0s ease-in-out';
        carouselInner.style.marginLeft = `-${carouselImages[0].clientWidth}px`;

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }

    componentDidUpdate() {
        // This code makes sure carousel is set to the correct initial position
        const carouselInner = document.querySelector('.carousel-inner .carousel-images');
        const carouselImages = document.querySelectorAll('.carousel-inner .carousel-images img');
        carouselInner.style.transition = 'margin-left 0s ease-in-out';
        carouselInner.style.marginLeft = `-${carouselImages[0].clientWidth}px`;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            // Home Page
            <React.Fragment>
                <main>
                    <div className="carousel-inner">
                        <div className="carousel-images">
                            <img src={carousel5} id="last-clone" alt="Carousel" />
                            <img src={carousel1} alt="Carousel" />
                            <img src={carousel2} alt="Carousel" />
                            <img src={carousel3} alt="Carousel" />
                            <img src={carousel4} alt="Carousel" />
                            <img src={carousel5} alt="Carousel" />
                            <img src={carousel1} id="first-clone" alt="Carousel" />
                        </div>
                        <div className="carousel-buttons">
                            <label className="carousel-button prev-button">&lt;</label>
                            <label className="carousel-button next-button">&gt;</label>
                        </div>
                        <div className="carousel-indicators">
                            <label className="indicator active" data-num="1"></label>
                            <label className="indicator" data-num="2"></label>
                            <label className="indicator" data-num="3"></label>
                            <label className="indicator" data-num="4"></label>
                            <label className="indicator" data-num="5"></label>
                        </div>
                        <div className="carousel-caption">
                            <h1>Coordinate. Triumph.<br />Experience Greatness.</h1>
                            <h3>Everything About The Airsoft Sport</h3>
                        </div>
                    </div>
                    <hr />
                    <div className="new-arrivals-container">
                        <h2>New Arrivals</h2>
                        <div className="new-arrivals-items">
                            {this.state.newArrivals.map(newArrivalItem => {
                                return <div className="new-arrival" key={newArrivalItem._id}>
                                    <ProductCard name={newArrivalItem.name} rating={newArrivalItem.details.rating.$numberDecimal} price={newArrivalItem.details.price.$numberDecimal} _id={newArrivalItem._id} key={newArrivalItem._id} />
                                </div>
                            })}
                        </div>
                    </div>
                    <hr />
                    <div className="popular-container">
                        <h2>Most Popular</h2>
                        <div className="popular-items">
                            {this.state.mostPopular.map(mostPopularItem => {
                                return <div className="popular-item" key={mostPopularItem._id}>
                                    <ProductCard name={mostPopularItem.name} rating={mostPopularItem.details.rating.$numberDecimal} price={mostPopularItem.details.price.$numberDecimal} _id={mostPopularItem._id} key={mostPopularItem._id} />
                                </div>
                            })}
                        </div>
                    </div>
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

export default connect(mapStateToProps, mapDispatchToProps())(Home);