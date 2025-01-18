<?php
include_once "./config/dbconfig/db.php";
class class_be_getuserinfo {
                function func_be_getuserinfo($payload,$callback){
                    $class_db_account_fetch = new class_be_db_account_fetch();
                    $statement = 'SELECT * FROM  accounts  WHERE email = :email ';
                    $email = $payload['userId'];
                    $params  = array('email' => $email);
                    $class_db_account_fetch -> func_be_db_account_fetch($statement,$params,$payload,$callback);
                }
                function generate_login_token($status,$db_response,$callback){
                    $decoded_db_response = json_decode($db_response);
                    $url_id = $decoded_db_response[0]->signatureid;
                    $exp = time() + 40;
                    $timestamp = time();
                    $header = [
                     'typ' => "url-check",
                     "alg" => "HS256",
                     'status' => $status,
                     'exp' => $exp
                    ];
                    $payload = [
                     'urlid' =>$url_id,
                    ];
                    $base64header =  str_replace(['+', '/', '='], ['', '', ''],base64_encode(json_encode($header)));
                    $base64payload =  str_replace(['+', '/', '='], ['', '', ''],base64_encode(json_encode($payload)));
                    $signature = hash_hmac('sha256', $base64header . "." . $base64payload, '**^$%#$@#FEWFewhgr3274y32gi2', true);
                    $base64signature = str_replace(['+', '/', '='], ['', '', ''], base64_encode($signature));
                    $url_token =  "$base64header.$base64payload.$base64signature";
                    if(is_callable($callback)) {                                          
                        call_user_func($callback,$url_token);
                        }else {
                           http_response_code(404);
                           echo json_encode(array("invalid callback" => "callback func failure" ));
                        }      
                }
    }
