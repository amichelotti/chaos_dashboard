function sendim(type){
    let messageText = $('#input-text').val();
    if(messageText==""){
        alert("Message cannot be empty");
        return;
    }
    var t={
        username:$('#loggedInUID').val(),
        msg:messageText,
        type:type
    }
    if(type=="bug" || type == "alarm"){
        var platform={};
        for(var k in navigator ){
            platform[k]=JSON.stringify(navigator[k]);
        }
        t['platform']=platform;
    }
    chatService.sendMessage(t);
    $('#message-form').trigger('reset');

}
$(document).ready(function() {

    // Initialize app
    chatService.initializeApp();
    chat_incoming_message.addEventListener("chat_incoming_message", function(msg) {
        
        console.log("something arrived:"+JSON.stringify(msg.detail));
        chatService.insertMessage(msg.detail);
      });
   
    $("#send-message").on("click",(e)=>{
        sendim("user");
    });
    $("#send-alarm").on("click",(e)=>{
        sendim("alarm");

    });
    $("#send-bug").on("click",(e)=>{
       sendim("bug");
    });
    // Send message
    $('#message-form').submit(function(e) {    
        e.preventDefault(); 
        let messageText = $('#input-text').val();
        if(messageText==""){
            alert("Message cannot be empty");
            return;
        }
        var t={
            username:$('#loggedInUID').val(),
            msg:messageText
        }
        $('.old-chats').remove();
        chatService.sendMessage(t);


        $('#message-form').trigger('reset');
    });

});