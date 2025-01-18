<?php 
header('Content-Type: application/json; charset=utf-8');
//restricted access
 //access only from sso.northfast.co.ke/preuth with secret key
 //otherwise restricted json response
//pureConfiguration
class db_config {
    public $host = 'localhost';
    public $database = 'accounts';
    public $username = 'postgres';
    public $password = '0';
}
