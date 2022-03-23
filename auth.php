<?php

require_once('/var/simplesamlphp/lib/_autoload.php');
$as = new SimpleSAML_Auth_Simple('default-sp');

$position= array(
  "developer" => "chaos:chaos-webdev",
  "operator" => "chaos:chaos-operator",
  "admin" => "",
  "user" => ""
 );

 $myTeam="";

if ( $as->isAuthenticated() && $_REQUEST['logout'] ) {
  $as->logout();
}

/* if ( !$as->isAuthenticated() && $_REQUEST['login'] ) {
    $as->requireAuth();
}*/

if ( !$as->isAuthenticated()) {
    $as->requireAuth();
}
 
if ( $as->isAuthenticated() ) { 
//  echo "You are authenticated<br>\n";
 
  $attr = $as->getAttributes();
 

      $groups= $attr['groups'];
            
      foreach($groups as $team){
        //echo "$team". "<br>";
        
        if(strpos($team,$position["developer"])>0){
            $myTeam="developer";
            break;
        }elseif(strpos($team,$position["operator"])>0){
            $myTeam="operator";
            break;
        }else{
            $myTeam="Non autorizzato";
        }
      }
/*      if ($myTeam=="Non autorizzato"){
        header("location: ./notauth.php");
        exit;
      }
*/ 
  /*echo "<pre>";
  print_r( $attr );
  echo "</pre>";
*/
}else {
header("location: ./notauth.php");
exit;

}
 
 
?>
<br>
<!--<a href="?login=yes">LOGIN</a><br>
<a href="?logout=yes">LOGOUT</a><br>  -->

