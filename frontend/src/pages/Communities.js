import React, { Component } from 'react';
import axios from 'axios';
import sweetalert from 'sweetalert2';
import Community from '../components/Community';
import { Circle } from 'react-preloaders';

import { connect } from 'react-redux';
import { toggleLogged, setShoppingCartInfo, updateAmount, removeItem, setUser } from '../actions/index';

class Communities extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            communities: [],
            loaded: false
        };
    }

    componentDidMount() {
        this._isMounted = true;
        axios.get('/communities/all').then(communities => {
            if (this._isMounted) {
                this.setState({
                    communities: communities.data
                });
            }
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

        if (this._isMounted)
            this.setState({
                loaded: true
            })
    }


    componentWillUnmount() {
        this._isMounted = false;
    }

    redirectToCreateCommunity = () => {
        if (this.props.logged)
            this.props.history.push('/createCommunity');
        else
            sweetalert.fire({
                toast: true,
                timer: 4000,
                timerProgressBar: true,
                title: `Must be logged in to create a new community!`,
                position: "bottom",
                icon: 'error',
                showConfirmButton: false,
                customClass: 'sweetalert'
            })
    }

    render() {
        return (
            <React.Fragment>
                <main>
                    <div className='communities-container'>
                        {
                            this.state.communities.map(community => {
                                return <Community community={community} key={community._id} />
                            })
                        }
                    </div>
                    <div className='create-community-container'>
                        <button className='create-community-button' onClick={this.redirectToCreateCommunity}>Create New Community</button>
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

export default connect(mapStateToProps, mapDispatchToProps())(Communities);