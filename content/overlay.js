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
    if(hostname === 'imap.googlemail.com'){
      if(this.messageID !== 'mail.google.com')
        alert('Warning, this might be a fake email !\nThe message-id is : "'+this.messageID+'" instead of "<someRandomAlphanumericCharacters>@'+hostname);
    }
  }
}
