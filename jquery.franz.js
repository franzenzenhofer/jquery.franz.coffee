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
        image_mime: ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/png', 'image/svg+xml', 'image/tiff', 'image/vnd.microsoft.icon'],
        audio_mime: ['audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/vnd.wave', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/x-pn-wav', 'audio/vorbis', 'audio/mp4'],
        video_mime: ['video/ogg', 'video/webm', 'video/mp4'],
        text_mime: ['text/plain', 'text/html'],
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
        no_html_in_text: true,
        strings: {
          maxfilesizeerror: 'File is too big!',
          mediatypenotsuppported: 'This media type is not supported!',
          nofiletype: "Don't know this type of file!",
          notransferkind: "Don't know what to do with this (kind of DataTransferItem)!",
          mimetypenotsupported: "The MIME-Type of the file is not supported :("
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
      makeText = function(file_or_blob_or_string) {
        var reader_callback, what;
        dlog('in MAKETEXT');
        what = 'text';
        reader_callback = function(text) {
          var elem;
          dlog('IN READER CALLBACK');
          dlog(text);
          if (settings.no_html_in_text === true) {
            text = text.replace(/<(?:.|\n)*?>/gm, '');
            dlog('WE stripped some tags');
            dlog(text);
          }
          if (settings.textwrapper && settings.textwrapper !== '') {
            dlog('we wrap an HTML element around it');
            dlog(text);
            elem = document.createElement(settings.textwrapper);
            elem.innerText = text;
            text = elem;
            dlog(text);
          }
          return callback(text);
        };
        if (typeof file_or_blob_or_string === 'string') {
          return reader_callback(file_or_blob_or_string);
        } else {
          return readerhelper(file_or_blob_or_string, what, reader_callback);
        }
      };
      whatToDoWithTheFile = function(file, type) {
        var _ref2, _ref3, _ref4, _ref5;
        dlog(file);
        dlog(type);
        if (!type) {
          err(new Error(settings.strings.nofiletype));
          return false;
        }
        if ((file.size === void 0) || (file.size <= settings.maxfilesize)) {
          if (/image\/.*/i.test(type)) {
            if (settings.image) {
              if ((settings.image_mime === true) || (((_ref2 = settings.image_mime) != null ? _ref2.indexOf(type) : void 0) !== -1)) {
                return makeImage(file);
              } else {
                return err(new Error(settings.string.mimetypenotsupported));
              }
            } else {
              return err(new Error(settings.strings.mediatypenotsuppported));
            }
          } else if (/audio\/.*/i.test(type)) {
            if (settings.audio) {
              if ((settings.audio_mime === true) || (((_ref3 = settings.audio_mime) != null ? _ref3.indexOf(type) : void 0) !== -1)) {
                return makeAudio(file);
              } else {
                return err(new Error(settings.strings.mimetypenotsupported));
              }
            } else {
              return err(new Error(settings.strings.mediatypenotsuppported));
            }
          } else if (/video\/.*/i.test(type)) {
            if (settings.video) {
              if ((settings.video_mime === true) || (((_ref4 = settings.video_mime) != null ? _ref4.indexOf(type) : void 0) !== -1)) {
                return makeVideo(file);
              } else {
                return err(new Error(settings.strings.mimetypenotsupported));
              }
            } else {
              return err(new Error(settings.strings.mediatypenotsuppported));
            }
          } else if (/text\/.*/i.test(type)) {
            if (settings.text) {
              if ((settings.text_mime === true) || (((_ref5 = settings.text_mime) != null ? _ref5.indexOf(type) : void 0) !== -1)) {
                return makeText(file);
              } else {
                return err(new Error(settings.strings.mimetypenotsupported));
              }
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
          var item, items, whatToDoWithTheItem, _i, _len, _results;
          dlog('PASTE EVENT GOT FIRED');
          e.stopPropagation();
          dlog('IN PASTE');
          dlog(e);
          dlog(e.clipboardData);
          dlog(e.clipboardData.items);
          whatToDoWithTheItem = function(item) {
            var raw, _ref2;
            dlog('whattodowiththeitem');
            dlog(item);
            if (item.kind === 'file') {
              return whatToDoWithTheFile(item.getAsFile(), item.type);
            } else if (item.kind === 'string') {
              dlog(item.kind);
              dlog(item.type);
              raw = (_ref2 = e.clipboardData) != null ? _ref2.getData(item.type) : void 0;
              dlog(typeof raw);
              if (typeof raw === 'string') {
                return whatToDoWithTheFile(raw, item.type);
              } else {
                return err(new Error(settings.strings.notransferkind));
              }
            }
          };
          if (settings.multiple) {
            dlog('e.clipboardData.items.length ->' + e.clipboardData.items.length);
            items = e.clipboardData.items;
            if (items.length === 2 && items[0].kind === 'string' && items[1].kind === 'string') {
              dlog('SUPER SPECIAL LOGIC AGAINST DUPLICATE TEXT/PLAIN TEXT/HTML ITEMS');
              if (settings.text_mime) {
                items = (function() {
                  var _i, _len, _results;
                  _results = [];
                  for (_i = 0, _len = items.length; _i < _len; _i++) {
                    item = items[_i];
                    if (settings.text_mime.indexOf(item.type) !== -1) {
                      _results.push(item);
                    }
                  }
                  return _results;
                })();
              }
              if (items.length === 2) {
                if (items[0] === 'text/plain') {
                  items = [items[1]];
                } else {
                  items = [items[0]];
                }
              }
            }
            _results = [];
            for (_i = 0, _len = items.length; _i < _len; _i++) {
              item = items[_i];
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
            e.stopPropagation();
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
