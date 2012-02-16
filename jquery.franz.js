(function() {
  var $;
  $ = jQuery;
  $.fn.extend({
    franz: function(callback, options) {
      var dlog, readerhelper, settings, _ref;
      settings = {
        paste: true,
        drop: true,
        fileselect: true,
        image: true,
        audio: true,
        video: true,
        text: true,
        onload_reader_callback: true,
        sanitize: true,
        debug: false
      };
      if (callback && !$.isFunction(callback) && ($.isFunction(options) || !options)) {
        _ref = [callback, options], options = _ref[0], callback = _ref[1];
      }
      callback = callback != null ? callback : function(stuff) {
        dlog('default callback start');
        console.log(stuff);
        return dlog('default callback end');
      };
      settings = $.extend(settings, options);
      dlog = function(msg) {
        if (settings.debug) {
          return typeof console !== "undefined" && console !== null ? console.log(msg) : void 0;
        }
      };
      readerhelper = function(file_or_blob, what, reader_callback) {
        var reader;
        dlog('readerheper(' + file_or_blob + ',' + what + ',' + reader_callback + ')');
        reader = new FileReader();
        reader.onload = function(event) {
          dlog('reader_callback gets executed');
          reader_callback(event.target.result);
          return dlog('reader_callback should have been executed');
        };
        what = what.toLowerCase();
        dlog(what + ' in readerhelper');
        dlog(file_or_blob);
        switch (what) {
          case 'arraybuffer':
            return reader.readAsArrayBuffer(file_or_blob);
          case 'binarystring':
            return reader.readAsBinaryString(file_or_blob);
          case 'text':
            return reader.readAsText(file_or_blob);
          default:
            return reader.readAsDataURL(file_or_blob);
        }
      };
      return this.each(function() {
        dlog("one iteration of the main jquery loop");
        dlog(this);
        this.onpaste = function(e) {
          var item, _i, _len, _ref2, _results;
          _ref2 = e.clipboardData.items;
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            item = _ref2[_i];
            _results.push((function(item) {
              var file_or_blob, reader_callback, what;
              dlog(item);
              dlog(JSON.stringify(item));
              if (item.kind === 'file') {
                dlog(/image\/.*/i.test(item.type));
                if (/image\/.*/i.test(item.type)) {
                  what = 'dataurl';
                  file_or_blob = item.getAsFile();
                  dlog(file_or_blob);
                  reader_callback = function(dataurl) {
                    var img;
                    dlog('in image create reader_callback');
                    img = new Image();
                    img.src = dataurl;
                    dlog(img);
                    if (settings.onload_reader_callback) {
                      return img.onload = function(event) {
                        return callback(img);
                      };
                    } else {
                      return callback(img);
                    }
                  };
                }
              }
              dlog(what);
              dlog(reader_callback);
              dlog(file_or_blob);
              if (what && reader_callback) {
                return readerhelper(file_or_blob, what, reader_callback);
              }
            })(item));
          }
          return _results;
        };
        return dlog("end of one iteration of the main jquery loop");
      });
    }
  });
}).call(this);
