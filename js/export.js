//An OWA to backup and restore SMS messages

alert("Script executed!");

var fullMessages=[];                                        //array to hold all the SMS
var selectedMessages=[];
var smsManager, importButton, exportButton, backupButton;

function init() {                                           //initialize all the global variables required by the app
  
  //alert("init executed");
    
  smsManager= window.navigator.mozMobileMessage;
  
  if(!smsManager)
    alert("SMS API not supported");
  
  
  importButton = document.getElementById("importButton");
  exportButton = document.getElementById("exportButton");
  backupButton = document.getElementById("backupButton");
  
  backupButton.addEventListener("click", backupSMS);         // ->
  importButton.addEventListener("click", importSMS);         // ->
  exportButton.addEventListener("click", retrieveSMS);       // -> add corresponding event listeners
}

function importSMS(){                                        //function to handle import of messages
  alert("importButton clicked");
  
}

function retrieveSMS(){                                        //function to retrieve messages
  
  //alert("exportButton clicked");
  /*importButton.disabled = "true";
  exportButton.disabled = "true";*/
  
  var message="";                                            //hold value of the messages retrieved
  var result = smsManager.getMessages(null, false);          //get messages without any filter
  var SMSCount=0;
  
  result.onsuccess=function(){
    
    
    if(SMSCount==0){                                         //show "Messages Found" only once during the lifetime of the app i.e ->
      alert("Messages found");                               //when the onsuccess event is first triggered. Change the document accordingly
      importButton.style.display = "none";
      exportButton.style.display = "none";
      backupButton.style.display = "inline";
      document.getElementById("title").innerHTML = "Please check the messages you want to backup";
      document.getElementById("title").style.fontSize = "small";
    }
    
   
    
    SMSCount++;
    displayMessage(this.result,SMSCount);
    message = convertToXML(this.result);                     // ->
    fullMessages.push(message);                              // -> convert the message to XML format and add it to fullMessages
    
    /*alert(SMSCount);                                       //Uncomment only if you want to see the messages on your phone
    alert(message);*/
    
    this.continue();
      
    }
  result.onerror = function(){
    console.log("No messages found on the device!");
  }
   
  
   
}

function displayMessage(m,id){                               //function to display a retrieved message on the document
  
  var mMessageDiv = document.getElementById("Messages");     //the Message div, in which messages are to be added
  var mDiv = document.createElement("div");
  var mTitle = document.createElement("p");
  var mHeader = document.createElement("p");
  var mBody = document.createElement("p");
  var mCheck = document.createElement("input");
  
  mDiv.id = "Message" + id;                                  
  mDiv.style.backgroundColor = "lightgray";
  mDiv.style.borderStyle = "solid";
  mDiv.style.borderWidth = "thin";
  mDiv.style.borderColor = "black";
  
  mCheck.id= "Check" + id;
  mCheck.type = "checkbox";
  mCheck.checked = true;
  //mCheck.addEventListener("change",messageChecked);
  
  mCheck.value = "Backup";
  mTitle.innerHTML = "Message : " + id;
  mHeader.innerHTML = "Sender : " + m.sender + "<br />" + "Receiver : " + m.receiver;
  mBody.innerHTML = "Message : <br />" + m.body;
  
  //console.log(mDiv.id);
  mDiv.appendChild(mCheck);
  mDiv.appendChild(mTitle);  
  mDiv.appendChild(mHeader);
  mDiv.appendChild(mBody);
  mMessageDiv.appendChild(mDiv);
  //console.log(mMessageDiv.childNodes[id].id);
  
}



function convertToXML(m){                                    //function to build an XML tree of a message
  
  //alert("convert called");
  var mess = "<type>" + m.type + "</type>" + "<id>" + m.id + "</id>" + "<threadId>" + m.threadId + "</threadId>" + "<sender>" + m.sender + "</sender>" + "<receiver>" + m.receiver + "</receiver>" + "<body>" + m.body + "</body>";
  //alert(message);
  return mess;
}

