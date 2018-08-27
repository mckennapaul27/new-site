import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <>
   <div className="error-wrapper">
            <div className="err-wrap text-center">
                <img src="/assets/images/404.png" alt="error"/>
                <div>
                <Link to="/" className="back-home">Back to dashboard</Link>
                  
                </div>
            </div>
        </div>
     
  </>
);

export default NotFound;
