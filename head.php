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

	
	<!-- start: Meta -->
	<meta charset="utf-8">
	<title>!CHAOS Dashboard</title>
	
	<!-- start: Mobile Specific -->
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<!-- end: Mobile Specific -->
	
	<!-- start: CSS -->
	<!--link id="bootstrap-style" href="./css/bootstrap.min.css" rel="stylesheet">
	<link href="./css/bootstrap-responsive.min.css" rel="stylesheet"-->
		
		<?php
			global $main_dir;
#			$main_dir="chaos_dashboard";
			$main_dir=".";
			global $index;
			$index = "index.php";
			

			
			//link style
		//	echo '<link id="bootstrap-style" href="' .$main_dir. '/css/bootstrap.min.css" rel="stylesheet">';
		//  echo '<script src="'.$main_dir.'/js/bootstrap.min.js"></script>';
			//echo '<link id="bootstrap-style" href="' .$main_dir. '/bootstrap-3.4.1-dist/css/bootstrap.min.css" rel="stylesheet">';
			//echo '<script src="'.$main_dir.'/bootstrap-3.4.1-dist/js/bootstrap.min.js"></script>';
			//echo '<script src="'.$main_dir.'/js/jquery-1.9.1.min.js"></script>';
			echo '<link href="' .$main_dir. '/js/chaos-widget/chaos-ctrl.css" type="text/css" rel="stylesheet" />';;

			echo '<link id="base-style" href="' .$main_dir. '/css/style.css" rel="stylesheet">';
			echo '<script src="'.$main_dir.'/js/jquery-3.5.1.min.js"></script>';
			//		echo '<script src="'.$main_dir.'/js/jquery-migrate-1.0.0.min.js"></script>';
			echo '<script src="'.$main_dir.'/js/jquery-ui/jquery-ui.min.js"></script>';
			echo '<link href="' .$main_dir. '/js/jquery-ui/jquery-ui.min.css" type="text/css" rel="stylesheet" />';;
		
			echo '<link id="bootstrap-style" href="' .$main_dir. '/bootstrap-4.5.3-dist/css/bootstrap.min.css" rel="stylesheet">';
		    echo '<script src="'.$main_dir.'/bootstrap-4.5.3-dist/js/bootstrap.min.js"></script>';
		//	echo '<link href="' .$main_dir. '/css/bootstrap-responsive.min.css" rel="stylesheet">';
			
		//	echo '<link id="base-style-responsive" href="' .$main_dir. '/css/style-responsive.css" rel="stylesheet">';
			echo '<link href="https://fonts.googleapis.com/icon?family=Material+Icons"rel="stylesheet">';
			echo '<link href="http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&subset=latin,cyrillic-ext,latin-ext" rel="stylesheet" type="text/css">';
			//echo '<link id="ie-style" href="' .$main_dir. '/css/ie.css" rel="stylesheet">';
			echo '<link id="ie9style" href="' .$main_dir. '/css/ie9.css" rel="stylesheet">';
			echo '<link href="' .$main_dir. '/css/highcharts.css" rel="stylesheet">';
			
			//echo '<link href="' .$main_dir. '/css/custom_style.css" rel="stylesheet">';
			echo '<link href="' .$main_dir. '/css/jquery.contextMenu.min.css" rel="stylesheet">';
			
			
			
			//link script
			
			//echo '<link href="' .$main_dir. '/js/jquery-ui.min.css" rel="stylesheet">';

	//		echo '<script src="'.$main_dir.'/js/jquery.ui.touch-punch.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/modernizr.js"></script>';
		
		//	echo '<script src="'.$main_dir.'/js/jquery.cookie.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/fullcalendar.min.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/jquery.dataTables.min.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/excanvas.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/jquery.chosen.min.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.uniform.min.js"></script>';		
		//	echo '<script src="'.$main_dir.'/js/jquery.cleditor.min.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.noty.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.elfinder.min.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.raty.min.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.iphone.toggle.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.uploadify-3.1.min.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.gritter.min.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.imagesloaded.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.masonry.min.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.knob.modified.js"></script>';	
		//	echo '<script src="'.$main_dir.'/js/jquery.sparkline.min.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/counter.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/retina.js"></script>';
	//		echo '<script src="'.$main_dir.'/js/custom.js"></script>';
			echo '<script src="'.$main_dir.'/js/jchaos/jchaos.js"></script>';
			echo '<script src="'.$main_dir.'/js/highcharts.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/exporting.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/modules/annotations.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/modules/histogram-bellcurve.js"></script>';

			echo '<script src="'.$main_dir.'/js/jquery.contextMenu.min.js"></script>';
		//	echo '<script src="'.$main_dir.'/js/jquery.ui.position.min.js"></script>';
			echo '<script src="'.$main_dir.'/js/jsoneditor.min.js"></script>';
		//	echo '<link rel="stylesheet" href="/js/jsoneditor/jsoneditor.min.min.css" />';

			echo '<script src="'.$main_dir.'/js/FileSaver.js"></script>';			
			echo '<script src="'.$main_dir.'/js/jszip.min.js"></script>';			
			//echo '<script src="'.$main_dir.'/js/datejszip.min.js"></script>';			

			echo '<script type="text/javascript" src="/js/daterangepicker/moment.min.js"></script>';
			echo '<script type="text/javascript" src="/js/daterangepicker/daterangepicker.js"></script>';
			echo '<link href="' .$main_dir. '/js/daterangepicker/daterangepicker.css" rel="stylesheet">';

			echo '<script src="'.$main_dir.'/js/json-viewer/jquery.json-viewer.js"></script>';			
			echo '<script src="'.$main_dir.'/js/chaos-widget/chaos-ctrl.js"></script>';

			echo '<link href="'.$main_dir.'/js/cropper.min.css" media="screen" rel="stylesheet" type="text/css" />';
			echo '<script src="'.$main_dir.'/js/cropper.min.js"></script>';			
			echo '<script src="'.$main_dir.'/js/jquery.terminal/js/jquery.terminal.min.js"></script>';
			echo '<script src="'.$main_dir.'/js/jquery.terminal/js/jquery.mousewheel-min.js"></script>';
			echo '<link href="' .$main_dir. '/js/jquery.terminal/css/jquery.terminal.min.css" type="text/css" rel="stylesheet" />';;
			echo '<link rel="stylesheet" href="/js/jstree/dist/themes/default/style.min.css" />';

			echo '<script src="'.$main_dir.'/js/jstree/dist/jstree.min.js"></script>';
			echo '<script src="'.$main_dir.'/js/socket.io.js"></script>';


			//<script src="js/plotly-latest.min.js"></script>
			//<link href="js/json-viewer/jquery.json-viewer.css" type="text/css" rel="stylesheet" />
				   


		?>

	<!--link href="https://fonts.googleapis.com/icon?family=Material+Icons"rel="stylesheet"-->

	<!--link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&subset=latin,cyrillic-ext,latin-ext' rel='stylesheet' type='text/css'-->
	<!-- The HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	  	<!--script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script-->
	<![endif]-->
		
	<!-- start: Favicon -->
	<link rel="shortcut icon" href="./img/logo_chaos_col_xMg_icon.ico">
	<!-- end: Favicon -->
	
	

		<div id="chat_incoming_message"></div>

        <script>
		var myip="<?php echo getUserIP(); ?>";
		if(localStorage['chaos_browser_uuid_cookie'] === undefined){
		//	alert();
		
			localStorage['chaos_browser_uuid_cookie']=jchaos.generateUID();
		}
        jchaos.setOptions({"uri":location.host+":8081","socketio":location.host+":4000"});
		var url_server =  location.host; //"chaosdev-webui1.chaos.lnf.infn.it";
		var n_port = "8081";
		jchaos.ioconnect(location.host+":4000",{query: {"client_uid": localStorage['chaos_browser_uuid_cookie'],"discard_too_old":9000}});
		jchaos.options.io_onchat=(msg)=>{
			
			chat_incoming_message.dispatchEvent(new CustomEvent("chat_incoming_message", {detail:msg}));
			if(msg.type=="alarm"){
				alert("ALARM FROM \""+msg.username+"\" MESSAGE:"+msg.msg);
			}
		}
		/*const socket=io("ws://"+url_server+":4000",{transports: ['websocket']});
		var ws_socket=null;
		socket.on("connect", () => {
			ws_socket=socket;
		});
		socket.on("connect", () => {
			ws_socket=socket;
			console.log("CONNECTED to "+"ws://"+url_server+":4000"+ " client id:"+socket.id);
		});
		socket.on("disconnect", () => {
			ws_socket=null;
			console.log("DISCONNECTED from "+"ws://"+url_server+":4000"+ " client id:"+socket.id);

		});
	*/
	</script>	
	



</head>
	<!-- end: JavaScript-->
	
