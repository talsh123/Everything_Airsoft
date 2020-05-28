import React, { Component } from 'react';

import brand1 from '../static/images/brand1.png';
import brand2 from '../static/images/brand2.png';
import brand3 from '../static/images/brand3.png';
import brand4 from '../static/images/brand4.png';
import brand5 from '../static/images/brand5.png';

export default class Footer extends Component {
    render() {
        return (
            <React.Fragment>
                <hr />
                <footer className="footer-container">
                    <h3>Companies We Work With</h3>
                    <div className="companies-container">
                        <div className="company-icons">
                            <a href='http://www.kjworks.com.tw/main.php'><img src={brand1} alt="brand" /></a>
                            <a href='https://www.fnherstal.com/'><img src={brand2} alt="brand" /></a>
                            <a href='https://store.kwausa.com/'><img src={brand3} alt="brand" /></a>
                            <a href='https://www.eliteforceairsoft.com/'><img src={brand4} alt="brand" /></a>
                            <a href='https://www.evike.com/brands/72/Double-Eagle/'><img src={brand5} alt="brand" /></a>
                        </div>
                    </div>
                    <h2>&copy; 2020 Everything Airsoft</h2>
                </footer>
            </React.Fragment>
        )
    }
}
