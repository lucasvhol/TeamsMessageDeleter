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
	}

	var repeat = setInterval(function() {
		if(loading) {
			if(JQ.find("div.pending").size() == 0) {
				loading = false;
				JQ.find('div[data-mid]').each(function() {
					var id = $(this).attr('data-mid');
					if(isNaN(id)) return;

					if($(this).find("[data-tid=message-undo-delete-btn]").size() > 0) return;

					queue.push(this);
					$(this).css({'outline': '5px solid #000'});
				});
			}
			else return;
		}

		if(queue.length > 0) {
			var item = queue.shift();
			if(my_name && my_name != $(item).find("[data-tid=message-author-name]").text()) return;

			$(item).css({'outline': '5px solid #cc0'});
			console.log("Delete ID " + $(item).attr("data-mid"));
			mouse('contextmenu', $(item).find(".ui-chat__messagecontent>div")[0]);
			setTimeout(function() {
				var delete_button = JQ.find("[data-tid=message-actions-delete]")[0];
				if(delete_button) {
					my_name = $(item).find("[data-tid=message-author-name]").text();
					console.log(["My name is: ", my_name]);
					mouse('click', delete_button);
				}
			}, 100);

			last_processed = (new Date()).getTime();
		}
		else {
			JQ.find('[data-tid=message-pane-list-viewport]').scrollTop(0);
			loading = true;
		}
		
		if(last_processed < (new Date()).getTime() - 30000) {
			// if no new messages are coming up for 30s, consider it finished
			clearInterval(repeat);
			console.log("Finished, nothing new has come up for 30 seconds.");
		}
	
	}, 1000);
})();
