<?php
header('Content-Type: application/json');
//request for active jwt token with claims to retreive user information
include_once "./fe/fe.php";
//authorization service 
//independent simple resource server
//jwt handler class
function check_exp($payload) {
    $currentTime = time();
    if ($payload['exp'] < $currentTime) {
        // If the token has expired, delete the cookie and redirect to the login page
        //no need for redirect
        setcookie('token', '', time() - 3600, '/'); // Expire the cookie
        unset($_COOKIE['token']);
        exit;
    }else{
    //process request after token authentication
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);
     process_request($data,function($payload,$response){
        //check for response code
        if($response !=0){
            getaccountinfo($response,function($response){
                http_response_code(200);
                echo $response;
             });
        }else{
            http_response_code(400);
            $response_code = 0;
            $payload = [
             'message' => "invalid body",
             'timestamp' => time()
            ];
            echo json_encode(array("response"=>array('responseCode'=>$response_code ,'payload'=>$payload)));   
             }
     });
    }
}
class class_dash_envylod {
    function loadEnv($filePath) {
        if (!file_exists($filePath)) {
            throw new Exception("Environment file not found: $filePath");
        }
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') {
                continue;
            }
            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) {
                continue;
            }
            $key = trim($parts[0]);
            $value = trim($parts[1], "\"'");
            if ($key === '' || $value === '') {
                continue; 
            }
            putenv("$key=$value");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}
function base64UrlDecode($data) {
    $base64 = str_replace(['-', '_'], ['+', '/'], $data);
    $base64 = str_pad($base64, strlen($base64) % 4, '=', STR_PAD_RIGHT);
    return base64_decode($base64);
}
function base64UrlEncode($data) {
    $base64 = base64_encode($data);
    $base64 = str_replace(['+', '/'], ['-', '_'], $base64);
    return rtrim($base64, '=');
}
function verifyJWTSignature($jwt, $secretKey) {
    list($header, $payload, $signature) = explode('.', $jwt);
    $base64header = base64UrlEncode(json_encode(base64UrlDecode($header)));
    $base64payload = base64UrlEncode(json_encode(base64UrlDecode($payload)));
    $data = $header . '.' . $payload;
    $expectedSignature = base64UrlEncode(hash_hmac('sha256', $data, $secretKey, true));
    return hash_equals($expectedSignature, $signature);
}
//server check end
//validate jwt first
function isValidJWT($token) {
    $parts = explode('.', $token);
    return count($parts) === 3;
}

//better jwt decoding function
function decodeJWT($token) {
    if (!isValidJWT($token)) {
        http_response_code(400);
        $payload = 'invalid body';
        echo json_encode($payload);
        exit;
    }

    list($header, $payload, $signature) = explode('.', $token);

    // Decode base64 URL-encoded strings
    $header = base64UrlDecode($header);
    $payload = base64UrlDecode($payload);
    return [
        'header' => json_decode($header, true),
        'payload' => json_decode($payload, true),
        'signature' => $signature // Optionally include the signature
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') { 
    $ip = $_SERVER['SERVER_ADDR'];
    $domain =$_SERVER['SERVER_NAME'];
    //cookie check
// Check if the HTTP-only cookie is set
if (isset($_COOKIE['token'])) {
    $jwt = $_COOKIE['token'];
    $class_dash_envylod = new class_dash_envylod();
    $filePath = '/var/www/html/auth/onepass/v1.0/.env';

    try {
        $class_dash_envylod->loadEnv($filePath);
        $secretKey = trim(getenv('JWT_SECRET'));
        if ($secretKey === false) {
            throw new Exception("JWT_SECRET not set in environment variables");
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage();
        exit;
    }

        if (verifyJWTSignature($jwt, $secretKey)) {
            $decoded = decodeJWT($jwt);
            $header = $decoded['header'];
            $payload = $decoded['payload'];
            check_exp($header);
        } else {
            //no redirect // redirect to be handled by axios
            http_response_code(401);//unauthorized
            $response_code = 401;
            $payload = [
             'message' => "bad token",
             'timestamp' => time()
            ];
            echo json_encode(array("response"=>array('responseCode'=>$response_code ,'payload'=>$payload)));   
            exit();
             }

    //end of operation 105
} else {
         //no redirect // redirect to be handled by axios
         http_response_code(401);//unauthorized
         $response_code = 401;
         $payload = [
          'message' => "bad token",
          'timestamp' => time()
         ];
         echo json_encode(array("response"=>array('responseCode'=>$response_code ,'payload'=>$payload)));   
         exit();
}

}else {
    http_response_code(400);
    $response_code = 4;
    $payload = [
     'message' => "Bad request",
     'timestamp' => time()
    ];
    echo json_encode(array("response"=>array('responseCode'=>$response_code ,'payload'=>$payload)));
}

function process_request($data,$callback) {
if ($data !== null ) {
    //request must have timestamp for help in analytics
    //timestamp verification
    //user verification
    //request ip verification
    //limited requested resource approval
    if (isset($data['token']) || isset($_COOKIE['token'])) {
        //initial login timestamp required
        $token = $_COOKIE['token'];
        //decode token and extract email
        $decodedToken = decodeJWT($token);
        //extract email from token
        $user_identifier = $decodedToken['header']['userId'];
        $timestamp =  $decodedToken['header']['timestamp'];
       $base64email =  str_replace(['+', '/', '='], ['', '', ''],base64_encode(json_encode($user_identifier)));
       $tempauthcode = "$base64email.$timestamp"; 

 $payload = [
   'userId' => $user_identifier
 ]; 
        $response = $payload;
        if(is_callable($callback)) {
            call_user_func($callback,$payload,$response);
            }else {
               http_response_code(404);
               echo json_encode(array("invalid callback function" => "404/callback not found" ));
            }
    } else {
      
        http_response_code(400);
        $payload = 'invalid body';
        $response_code = 0;
        if(is_callable($callback)) {
            call_user_func($callback,$payload,$response_code);
            }else {
               http_response_code(404);
               echo json_encode(array("invalid callback function" => "404/callback not found" ));
            }
    } 
}else {
    http_response_code(400);
    $payload = 'invalid body';
    $response_code = 0;
    if(is_callable($callback)) {
        call_user_func($callback,$payload,$response_code);
        }else {
           http_response_code(404);
           echo json_encode(array("invalid callback function" => "404/callback not found" ));
        }
}
}
?>