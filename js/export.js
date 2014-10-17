//An OWA to backup and restore SMS messages

alert("Script executed!");

var fullMessages=[];                                        //array to hold all the SMS
var smsManager, importButton, exportButton;

function init() {                                           //initialize all the global variables required by the app
  
  alert("init executed");
  
  smsManager= window.navigator.mozMobileMessage;
  if(!smsManager)
    alert("SMS API not supported");
  
  importButton = document.getElementById("importButton");
  exportButton = document.getElementById("exportButton");
  importButton.addEventListener("click", importSMS);         // ->
  exportButton.addEventListener("click", exportSMS);         // -> add corresponding event listeners
}

function importSMS(){                                        //function to handle import of messages
  alert("importButton clicked");
  
}

function exportSMS(){                                        //function to handle export of messages
  
  alert("exportButton clicked");
  var message="";                                            //hold value of the messages retrieved
  var result = smsManager.getMessages(null, false);          //get messages without any filter
  var SMSCount=0;
  result.onsuccess=function(){
    
    if(SMSCount==0){                                         //show "Messages Found" only once during the lifetime of the app i.e ->
      alert("Messages found");                               //when the onsuccess event is first triggered
      
    }
    
    if(this.done){                                           //once all messages have been received, write them to the sdcard
      alert("Writing messages to SDCard...");
      writeToSDCard();
      return;
    }
    
    SMSCount++;
    message = convertToXML(this.result);                     // ->
    fullMessages.push(message);                              // -> convert the message to XML format and add it to fullMessages
    
    /*alert(SMSCount);                                       //Uncomment only if you want to see the messages on your phone
    alert(message);*/
    
    this.continue();
      
    }
   
  
   
}

function convertToXML(m){                                    //function to build an XML tree of a message
  
  //alert("convert called");
  var mess = "<type>" + m.type + "</type>" + "<id>" + m.id + "</id>" + "<threadId>" + m.threadId + "</threadId>" + "<sender>" + m.sender + "</sender>" + "<receiver>" + m.receiver + "</receiver>" + "<body>" + m.body + "</body>";
  //alert(message);
  return mess;
}

function writeToSDCard(){                                    //function to write messages to the sdcard
   //console.log(fullMessages.toString());
   //console.log("hello!")
  var messageBlob = new Blob(fullMessages,{ "type" : "text/plain" }); 
   
  if(messageBlob!=null)
    console.log("blob created of size" + messageBlob.size);
  else
    console.log("blob not created");
  
  var card = navigator.getDeviceStorage("sdcard"); 
  
  if(card!=null)
    console.log("Sdcard found");
  else
    console.log("Sdcard not found");
  
  var Request = card.addNamed(messageBlob,"SMSBackup/backup.txt");      //Backup saved in SMSBackup/backup.txt
  //var Request = card.add(messageBlob);
  
  Request.onsuccess = function(){
    console.log("SMSs successfully backed up to the SDCard : /SMSBackup/backup.txt");
    alert("All SMSs successfully backed up to the SDCard : /SMSBackup/backup.txt")
  }
  
  Request.onerror = function(){
    
    console.warn("Unable to backup contacts because of the following error : " + this.error.name);
    
    if(this.error.name=="NoModificationAllowedError")             //If the file already exists try to delete the existing file
      {
        console.log("Attempting to delete the current backup file");
        var Request = card.delete("SMSBackup/backup.txt");
        Request.onsuccess = function(){                           //If the file is deleted successfully, then try to write to sdcard again
          console.log("File successfully deleted");
          console.log("Attempting to write to sdcard again");
          writeToSDCard();
        }
        Request.onerror = function(){
          console.log("Unable to delete previous backup file : " + this.error.name);
        }
        
      }
  }
   //console.log("yellow")
   return;
}

window.onload = init;                                     //Register the init() function to the window onload event