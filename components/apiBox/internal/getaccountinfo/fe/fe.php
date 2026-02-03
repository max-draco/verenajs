<?php
include_once './middle/middle.php';
function getaccountinfo($payload,$callback) {
    $class_fe_getuserinfo = new class_fe_getuserinfo();
   $class_fe_getuserinfo -> func_fe_getuserinfo($payload,$callback);
}