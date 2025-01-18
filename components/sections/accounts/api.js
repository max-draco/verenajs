// const message = document.getElementById("message");
// const spinner = document.getElementById("spinner");

// const apiUrl = 'https://local.muslih.tech/webstacks/api/internal/';
// function getAccountDetails(){
//     const data = {
//         "accountnumber": "2214092938"
//       };
//     const requestOptions = {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(data),
//     };
//     spinner.style.display = 'flex';

//   //in the future to become general fetch for the whole system
//         fetch(apiUrl, requestOptions)
//         .then(response => {
          
//           if (!response.ok) {
//             throw new Error('Network response was not ok');
//           }
//           spinner.style.display = 'flex';
//           return response.json();
//         })
//         .then(data => {
//           spinner.style.display = 'none';
//             updatebalance(data);         
//         })
//         .catch(error => {
//           console.error
//           spinner.style.display = 'none';
//           // alert(error);
//       ('Error:', error);
//         });

//      };
//      //fields to be updated
// function updatebalance(data) {
//   const balance = document.getElementById("balance");
//   const accountnumber = document.getElementById("accountnumber");
//   const accountname = document.getElementById("accountname");
//   // $decoddata = JSON.parse(data);
//     var balancedata =data.data['balance'];
//     var accountnamedata =data.data['profilename'];
//     var accountnumberdata =data.data['account_number'];
//     balance.innerText = balancedata;
//     accountname.innerText = accountnamedata;
//     accountnumber.innerText = accountnumberdata;

// }

//      export default getAccountDetails();