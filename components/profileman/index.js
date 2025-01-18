import { createBox } from "../profileBox/index.js";
// import { bottomsheetDashboard } from "../bottomsheet-modal/bottomsheet.js";
document.getElementById("profileimageHolder").addEventListener('click',()=>{
   createBox();
})

const deleteB = document.getElementById("delete");
const consentScreen = document.getElementById("consentScreen");
deleteB.addEventListener('click',()=>{
    consentScreen.classList.toggle("consentScreen-shown");
})