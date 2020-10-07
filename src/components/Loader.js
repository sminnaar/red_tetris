import React from 'react'

const Loader = () => (
  <div className="loader">
    <style jsx>{`
      .loader {
        border: 25px solid grey; /* Light grey */
        border-top: 25px solid black; /* Blue */
        border-radius: 100%;
        width: 150px;
        height: 150px;
        animation: spin 3s linear infinite;
        margin-left: 42%;
        margin-right: 40%;
        margin-top: 17%;
        position: center;

      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      
    `}</style>
  </div>
)

export default Loader