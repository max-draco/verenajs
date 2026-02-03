window.addEventListener("load", (event) => {
getTransactions();
});
const message = document.getElementById("message");
const apiUrl = 'https://local.muslih.tech/webstacks/api/internal/transactions/index.php';
const imageUrl = '././res/up-arrow.png';
const collapseUrl = '././res/arrow-down.png';
function getTransactions(){
  const data = {
    //imsi should be passed account number in international format
      imsi: 254,
    };
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };
//in the future to become general fetch for the whole system
      fetch(apiUrl, requestOptions)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => {
          //callback the requesting form with the appropiate fetched data
          createTransactionElement(data);
      })
      .catch(error => {
        console.error
    
    ('Error:', error);
      });

   };

   function createTransactionElement(data) {
    //prepare elements
    const wsBody = document.getElementById("wsBody");
    const wsBodyHeader = document.getElementById("wsBodyHeader").getBoundingClientRect();
    console.log(wsBodyHeader);
    const recenTransactions = document.createElement("div");
    const title = document.createElement("h1");
    const transactionHolder = document.createElement("div");
    const transactionNumberElement = document.createElement("table");
    recenTransactions.style.width = window.innerWidth + 'px';
    //react native bottom sheet like button
    const bottomsheetBtn = document.createElement("button");
    bottomsheetBtn.title = "expand"; 
    bottomsheetBtn.innerHTML = '<img src="' + imageUrl + '">';
    bottomsheetBtn.type = 'button';
    bottomsheetBtn.style.background = "white";
    bottomsheetBtn.style.color = "#4285F4";
    bottomsheetBtn.id = 'bottomsheetBtn';
    bottomsheetBtn.style.position = 'relative';
        //collapse btn
    const collapseBtn = document.createElement("button");
    collapseBtn.title = "collapse"; 
    collapseBtn.innerHTML = '<img src="' + collapseUrl + '">';
    collapseBtn.type = 'button';
    collapseBtn.style.display = 'none';
    collapseBtn.style.background = "white";
    collapseBtn.style.color = "#4285F4";
    collapseBtn.id = 'collapseBtn';
    collapseBtn.style.position = 'relative';

    //end of collapse btn
    bottomsheetBtn.addEventListener("click", ()=>{
      recenTransactions.style.padding = '0cm';
      recenTransactions.style.transitionDuration = "0.8s";
      recenTransactions.style.height = "calc(100% - " + (wsBodyHeader.bottom + 'px') + ")";
      recenTransactions.style.top = wsBodyHeader.bottom-recenTransactions.style.height+ 'px';
      recenTransactions.style.borderRadius = '0cm';
      recenTransactions.style.position = 'fixed';
     bottomsheetBtn.style.display = 'none';
     collapseBtn.style.display = 'flex';
    });
    collapseBtn.addEventListener("click", ()=>{
      recenTransactions.style.padding = '0cm';
      recenTransactions.style.transitionDuration = "0.8s";
      recenTransactions.style.bottom = 0;
      recenTransactions.style.height = "3cm";
      collapseBtn.style.display = 'none';
     bottomsheetBtn.style.display = 'flex';
    });


    // const transactionNumberElement = document.createElement("p");
    const transactionStatus = document.createElement("p");
    //set props
     title.innerText = "Quick Settings"
    recenTransactions.classList = 'recentTransactions';
    // recenTransactions.appendChild(title);
    // recenTransactions.appendChild(seeAllTransactions);
 // Define headers for your table
const headers = ['Transaction Number', 'Amount', 'Date','status'];

// Create header row
let headerRow = transactionNumberElement.insertRow();
headers.forEach(headerText => {
  let headerCell = document.createElement("th");
  headerCell.textContent = headerText;
  headerRow.appendChild(headerCell);
});







    transactionStatus.classList = 'transactionStatus';
    var parsed = JSON.parse(data);
    console.log(parsed);
   
    parsed.a.forEach((item) => {
        // Create a new row
  let row = transactionNumberElement.insertRow();

  // Create a cell in the row and set its value to the transaction number
  let cell = row.insertCell();
  cell.innerText = item.transactionumber;
      // transactionNumberElement.insertRow += item.transactionumber;
    });
     

    transactionStatus.style.color = 'green';

    // transactionNumberElement.innerText = transactionNumber;
    transactionStatus.innerText = "passed";

    transactionHolder.classList = 'transactionsHolder';
  recenTransactions.appendChild(bottomsheetBtn);
  recenTransactions.appendChild(collapseBtn);
  recenTransactions.appendChild(title);
  recenTransactions.appendChild(transactionHolder);
  transactionHolder.appendChild(transactionNumberElement);
  // transactionHolder.appendChild(transactionStatus);
  wsBody.appendChild(recenTransactions);
}

