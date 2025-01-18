<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
 include_once  'config.php';  
 //no update  
 //env loads
// Function to load environment variables from a .env file
class class_be_db_envylod{
  function loadEnv($filePath) {
    if (!file_exists($filePath)) {
        throw new Exception("Environment file not found: $filePath");
    }
    $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue; // Skip empty lines and comments
        }
  
        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) {
            continue; // Skip lines that don't contain exactly one '='
        }
  
        $key = trim($parts[0]);
        $value = trim($parts[1], "\"'"); // Remove surrounding quotes if any
  
        if ($key === '' || $value === '') {
            continue; // Skip if either key or value is empty
        }
  
        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
  }
  
}
 //
    class class_be_db_account_fetch{
      private $class_callback;
      private $password;
        function func_be_db_account_fetch($statement,$params,$payload,$callback) {
          $this->class_callback = $callback;
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
                if($count === 1) {
                    $real_db_response = $response;
                    //return all data in raw non-encrypted json
                    $payload = [
                      'accountNumber' => $real_db_response[0]->account_number,
                      'accountImsi' => $real_db_response[0]->account_imsi,
                      'userId' =>$real_db_response[0]->email,
                      'accountStatus' => $real_db_response[0]->accountstatus
                    ];
                    $api_endpoint_status_code = 1;
                        $db_response = json_encode(array("responseCode" =>$api_endpoint_status_code,"data" =>$payload));
                        if(is_callable($callback)) {
                          call_user_func($callback,$db_response);
                          }else {
                             http_response_code(404);//not found
                             echo json_encode(array("invalid callback" => "404/callback not found" ));
                          }
                }else {
                  $api_endpoint_status_code = 0;//true 9 - jwt generated 
                  $payload = [
                    'message' => 'account not found',
                    'timestamp' => time(),
                    ];
                  $db_response = json_encode(array('response'=>array('responseCode'=>$api_endpoint_status_code,'payload'=>$payload)));
                    http_response_code(404);//not found
                    //proper way should give feedback
                    if(is_callable($callback)) {
                        call_user_func($callback,$db_response);
                        }else {
                           http_response_code(404);//not found
                           echo json_encode(array("invalid callback" => "404/callback not found" ));
                        }
                }      
        }
        function func_be_db_dashboard_jwt_generator($payload){
          //get env variables
          $class_be_db_envylod = new class_be_db_envylod();
                // Usage
  $filePath ='/var/www/html/auth/onepass/v1.0/.env';
  try {
    $class_be_db_envylod->loadEnv($filePath);
    $jwtSecret = trim(getenv('JWT_SECRET'));
    if ($jwtSecret === false) {
        throw new Exception("JWT_SECRET not set in environment variables");
    }
  } catch (Exception $e) {
    echo "Error: " . $e->getMessage();
    exit;
  }
          //
            $client_id = "0000";
            $client_name = "system";
            $client_status="active";
            $exp = time()+3600;
            $timestamp = time();
            $jwt_header = [
             'typ' => "internal-auth",
             "alg" => "HS256",
             'status' => $client_status,
             'exp' => $exp,
             'timestamp' => $timestamp,
            ];
    
            $jwt_payload = [
                'client-id' => $client_id,
                'client-name' => $client_name,
                'token-role' => 'admin'
            ];
$base64header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($jwt_header)));
$base64payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($jwt_payload)));
$signature = hash_hmac('sha256', $base64header . "." . $base64payload, $jwtSecret, true);
$base64signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
$token = "$base64header.$base64payload.$base64signature";
          $api_endpoint_status_code = 11;//true 9 - jwt generated 
          $response_payload = [
            'message' => 'success',
            'redirect' => "http://172.31.105.163/auth/onepass/v1.0/modules/dashboard/?$token",
            'timestamp' => time(),
            ];
            //should redirect to dashboard or provide menu according to the client type
          $db_response = json_encode(array('response'=>array('responseCode'=>$api_endpoint_status_code,'payload'=>$response_payload)));
          try {
                      echo $db_response;
                            // Check if headers are already sent
            if (headers_sent($file, $line)) {
              error_log("Headers already sent in $file on line $line");
              throw new Exception("Headers already sent");
          }

            // Cookie parameters
            $cookieName = 'token';
            $cookieValue = $token;
            $cookieExpire = time()+3600; // expires in 24 hour
            $cookiePath = '/auth';
            $cookieDomain = ''; // change to your domain
            $secure = false; // only transmit cookie over HTTPS
            $httpOnly = true; // prevent JavaScript access to the cookie
            $sameSite = 'Strict'; // prevents the cookie from being sent with cross-site requests
            setcookie($cookieName, $cookieValue, [
                'expires' => $cookieExpire,
                'path' => $cookiePath,
                'domain' => $cookieDomain,
                'secure' => $secure,
                'httponly' => $httpOnly,
                'samesite' => $sameSite
            ]);
  
        } catch (Exception $e) {
            // Handle errors
            error_log('JWT encoding error: ' . $e->getMessage());
            // Respond with an appropriate error message to the client
            http_response_code(500);
            echo 'An error occurred while setting the JWT cookie.';
        }
        }
    }
 