function backupSMS(){                                        //function to handle backup. Retrieves messages that are checked.
   //console.log(fullMessages.toString());
   //console.log("hello!")
  var messagesToExport = [];
  
  var messageDiv = document.getElementById("Messages");
    
  var message = messageDiv.childNodes[1];                    //get the first message. for some reason, childNodes[0] returns an undefined element.
  
  //console.log("First Child"+message.id);
  
  if(message){                  
    
    while(true){                                             //loop through all the messages, add only those messages that are checked.
      
      var checkBox = message.childNodes[0];                  //checkBox is the <input type="checkbox"> of every div with id="Message" + i
      //console.log("Checkbox number : " + checkBox.id);
      
      if(checkBox.checked == true){
        var id = checkBox.id;
        //console.log("First Child of inner message : "+ id);
        var msgID = parseInt(id.substr(5,id.length));          //extract the message id. Note that it is the same as the checkbox id. see displayMessage(m,id)
        //console.log("Extracted message number = " + msgID);
        messagesToExport.push(fullMessages[msgID-1]);          //add the corresponding message from fullMessages[] to messagesToExport[]
      }
      
      if(message.nextSibling){                                 //if more messages exist
        
        message = message.nextSibling;
        //console.log("Next sibling of inner message : " + message.id);
        
      }
      else
        break;
    }
    
  }
  
  
  alert("Writing messages to SDCard...");
  writeToSDCard(messagesToExport);                             
  
   //console.log("yellow")
   return;
}

function writeToSDCard(messagesToWrite){                           //write messages to sdcard   
  
   
  var messages = messagesToWrite;
   
  var messageBlob = new Blob(messages,{ "type" : "text/plain" }); 
    
  if(messageBlob!=null)
    console.log("blob created of size " + messageBlob.size);
  else
    console.log("blob not created");
  
  var card = navigator.getDeviceStorage("sdcard");                 //get sdcard. for some reason writing on internal sdcard fails, but succeeds on external sdcard
  
  if(card!=null)
    console.log("Sdcard found");
  else
    console.log("Sdcard not found");
  
  var Request = card.addNamed(messageBlob,"SMSBackup/backup.txt");      //Backup saved in SMSBackup/backup.txt
  //var Request = card.add(messageBlob);
  
  Request.onsuccess = function(){                                        //if successfully backed up, remove messages and go to initial screen
    console.log("SMSs successfully backed up to the SDCard : /SMSBackup/backup.txt");
    alert("All SMSs successfully backed up to the SDCard : /SMSBackup/backup.txt");
    removeMessages(document.getElementById("Messages"));
    //console.log("sdf");
    
  }
  
  Request.onerror = function(){
    
    console.warn("Unable to backup contacts because of the following error : " + this.error.name);
    //alert("Unable to backup contacts because of the following error : " + this.error.name);
    
    
    if(this.error.name=="NoModificationAllowedError")             //If the file already exists try to delete the existing file
      {
        var result = window.confirm("A backup already exists on your device. Do you want to replace it?")
        
        if(result){                                                //If the user confirms
          
          console.log("Attempting to delete the current backup file");
          alert("Deleting the current backup...");
          var Request = card.delete("SMSBackup/backup.txt");
          
          Request.onsuccess = function(){                           //If the file is deleted successfully, then try to write to sdcard again
            console.log("File successfully deleted");
            console.log("Attempting to write to sdcard again");
            writeToSDCard(messages);
          } 
          Request.onerror = function(){
            console.log("Unable to delete previous backup file : " + this.error.name);
          }
          
        }
        else                                                      //If the user cancels
          {
            
            console.log("Backup already exists. New backup not created.");
            removeMessages(document.getElementById("Messages"));
            //console.log("sdf");
           
          }               
      }
    else
    removeMessages(document.getElementById("Messages"));
  }
}

function removeMessages(mDiv){                                   //remove messages from the DOM tree
  
  while(mDiv.hasChildNodes()){
      mDiv.removeChild(mDiv.childNodes[0]);
  }
  
  importButton.style.display = "inline";
  exportButton.style.display = "inline";
  backupButton.style.display = "none";
  document.getElementById("title").innerHTML = "Backup SMS";
  document.getElementById("title").style.fontSize = "xx-large";
  //console.log("Exiting remove messages");
  
  return;
}

window.onload = init;                                     //Register the init() function to the window onload event