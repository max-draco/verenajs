<?php
header("Content-Type: application/json");
include_once 'fe.php';
include_once '../../../transactions.php';
//authenication token in the header and must be validated
if ($_SERVER['REQUEST_METHOD'] === 'POST') { 
    $verifybody = new class_fe_get_account_mpesa_transaction();
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);

     $verifybody->func_fe_get_account_mpesa_transaction($data,function($response){
        updateTransaction($response);
     });
}else {
    http_response_code(400);//Bad Request
    echo json_encode(array("Error:3456-0002883774662992" => "Invalid request"));
}

//  //needs a valid consent token
// function check_account_details($data,$callback) {
//     $jsonData = file_get_contents('php://input');
//     $data = json_decode($jsonData, true);
//     process_request($data,$callback);
// }

?>

