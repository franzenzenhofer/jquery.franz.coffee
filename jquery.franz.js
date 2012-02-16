(function() {
  var $;
  $ = jQuery;
  $.fn.extend({
    franz: function(callback, options) {
      var dlog, makeAudio, makeImage, makeVideo, readerhelper, settings, whatToDoWithTheFile, _ref;
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
        debug: false,
        dragactionclass: 'dragover'
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
      makeImage = function(file_or_blob) {
        var reader_callback, what;
        what = 'dataurl';
        reader_callback = function(dataurl) {
          var img;
          img = new Image();
          img.src = dataurl;
          if (settings.onload_reader_callback) {
            return img.onload = function(event) {
              return callback(img);
            };
          } else {
            return callback(img);
          }
        };
        return readerhelper(file_or_blob, what, reader_callback);
      };
      makeAudio = function(file_or_blob) {
        var reader_callback, what;
        what = 'dataurl';
        reader_callback = function(dataurl) {
          var audio;
          audio = new Audio();
          audio.src = dataurl;
          audio.setAttribute('controls', 'controls');
          audio.setAttribute('autoplay', 'autoplay');
          if (file_or_blob.type) {
            audio.setAttribute('type', file_or_blob.type);
          }
          if (settings.onload_reader_callback) {
            return audio.onload = function(event) {
              return callback(audio);
            };
          } else {
            return callback(audio);
          }
        };
        return readerhelper(file_or_blob, what, reader_callback);
      };
      makeVideo = function(file_or_blob) {
        var reader_callback, what;
        what = 'dataurl';
        reader_callback = function(dataurl) {
          var video;
          video = document.createElement('video');
          video.src = dataurl;
          video.setAttribute('controls', 'controls');
          video.setAttribute('autoplay', 'autoplay');
          if (file_or_blob.type) {
            video.setAttribute('type', file_or_blob.type);
          }
          if (settings.onload_reader_callback) {
            return video.onload = function(event) {
              return callback(video);
            };
          } else {
            return callback(video);
          }
        };
        return readerhelper(file_or_blob, what, reader_callback);
      };
      whatToDoWithTheFile = function(file, type) {
        if (/image\/.*/i.test(type)) {
          return makeImage(file);
        } else if (/audio\/.*/i.test(type)) {
          return makeAudio(file);
        } else if (/video\/.*/i.test(type)) {
          return makeVideo(file);
        }
      };
      return this.each(function() {
        dlog("one iteration of the main jquery loop");
        dlog(this);
        this.ondragover = function() {
          droparea.className += " " + settings.dragactionclass;
          return false;
        };
        this.ondragend = function() {
          droparea.className = droparea.className.replace(new RegExp("(?:^|\s)" + settings.dragactionclass + "(?!\S)", "i"), /dragover/, '');
          return false;
        };
        this.ondrop = function(e) {
          var file, _fn, _i, _len, _ref2;
          e.stopPropagation();
          e.preventDefault();
          _ref2 = e.dataTransfer.files;
          _fn = function(file) {
            dlog('in the drop file loop');
            dlog(file);
            return whatToDoWithTheFile(file, file.type);
          };
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            file = _ref2[_i];
            _fn(file);
          }
          return false;
        };
        this.onpaste = function(e) {
          var item, _i, _len, _ref2, _results;
          dlog(e.clipboardData.items);
          _ref2 = e.clipboardData.items;
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            item = _ref2[_i];
            _results.push((function(item) {
              dlog(item);
              dlog(JSON.stringify(item));
              if (item.kind === 'file') {
                return whatToDoWithTheFile(item.getAsFile(), item.type);
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
