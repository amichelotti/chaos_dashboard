<?php
/**
 * Created by komodo.
 * User: eliana
 * Date: 21/05/16
 */
function getUserIP() {
    $userIP =   '';
    if(isset($_SERVER['HTTP_CLIENT_IP'])){
        $userIP =   $_SERVER['HTTP_CLIENT_IP'];
    }elseif(isset($_SERVER['HTTP_X_FORWARDED_FOR'])){
        $userIP =   $_SERVER['HTTP_X_FORWARDED_FOR'];
    }elseif(isset($_SERVER['HTTP_X_FORWARDED'])){
        $userIP =   $_SERVER['HTTP_X_FORWARDED'];
    }elseif(isset($_SERVER['HTTP_X_CLUSTER_CLIENT_IP'])){
        $userIP =   $_SERVER['HTTP_X_CLUSTER_CLIENT_IP'];
    }elseif(isset($_SERVER['HTTP_FORWARDED_FOR'])){
        $userIP =   $_SERVER['HTTP_FORWARDED_FOR'];
    }elseif(isset($_SERVER['HTTP_FORWARDED'])){
        $userIP =   $_SERVER['HTTP_FORWARDED'];
    }elseif(isset($_SERVER['REMOTE_ADDR'])){
        $userIP =   $_SERVER['REMOTE_ADDR'];
    }else{
        $userIP =   'UNKNOWN';
    }
	return $userIP;
}
?>
<head>

	
	<meta charset="utf-8">
	
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
		<?php
			global $main_dir;
#			$main_dir="chaos_dashboard";
			$main_dir=".";
			global $index;
			$index = "index.php";
			
			echo '<link href="' .$main_dir. '/../js/chaos-widget/chaos-ctrl.css" type="text/css" rel="stylesheet" />';;

			echo '<link id="base-style" href="' .$main_dir. '/../css/style.css" rel="stylesheet">';
			echo '<script src="'.$main_dir.'/../js/jquery-3.5.1.min.js"></script>';
			//		echo '<script src="'.$main_dir.'/../js/jquery-migrate-1.0.0.min.js"></script>';
			echo '<script src="'.$main_dir.'/../js/jquery-ui/jquery-ui.min.js"></script>';
			echo '<link href="' .$main_dir. '/../js/jquery-ui/jquery-ui.min.css" type="text/css" rel="stylesheet" />';;
		
			echo '<link id="bootstrap-style" href="' .$main_dir. '/../bootstrap-4.5.3-dist/css/bootstrap.min.css" rel="stylesheet">';
		    echo '<script src="'.$main_dir.'/bootstrap-4.5.3-dist/../js/bootstrap.min.js"></script>';
		//	echo '<link href="' .$main_dir. '/css/bootstrap-responsive.min.css" rel="stylesheet">';
			
		//	echo '<link id="base-style-responsive" href="' .$main_dir. '/css/style-responsive.css" rel="stylesheet">';
			echo '<link href="https://fonts.googleapis.com/icon?family=Material+Icons"rel="stylesheet">';
			echo '<link href="http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&subset=latin,cyrillic-ext,latin-ext" rel="stylesheet" type="text/css">';
			echo '<link id="ie9style" href="' .$main_dir. '/css/ie9.css" rel="stylesheet">';
			echo '<link href="' .$main_dir. '/../css/highcharts.css" rel="stylesheet">';
			echo '<link href="' .$main_dir. '/../css/jquery.contextMenu.min.css" rel="stylesheet">';
			
			
			
	
			echo '<script src="'.$main_dir.'/../js/jchaos/jchaos.js"></script>';
			echo '<script src="'.$main_dir.'/../js/highcharts.js"></script>';
		
			echo '<script src="'.$main_dir.'/../js/jquery.contextMenu.min.js"></script>';
			echo '<script src="'.$main_dir.'/../js/jsoneditor.min.js"></script>';
		
			echo '<script src="'.$main_dir.'/../js/FileSaver.js"></script>';			
			echo '<script src="'.$main_dir.'/../js/jszip.min.js"></script>';			
			echo '<script type="text/javascript" src="/../js/daterangepicker/moment.min.js"></script>';
			echo '<script type="text/javascript" src="/../js/daterangepicker/daterangepicker.js"></script>';
			echo '<link href="' .$main_dir. '/../js/daterangepicker/daterangepicker.css" rel="stylesheet">';

			echo '<script src="'.$main_dir.'/../js/json-viewer/jquery.json-viewer.js"></script>';			
			echo '<script src="'.$main_dir.'/../js/chaos-widget/chaos-ctrl.js"></script>';

			echo '<link href="'.$main_dir.'/../js/cropper.min.css" media="screen" rel="stylesheet" type="text/css" />';
			echo '<script src="'.$main_dir.'/../js/cropper.min.js"></script>';			
			echo '<script src="'.$main_dir.'/../js/jquery.terminal/../js/jquery.terminal.min.js"></script>';
			echo '<script src="'.$main_dir.'/../js/jquery.terminal/../js/jquery.mousewheel-min.js"></script>';
			echo '<link href="' .$main_dir. '/../js/jquery.terminal/css/jquery.terminal.min.css" type="text/css" rel="stylesheet" />';;
			echo '<link rel="stylesheet" href="/../js/jstree/dist/themes/default/style.min.css" />';

			echo '<script src="'.$main_dir.'/../js/jstree/dist/jstree.min.js"></script>';
			echo '<script src="'.$main_dir.'/../js/socket.io.js"></script>';

		?>
	
	<link rel="shortcut icon" href="./img/logo_chaos_col_xMg_icon.ico">
	
		<div id="chat_incoming_message"></div>

        <script>
		var myip="<?php echo getUserIP(); ?>";
		if(localStorage['chaos_browser_uuid_cookie'] === undefined){
			localStorage['chaos_browser_uuid_cookie']=jchaos.generateUID();
		}
		const address = location.host.split(':');
		var rport=":8081";
		var ioport=":4000";
		var dashboard_settings=jqccs.initSettings();
		if(dashboard_settings.hasOwnProperty("defaultRestPort")){
			if(Number.isInteger(dashboard_settings.defaultRestPort)){
				rport=":"+dashboard_settings.defaultRestPort;
			} else {
				rport="/"+dashboard_settings.defaultRestPort;
			}
			console.log("RESTPORT:"+rport);

		}
		if(dashboard_settings.hasOwnProperty("defaultIOPort")){
			if(Number.isInteger(dashboard_settings.defaultIOPort)){
				ioport=":"+dashboard_settings.defaultIOPort;
			} else {
				ioport="/"+dashboard_settings.defaultIOPort;
			}
			console.log("IOPORT="+ioport);
		}
		if(address.length==1){
			jchaos.setOptions({"uri":location.host+rport,"socketio":location.host+ioport});

		} else {
			jchaos.setOptions({"uri":address[0]+rport,"socketio":address[0]+ioport});

		}

		jchaos.ioconnect(address[0]+ioport,{query: {"client_uid": localStorage['chaos_browser_uuid_cookie'],"discard_too_old":1000}});
		jchaos.options.io_onchat=(msg)=>{
			
			chat_incoming_message.dispatchEvent(new CustomEvent("chat_incoming_message", {detail:msg}));
			if(msg.type=="alarm"){
				alert(msg.date+" ALARM FROM \""+msg.username+"\" MESSAGE:"+msg.msg);
			}
		}
		
	</script>	
	



</head>
	
