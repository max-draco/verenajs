<?php
//returns only account details no update
include_once  '../config/config.php';  
    class connection {
        function connect($statement,$params,$callback) {
            $config = new db_config;
            $dsn = 'pgsql:host ='. $config->host .';dbname='.$config->database;
            $sql = new PDO($dsn , $config->username,$config->password);
            $sql->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_WARNING);
                $realStatement = $statement;
                $stmnt = $sql ->prepare($statement);
                $stmnt->execute($params);
                $response = $stmnt->fetchAll(PDO::FETCH_OBJ);
                $sql ->prepare($realStatement);
                $count = $stmnt -> rowCount();
                if($count > 1) {
                    foreach($response as $data) {
                        $responseJson[] = $data;
                    }
                    $responseData = json_encode(array("a"=>$responseJson));
                    //forward the data 
                    if(is_callable($callback)) {                                          
                        call_user_func($callback,$responseData);
                        }else {
                           http_response_code(404);//not found
                           echo json_encode(array("invalid callback" => "callback func failure" ));
                        }
                        

                }else {
                    echo json_encode(array("invalid account" => "Transactions not found" ));
                }      
        }
    }
class class_be_get_account_mpesa_transaction {
    //imsi of resource owner
            function func_be_get_account_mpesa_transaction($imsi,$callback){
                $connection = new connection();
                $statement = 'SELECT transactionumber FROM  transactions WHERE imsi = :imsi';
                $params  = array(':imsi' => $imsi);
                $connection -> connect($statement,$params,$callback);
            }
}




// class be_client_operations {
//      function be_client_status_update($client_id,$client_secret,$cl_status,$callback) {
//         $connection = new connection();
//         $statement = 'UPDATE preauth SET client_status=:cl_status  WHERE client_id=:cl_id AND client_secret=:cl_secret';
//         $params = array(':cl_id' => $client_id,':cl_secret'=>$client_secret,':cl_status'=>$cl_status);
//         $connection -> connect($statement,$params,$callback);
//      }
//      function be_client_trials_update($client_id,$client_secret,$trials,$callback) {
//         $connection = new connection();
//         $statement = 'UPDATE preauth SET trials=:trials WHERE client_id=:cl_id AND client_secret=:cl_secret';
//         $params = array(':cl_id' => $client_id,':cl_secret'=>$client_secret,':trials'=>$trials);
//         $connection -> connect($statement,$params,$callback);
//      }
//      //generate token  

//      function generate_preauth($data,$callback){
//         $client_id = $data[0]->client_id;
//         $client_name = $data[0]->client_name;
//         $trials =$data[0]->trials;
//         $client_status=$data[0]->client_status;
//         $exp = time()+10;
//         $timestamp = time();
//         $header = [
//          'typ' => "preauth",
//          "alg" => "HS256",
//          'status' => $client_status,
//          'exp' => $exp,
//          'timestamp' => $timestamp,
//         ];

//         $payload = [
//             'client-id' => $client_id,
//             'client-name' => $client_name,
//             'role' => 'admin'
//         ];
//         $base64header =  str_replace(['+', '/', '='], ['', '', ''],base64_encode(json_encode($header)));
//         $base64payload =  str_replace(['+', '/', '='], ['', '', ''],base64_encode(json_encode($payload)));
//         $signature = hash_hmac('sha256', $base64header . "." . $base64payload, '**^$%#$@#FEWFewhgr3274y32gi2', true);
//         $base64signature = str_replace(['+', '/', '='], ['', '', ''], base64_encode($signature));
//         $preauth_token =  "$base64header.$base64payload.$base64signature";
//         if(is_callable($callback)) {                                          
//             call_user_func($callback,$preauth_token);
//             }else {
//                http_response_code(404);
//                echo json_encode(array("invalid callback" => "callback func failure" ));
//             }
            
//     }
// }


