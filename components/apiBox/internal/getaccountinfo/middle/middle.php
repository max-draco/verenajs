<?php
include_once './be/be.php';
class class_fe_getuserinfo{
function func_fe_getuserinfo($payload,$callback){
$class_be_getuserinfo = new class_be_getuserinfo();
$class_be_getuserinfo -> func_be_getuserinfo($payload,$callback);
}
}