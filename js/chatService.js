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
const chatService = function() {
    $('#empty-chat').hide();
    $('#group-message-holder').hide();
    $('#loading-message-chat_container').hide();
    $('#send-message-spinner').hide();

    let messageArray = [
       
    ];

    if (messageArray.length < 1) {
        $('#empty-chat').show();
        $('#group-message-holder').hide();
    } else {
        $('#group-message-holder').show();
    }
    
    return {
        initializeApp: function() {
            console.log("Initialization completed successfully");
                    var username = "";
                    do{
                        username = prompt(`username`);

                    if(username==""){
                        alert("Cannot be empty");
                    }
                } while(username=="");

                    this.authLoginUser(username);
            },
            authLoginUser: function(username) {
                console.log("Login successfully");
                this.getLoggedInUser(username);
            },
            getLoggedInUser: function(username) {
                $('#loggedInUsername').text(username);
                //$('#loggedInUserAvatar').attr("src", user.avatar)
                $('#loggedInUID').val(username);
                $('#loading-message-chat_container').hide();
                this.fetchMessages();
            },
            insertMessage:function(t){
                if(t.username==$('#loggedInUID').val()){
                    console.log("filter self messages:"+JSON.stringify(t));
                    return;
                }
                messageArray.push(t);
                this.fetchMessages();
                this.onMessageReceived();

            },
        fetchMessages: function() {
            messageArray.forEach(function(value) {
                let messageList;
                var avatar=avatarFromMessage(value);
                
                if (value.username !== $('#loggedInUID').val()) {
                    messageList = `
                    <div class="received-chats old-chats">
                    <div class="received-chats-img">
                        <img src=${avatar} alt="Avatar" class="avatar">
                    </div>
                    <div class="received-msg">
                        <div class="received-msg-inbox">
                            <p>
                                <span id="message-sender-id">${value.username}</span><br />
                                ${value.msg}
                            </p>
                        </div>
                    </div>
                </div>                    
                    `
                } else {
                    messageList = `
                    <div class="outgoing-chats old-chats">
                        <div class="outgoing-chats-msg">
                            <p>${value.msg}</p>
                        </div>
                        <div class="outgoing-chats-img">
                            <img src=${avatar} alt="" class="avatar">
                        </div>
                    </div>
`
                }
                $('#group-message-holder').append(messageList);
            });
            this.scrollToBottom();
        },
        sendMessage: function(message){
            $('#send-message-spinner').show();
            let receiverID = "supergroup";
            let messageType = "user";
            let receiverType = "test";
            $('#message-form').trigger('reset');
            messageArray = [...messageArray, message];
            
            jchaos.iomessage(message);
            $.each(messageArray, function(index, value) {
                let messageList;
                let currentLoggedUID = $('#loggedInUID').val();

                if (value.username != currentLoggedUID) {
                    var src="";
                    if(value.hasOwnProperty("avatar")){
                        src=value.avatar;
                    } else {
                        src="assets/avatar/captainamerica.png";
                    }
                    messageList = `
                    <div class="received-chats old-chats">
                        <div class="received-chats-img">
                            <img src="${src}" alt="Avatar" class="avatar">
                        </div>
    
                        <div class="received-msg">
                            <div class="received-msg-inbox">
                                <p>
                                    <span id="message-sender-id">${value.username}</span><br />
                                    ${value.msg}
                                </p>
                            </div>
                        </div>
                    </div>                    
                    `
                } else {
                    var avatar=avatarFromMessage(value);
                    messageList = `
                    <div class="outgoing-chats old-chats">
                        <div class="outgoing-chats-msg">
                            <p>${value.msg}</p>
                        </div>
                        <div class="outgoing-chats-img">
                            <img src="${avatar}" alt="" class="avatar">
                        </div>
                    </div>
`
                }

                $('#group-message-holder').append(messageList);
            })
            this.onMessageReceived();
            this.scrollToBottom();       
        },
        onMessageReceived: function() {
                $('#empty-chat').hide();
                $('#group-message-holder').show();
                $('#send-message-spinner').hide();
                let listenerID = "UNIQUE_LISTENER_ID";
                /*CometChat.addMessageListener(
                    listenerID,
                    new CometChat.MessageListener({
                        onTextMessageReceived: textMessage => {
                            messageArray = [...messageArray, textMessage];
                            $('.old-chats').remove();
                            $.each(messageArray, function(index, value) {
                                let messageList;
                                let currentLoggedUID = $('#loggedInUID').val();
                
                                if (value.sender.uid != currentLoggedUID) {
                                    messageList = `
                                    <div class="received-chats old-chats">
                                        <div class="received-chats-img">
                                            <img src="${value.sender.avatar}" alt="Avatar" class="avatar">
                                        </div>
                    
                                        <div class="received-msg">
                                            <div class="received-msg-inbox">
                                                <p>
                                                    <span id="message-sender-id">${value.sender.uid}</span><br />
                                                    ${value.data.text}
                                                </p>
                                            </div>
                                        </div>
                                   </div>                    
                                    `
                                } else {
                                    messageList = `
                                    <div class="outgoing-chats old-chats">
                                        <div class="outgoing-chats-msg">
                                            <p>${value.data.text}</p>
                                        </div>
                                        <div class="outgoing-chats-img">
                                            <img src="${value.sender.avatar}" alt="" class="avatar">
                                        </div>
                                    </div>
                `
                                }
                
                                $('#group-message-holder').append(messageList);
                            });  
                            this.scrollToBottom();
                        }
                    })
                )*/            
            },
    
        scrollToBottom() {
            const chat = document.getElementById("msg-page");
            chat.scrollTo(0, chat.scrollHeight + 30);
        }
    }
}();