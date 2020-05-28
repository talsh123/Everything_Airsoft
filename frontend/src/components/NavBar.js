import React, { Component } from 'react';
import sweetalert from 'sweetalert2';
import { Link } from 'react-router-dom';

import EverythingAirsoftLogoWhite from '../static/images/EverythingAirsoftLogoWhite.png';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class NavBar extends Component {
    _isMounted = false;

    signOut = () => {
        this.props.setUser({
            userId: undefined,
            address: undefined,
            email: undefined,
            hash: undefined,
            isAdmin: undefined,
            isVerified: undefined
        });
        this.props.toggleLogged();
        sweetalert.fire({
            toast: true,
            timer: 4000,
            timerProgressBar: true,
            title: `You have been logged out!`,
            position: "bottom",
            icon: 'success',
            showConfirmButton: false,
            customClass: 'sweetalert'
        })
    }

    componentDidMount() {
        this._isMounted = true;
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            // Navigation Menu
            <React.Fragment>
                <header>
                    <div className='logo-container'>
                        <Link to='/'><img src={EverythingAirsoftLogoWhite} alt="EverythingAirsoft Logo" /></Link>
                    </div>
                    <nav className="navigation">
                        <div className="nav-item">
                            <Link to='/'><button>Home</button></Link>
                        </div>
                        <div className="nav-item">
                            <Link to='/shop'><button>Shop</button></Link>
                        </div>
                        <div className="nav-item">
                            <Link to='/contact'><button>Contact</button></Link>
                        </div>
                        <div className="nav-item">
                            <Link to='/communities'><button>Communities</button></Link>
                        </div>
                        {
                            this.props.user.isAdmin === true ?
                                <React.Fragment>
                                    <div className="nav-item">
                                        <Link to='/addProduct'><button>Add Product</button></Link>
                                    </div>
                                    <div className="nav-item">
                                        <Link to='/manageProducts'><button>Manage Products</button></Link>
                                    </div>
                                    <div className="nav-item">
                                        <Link to='/manageUsers'><button>Manage Users</button></Link>
                                    </div>
                                </React.Fragment> : ''
                        }
                    </nav>
                    <div className='user-links-container'>
                        {this.props.logged === false ?
                            <Link to='/signIn'><button>Sign In</button></Link>
                            : <React.Fragment>
                                <Link to='/myPurchases'><button>My Purchases</button></Link>
                                <Link to='/'><button onClick={this.signOut}>Sign Out</button></Link>
                                <Link to='/updateProfile'><button>Update Profile</button></Link>
                            </React.Fragment>}
                    </div>
                </header>
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

export default connect(mapStateToProps, mapDispatchToProps())(NavBar);