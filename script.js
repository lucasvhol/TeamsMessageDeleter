(function() {
  var JQ = jQuery("iframe").contents();
  var queue = [];
  var last_processed = (new Date()).getTime();
  var loading = true;
  var my_name = null;

  var mouse = function(which, element) {
    var evt = element.ownerDocument.createEvent('MouseEvents');
    evt.initMouseEvent(which, true, true,
      element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
      false, false, false, 1, null);
    element.dispatchEvent(evt);
  };

  var processQueue = function() {
    if (queue.length > 0) {
      var item = queue.shift();
      if (my_name && my_name !== $(item).find("[data-tid=message-author-name]").text()) {
        $(item).css({ 'outline': '5px solid red' });
      } else {
        $(item).css({ 'outline': '5px solid blue' });
        mouse('contextmenu', $(item).find(".ui-chat__messagecontent>div")[0]);

        var delete_button = JQ.find("[data-tid=message-actions-delete]")[0];
        if (delete_button) {
          console.log("Delete ID " + $(item).attr("data-mid"));
          $(item).css({ 'outline': '5px solid green' });
          my_name = $(item).find("[data-tid=message-author-name]").text();
          console.log(["My name is: ", my_name]);
          mouse('click', delete_button);
          last_processed = (new Date()).getTime();
        } else {
          $(item).css({ 'outline': '5px solid red' });
        }
      }
      setTimeout(function() {
        $(item)[0].scrollIntoView(false);
      }, 100);
    }
  };

  var repeat = setInterval(function() {
    if (loading) {
      if (JQ.find("div.pending").size() === 0) {
        loading = false;
        $(JQ.find('div[data-mid]').get().reverse()).each(function() {
          var id = $(this).attr('data-mid');
          if (isNaN(id)) return;

          if ($(this).find("[data-tid=message-undo-delete-btn]").size() > 0) return;

          queue.push(this);
          $(this).css({ 'outline': '5px solid blue' });
        });
      } else return;
    }

    processQueue();

    if (queue.length <= 0) {
      loading = true;
    }

    if (last_processed < (new Date()).getTime() - 30000) {
      clearInterval(repeat);
      console.log("Finished, nothing new has come up for 30 seconds.");
    }
  }, 1000);
})();
