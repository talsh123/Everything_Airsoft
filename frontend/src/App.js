// React Imports & Other Imports
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// Page Imports
import Home from './pages/Home';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import MyPurchases from './pages/MyPurchases';
import AddProduct from './pages/AddProduct';
import ManageProducts from './pages/ManageProducts';
import UpdateProduct from './pages/UpdateProduct';
import UpdateProfile from './pages/UpdateProfile';
import ManageUsers from './pages/ManageUsers';
import Communities from './pages/Communities';
import CreateCommunity from './pages/CreateCommunity';
import CommunityDetails from './pages/CommunityDetails';
import CreatePost from './pages/CreatePost';
import ProductDetails from './pages/ProductDetails';
import RateProduct from './pages/RateProduct';
import Shop from './pages/Shop';
import EmailVerification from './pages/EmailVerification';
import OrderDetails from './pages/OrderDetails';
// Component Imports
import NavBar from './components/NavBar';
import ShoppingCart from './components/ShoppingCart';
import Footer from './components/Footer';
// Stylesheet Imports
import './static/stylesheet.css';
import sweetalert from 'sweetalert2';

import Cookies from 'js-cookie';
import axios from 'axios';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from './actions/index';

class App extends React.Component {
  _isMounted = false;
  INACTIVE_USER_TIME_THRESHOLD = 300000;
  USER_ACTIVITY_THROTTLER_TIMEOUT = 5000;

  userActivityTimeout = null;

  userActivityThrottlerTimeout = setTimeout(() => {
    this.resetUserActivityTimeout();

    clearTimeout(this.userActivityThrottlerTimeout);
    this.userActivityThrottlerTimeout = null;
  }, this.USER_ACTIVITY_THROTTLER_TIMEOUT)

  resetUserActivityTimeout = () => {
    clearTimeout(this.userActivityTimeout);
    this.userActivityTimeout = setTimeout(() => {
      this.signOut();
    }, this.INACTIVE_USER_TIME_THRESHOLD)
  }

  userActivityThrottler = () => {
    if (!this.userActivityThrottlerTimeout) {
      this.userActivityThrottlerTimeout = setTimeout(() => {
        this.resetUserActivityTimeout();

        clearTimeout(this.userActivityThrottlerTimeout);
        this.userActivityThrottlerTimeout = null;
      }, this.USER_ACTIVITY_THROTTLER_TIME);
    }
  }

  componentDidMount() {
    this._isMounted = true;

    // Session Activity Tracking
    window.addEventListener('mousemove', this.userActivityThrottler);
    window.addEventListener('scroll', this.userActivityThrottler);
    window.addEventListener('keydown', this.userActivityThrottler);
    window.addEventListener('resize', this.userActivityThrottler);

    // Session Creation & Continuation Logic
    const sessionId = Cookies.get('sessionId');
    if (sessionId !== undefined) {
      if (window.location.pathname.includes('key=') === false && window.location.pathname.includes('userId=') === false)
        axios.get('https://api.ipify.org?format=json').then(res => {
          axios.get(`/sessions/getSession/${sessionId}/${res.data.ip}`).then(session => {
            if (session.data)
              axios.get(`/users/getUserById/${session.data.userId}`).then(user => {
                if (user.data) {
                  this.props.toggleLogged();
                  this.props.setUser({
                    userId: user.data._id,
                    username: user.data.username,
                    hash: user.data.hash,
                    email: user.data.email,
                    isVerified: user.data.isVerified,
                    isAdmin: user.data.isAdmin
                  });
                }
              })
            else {
              Cookies.remove('sessionId');
            }
          })
        })
    } else {
      sweetalert.fire({
        toast: true,
        timer: 10000,
        timerProgressBar: true,
        title: `By continuing to navigate this site, you accept the use of cookies by Everything Airsoft and it's partners!`,
        position: "bottom",
        icon: 'warning',
        showConfirmButton: false,
        customClass: 'sweetalert'
      })
    }
  }

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
      title: `Session has timed out. We have logged you out!`,
      position: "bottom",
      icon: 'warning',
      showConfirmButton: false,
      customClass: 'sweetalert'
    })
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    return (
      // Main App Component
      <Router>
        <NavBar admin={this.props.user.isAdmin} verified={this.props.user.isVerified} />
        <ShoppingCart admin={this.props.user.isAdmin} verified={this.props.user.isVerified} />
        <Switch>
          <Route exact path='/' component={Home} />
          <Route path='/contact' component={Contact} />
          <Route path='/communities' exact component={Communities} />
          <Route path='/communities/:communityId/createPost' component={CreatePost} />
          <Route path='/communities/:communityId' component={CommunityDetails} />
          <Route path='/createCommunity' component={CreateCommunity} />
          <Route path='/signIn' component={SignIn} />
          <Route path='/signUp' component={SignUp} />
          <Route exact path='/shop/view/:productId' component={ProductDetails} />
          <Route exact path='/shop' component={Shop} />
          <Route exact path='/shop/:productId/rate' component={RateProduct} />
          <Route path='/addProduct' component={AddProduct} />
          <Route path='/manageProducts' component={ManageProducts} />
          <Route path='/updateProfile' component={UpdateProfile} />
          <Route path='/updateProduct/:productId' component={UpdateProduct} />
          <Route path='/manageUsers' component={ManageUsers} />
          <Route exact path='/myPurchases' component={MyPurchases} />
          <Route exact path='/myPurchases/:orderId' component={OrderDetails} />
          <Route path='/emailVerification' component={EmailVerification} />
        </Switch>
        <Footer />
      </Router>
    );
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

export default connect(mapStateToProps, mapDispatchToProps())(App);