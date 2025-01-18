<?php
header("Content-Type: application/json");
include_once 'accounts/fe.php';
//authenication token in the header and must be validated
if ($_SERVER['REQUEST_METHOD'] === 'POST') { 
    $verifybody = new class_fe_check_account_details();
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);
     $verifybody->verify_body_headers($data,function($response){
        echo $response;
     });
}else {
    http_response_code(400);//Bad Request
    echo json_encode(array("Error:3456-0002883774662992" => "Invalid request"));
}


?>

