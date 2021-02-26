function avatarFromMessage(value){
    var avatar="assets/avatar/captainamerica.png";
                if(value.type=="bug"){
                    avatar="img/swbug.png";
                }
                if(value.type=="alarm"){
                    avatar="img/alarm.png";
                }
                if(value.type=="system"){
                    avatar="img/logo_chaos_col_xMg_icon.ico";
                }
    return avatar;
}
 