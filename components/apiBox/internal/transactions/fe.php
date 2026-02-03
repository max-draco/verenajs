<?php
header("Content-Type: application/json");
include_once 'be.php';
class class_fe_get_account_mpesa_transaction {
function func_fe_get_account_mpesa_transaction($data,$callback) {
    if ($data !== null ) {
        if (isset($data['imsi'])) {

            //create object of the api endpoint class
            $checkaccountdetails = new class_be_get_account_mpesa_transaction();
            $accountnumber = $data['imsi'];
            $checkaccountdetails -> func_be_get_account_mpesa_transaction($accountnumber,$callback);
        } else {
            http_response_code(400); // Bad Request
            echo json_encode(array("404" => "Invalid request. Missing client_id or client_secret,this ip will be blocked after 3 attempts."));
        } 
    }else {
        http_response_code(400); // Bad Request
        echo json_encode(array("Error:0001-0002" => "Null data"));
    }
    }
}
