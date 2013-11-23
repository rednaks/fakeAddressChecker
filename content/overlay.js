Components.utils.import("resource:///modules/gloda/index_msg.js");
Components.utils.import("resource:///modules/gloda/mimemsg.js");
// This is Thunderbird 3.3 only!
Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/NetUtil.jsm");

var FakeAddress = {
  check: function () {


    let msgHdr = gFolderDisplay.selectedMessage;
    if(msgHdr === null){
      alert('Please Select a message');
      return;
    }

    this.messageID = msgHdr.messageId;
	
	//getting *fake* sender mailer // 
	
	this.fullAuthor = msgHdr.author;
	
	var n = this.fullAuthor.indexOf("<");
	var m = this.fullAuthor.indexOf(">");

	this.Mailauthor = this.fullAuthor.slice(n+1,m);
	
	var at = this.Mailauthor.indexOf("@");

	this.Mailerauthor = this.Mailauthor.slice(at+1,this.Mailauthor.length);
	
	delete window.n;
	delete window.m;
	
	var at = this.messageID.indexOf("@");	
	this.MailermessageID = this.messageID.slice(at+1,this.messageID.length);

	
	
	delete window.at;
	
	// END_OF  //
	
    var email = msgHdr.author;
    var reg = new RegExp('.*?([\\w-+]+(?:\\.[\\w-+]+)*@(?:[\\w-]+\\.)+[a-zA-Z]{2,7})');
    email = reg.exec(email)[1];
    var domain = email.split("@")[1].toLowerCase();
    this.findConfig(domain, email);
 },

  findConfig : function(domain, email)
  {
    var self = this;
    fetchConfigFromDisk(domain,
      function(config) // success
      {
        self.foundConfig(config);
      },
      function(e) // fetchConfigFromDisk failed
      {
        if (e instanceof CancelledException) {
          return;
        }
        fetchConfigFromISP(domain, email,
          function(config) // success
          {
            self.foundConfig(config);
          },
          function(e) // fetchConfigFromISP failed
          {
            if (e instanceof CancelledException) {
              return;
            }
            fetchConfigFromDB(domain,
              function(config) // success
              {
                self.foundConfig(config);
              },
              function(e) // fetchConfigFromDB failed
              {
                if (e instanceof CancelledException) {
                  return;
                }
                fetchConfigForMX(domain,
                  function(config) // success
                  {
                    self.foundConfig(config);
                  },
                  function(e) // fetchConfigForMX failed
                  {
                    if (e instanceof CancelledException) {
                      return;
                    }
                  });
              });
          });
      });
  },

  foundConfig:  function(config)
  {
    var hostname = config.incoming.hostname;
    //if(hostname === 'imap.googlemail.com'){
        if(this.Mailerauthor === 'esprit.tn')  /*esprit.tn to be replaced with a var checked from the database*/
		{
			var TableOfTrust = new Array(this.Mailerauthor, "mail.gmail.com","mail.google.com");
			var threat = true;
			for(i=0;i<=TableOfTrust.length;i++)
			{
				if(TableOfTrust[i] === this.MailermessageID)
				{threat = false;} 
			}
				if(threat)
				{
					alert('Warning, this might be a fake email !\nThe message-id is : "'+this.messageID+'" instead of "<someRandomAlphanumericCharacters>@'+hostname);
				}
				else
				{
					alert('All seems ok, you should be careful though');
				}
		}
		else 
		{
		alert("We do not support this provider.. for now"); 
		}
	//}
  }
}
