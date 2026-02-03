// //one loader ,one caller
// const message = document.getElementById("message");
// const apiUrl = 'http://local.muslih.tech/api/v1.0/f/fiac/account/getAccountInformation/';

// //data for api

// var auth = 'auth';
//  function apiHandler(emailValue){
//     var emailV = emailValue;

//     const data = {
//         AUTH: auth,
//         account_number: String(emailV)
//       };
//     const requestOptions = {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     };
//   //in the future to become general fetch for the whole system
//         fetch(apiUrl, requestOptions)
//         .then(response => {
//           if (!response.ok) {
//             throw new Error('Network response was not ok');
//           }
//           return response.json();
//         })
//         .then(data => {
//             //callback the requesting form with the appropiate fetched data
//             apiResponse(data);
         
//         })
//         .catch(error => {
//           console.error
      
//       ('Error:', error);
//         });

//      };





// export default  apiHandler;