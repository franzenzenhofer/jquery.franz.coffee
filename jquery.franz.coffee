# HTML5 jquery plugin 'franz'
#
# MIT license
# by franz enzenhofer, 2012
#
# jquery plugin to make HTML5 in browser
#  * drag & drop
#  * copy&paste
# * fileselect
#
# file transfer usaable
#
# basically if you attach 'franz' to an HTML element it makes it a drag&drop and copyy&paste reciever (if it's a fileselect, it uses this transfer method)
# and passes a suitable HTMLElement to the callback, if it's a file and the file is an image, an image element is created, if it's an audio, an audio elemen is created and passed along, if it's a video .....
# if it's a textfile, then the text of the file gets passed ot the callback (as a sanitized* string)
# if it's a string, a string gets passed to the callback (as a sanitized* string)
#
# *optional
#
# jquery is a ghetto, but it solves the problem at hand (making inbrowser  drag&drop, copy&paste, fileselect as simple as possible)

#making sure $ is the jquery object
# Reference jQuery
$ = jQuery

# Adds plugin object to jQuery
$.fn.extend
  # define franz
  franz: (callback, options) ->
    # Default settings
    settings =
      paste: true
      drop: true
      fileselect: true
      image: true
      audio: true
      video: true
      text: true
      onload_reader_callback: true
      sanitize: true
      debug: false



    #it is ok to call franz(callback, options) and franz(options, callback) - franz is not picky
    if (callback and not $.isFunction(callback) and ($.isFunction(options) or not options)) then [options, callback] = [ callback, options ]

    #the default callback is console.log
    callback = callback ? (stuff) -> dlog('default callback start'); console.log(stuff); dlog('default callback end')

    # Merge default settings with options.
    settings = $.extend settings, options


    # Simple dubug logger
    dlog = (msg) ->
      console?.log msg if settings.debug

    #readerhelper (borrowed from https://github.com/franzenzenhofer/ReadFileBy/blob/master/main.coffee )
    readerhelper = (file_or_blob, what, reader_callback) ->
      dlog 'readerheper('+file_or_blob+','+what+','+reader_callback+')'
      reader = new FileReader()
      reader.onload = (event) ->
        dlog('reader_callback gets executed')
        reader_callback(event.target.result)
        dlog('reader_callback should have been executed')

      what = what.toLowerCase()
      dlog(what+' in readerhelper')
      dlog(file_or_blob)
      switch what
        when 'arraybuffer' then reader.readAsArrayBuffer(file_or_blob)
        when 'binarystring' then reader.readAsBinaryString(file_or_blob)
        when 'text' then reader.readAsText(file_or_blob)
        else  reader.readAsDataURL(file_or_blob)

    # _Insert magic here._
    return @each ()->
      dlog "one iteration of the main jquery loop"
      dlog @

      #attach paste event handler
      @onpaste = (e) ->
        for item in e.clipboardData.items
          do (item) ->
            dlog item
            dlog JSON.stringify(item)

            if item.kind is 'file' #it's a file
              dlog(/image\/.*/i.test(item.type))
              if /image\/.*/i.test(item.type) #it's an image
                #we transform the file to an dataurl
                what = 'dataurl'
                file_or_blob = item.getAsFile()
                dlog(file_or_blob)
                #the image dataurl gets passed to a reader callback that creates an image object
                reader_callback = (dataurl) ->
                  dlog('in image create reader_callback')
                  img = new Image()
                  img.src = dataurl
                  dlog(img)
                  #only after the image is loaded, we kick it back to the first callback
                  if settings.onload_reader_callback then img.onload = (event) -> callback(img) else callback(img)

            #after the if branches were set, we
            dlog(what)
            dlog(reader_callback)
            dlog(file_or_blob)
            readerhelper(file_or_blob,what,reader_callback) if (what and reader_callback)

      #attach drop event handler

      #if its a file select attach fileselect event handler


      #callback(@)
      dlog "end of one iteration of the main jquery loop"