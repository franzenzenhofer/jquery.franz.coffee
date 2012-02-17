(function() {
  var $;
  $ = jQuery;
  $.fn.extend({
    franz: function(callback, options) {
      var dlog, err, makeAudio, makeImage, makeText, makeVideo, readerhelper, settings, whatToDoWithTheFile, _ref;
      settings = {
        multiple: true,
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
        dragactionclass: 'dragover',
        errorcallback: function(error) {
          console.log(error.toString());
          return error;
        },
        maxfilesize: 20 * 1000 * 1024,
        textwrapper: 'div',
        strings: {
          maxfilesizeerror: 'File is too big!',
          mediatypenotsuppported: 'This media type is not supported!',
          nofiletype: "Don't know this type of file!",
          notransferkind: "Don't know what to do with this (kind of DataTransferItem)!"
        }
      };
      err = settings.errorcallback;
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
      makeText = function(file_or_blob) {
        var reader_callback, what;
        what = 'text';
        reader_callback = function(text) {
          var elem;
          dlog(text);
          if (settings.textwrapper && settings.textwrapper !== '') {
            elem = document.createElement(settings.textwrapper);
            elem.innerText = text;
            text = elem;
          }
          return callback(text);
        };
        return readerhelper(file_or_blob, what, reader_callback);
      };
      whatToDoWithTheFile = function(file, type) {
        dlog(file);
        dlog(type);
        if (!type) {
          err(new Error(settings.strings.nofiletype));
          return false;
        }
        if ((file.size === void 0) || (file.size <= settings.maxfilesize)) {
          if (/image\/.*/i.test(type)) {
            if (settings.image) {
              return makeImage(file);
            } else {
              return err(new Error(settings.strings.mediatypenotsuppported));
            }
          } else if (/audio\/.*/i.test(type)) {
            if (settings.audio) {
              return makeAudio(file);
            } else {
              return err(new Error(settings.strings.mediatypenotsuppported));
            }
          } else if (/video\/.*/i.test(type)) {
            if (settings.video) {
              return makeVideo(file);
            } else {
              return err(new Error(settings.strings.mediatypenotsuppported));
            }
          } else if (/text\/.*/i.test(type)) {
            if (settings.text) {
              return makeText(file);
            } else {
              return err(new Error(settings.strings.mediatypenotsuppported));
            }
          }
        } else {
          return err(new Error(settings.strings.maxfilesizeerror));
        }
      };
      return this.each(function() {
        dlog("one iteration of the main jquery loop");
        dlog(this);
        this.ondragstart = function() {
          dlog('dragstart');
          $(this).addClass(settings.dragactionclass);
          return false;
        };
        this.ondragover = function() {
          dlog('dragover');
          $(this).addClass(settings.dragactionclass);
          return false;
        };
        this.ondragend = function() {
          dlog('dragend');
          $(this).removeClass(settings.dragactionclass);
          return false;
        };
        this.ondragleave = function() {
          dlog('dragleave');
          $(this).removeClass(settings.dragactionclass);
          return false;
        };
        this.ondrop = function(e) {
          var file, _fn, _i, _len, _ref2;
          e.stopPropagation();
          e.preventDefault();
          $(this).removeClass(settings.dragactionclass);
          if (settings.multiple) {
            _ref2 = e.dataTransfer.files;
            _fn = function(file) {
              return whatToDoWithTheFile(file, file.type);
            };
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              file = _ref2[_i];
              _fn(file);
            }
          } else {
            whatToDoWithTheFile(e.dataTransfer.files[0], e.dataTransfer.files[0].type);
          }
          return false;
        };
        this.onpaste = function(e) {
          var item, whatToDoWithTheItem, _i, _len, _ref2, _results;
          dlog(e.clipboardData.items);
          whatToDoWithTheItem = function(item) {
            dlog('whattodowiththeitem');
            dlog(item);
            if (item.kind === 'file') {
              return whatToDoWithTheFile(item.getAsFile(), item.type);
            } else {
              return err(new Error(settings.strings.notransferkind));
            }
          };
          if (settings.multiple) {
            _ref2 = e.clipboardData.items;
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              item = _ref2[_i];
              _results.push((function(item) {
                return whatToDoWithTheItem(item);
              })(item));
            }
            return _results;
          } else {
            return whatToDoWithTheItem(e.clipboardData.items[0]);
          }
        };
        if ($(this).is("input") && $(this).attr('type') === 'file') {
          this.onchange = function(e) {
            var file, _i, _len, _ref2, _ref3, _results;
            dlog('onchange in input type file');
            dlog(e);
            if ((e != null ? (_ref2 = e.target) != null ? _ref2.files : void 0 : void 0)) {
              e.stopPropagation();
              e.preventDefault();
              if (settings.multiple) {
                _ref3 = e.target.files;
                _results = [];
                for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
                  file = _ref3[_i];
                  _results.push((function(file) {
                    return whatToDoWithTheFile(file, file.type);
                  })(file));
                }
                return _results;
              } else {
                return whatToDoWithTheFile(e.target.files[0], e.target.files[0].type);
              }
            }
          };
        }
        return dlog("end of one iteration of the main jquery loop");
      });
    }
  });
}).call(this);
