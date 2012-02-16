# HTML5 jquery plugin 'franz'
#
# currently google chrome only!!!! (and it will probably never work on (any) IE)
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
      dragactionclass: 'dragover'



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

    makeImage = (file_or_blob) ->
      what = 'dataurl'
      #the image dataurl gets passed to a reader callback that creates an image object
      reader_callback = (dataurl) ->
        img = new Image()
        img.src = dataurl
        #only after the image is loaded, we kick it back to the first callback (default behaviour)
        if settings.onload_reader_callback then img.onload = (event) -> callback(img) else callback(img)
      readerhelper(file_or_blob,what,reader_callback)

    makeAudio = (file_or_blob) ->
      what = 'dataurl'
      #the image dataurl gets passed to a reader callback that creates an image object
      reader_callback = (dataurl) ->
        audio = new Audio()
        audio.src = dataurl
        audio.setAttribute('controls','controls')
        audio.setAttribute('autoplay','autoplay')
        audio.setAttribute('type',file_or_blob.type) if file_or_blob.type
        #only after the image is loaded, we kick it back to the first callback (default behaviour)
        if settings.onload_reader_callback then audio.onload = (event) -> callback(audio) else callback(audio)
      readerhelper(file_or_blob,what,reader_callback)

    makeVideo = (file_or_blob) ->
      what = 'dataurl'
      #the image dataurl gets passed to a reader callback that creates an image object
      reader_callback = (dataurl) ->
        video = document.createElement('video')
        video.src = dataurl
        video.setAttribute('controls','controls')
        video.setAttribute('autoplay','autoplay')
        video.setAttribute('type',file_or_blob.type) if file_or_blob.type
        #only after the image is loaded, we kick it back to the first callback (default behaviour)
        if settings.onload_reader_callback then video.onload = (event) -> callback(video) else callback(video)
      readerhelper(file_or_blob,what,reader_callback)

    #whattodo with the file based on the type
    whatToDoWithTheFile = (file, type) ->
      if /image\/.*/i.test(type) #it's an image
        makeImage(file)
      else if /audio\/.*/i.test(type) #it's an audio
        makeAudio(file)
      else if /video\/.*/i.test(type) #it's an audio
        makeVideo(file)


    # _Insert magic here._
    return @each ()->
      dlog "one iteration of the main jquery loop"
      dlog @

      #DROP
      #adds class during drag action
      @ondragover = ->
        droparea.className += " "+settings.dragactionclass
        false

      #removes class 'dragover' after the drag actions ends
      @ondragend = ->
        droparea.className = droparea.className.replace( new RegExp("(?:^|\s)"+settings.dragactionclass+"(?!\S)", "i"); /dragover/ , '' )
        false

      @ondrop = (e) ->
        e.stopPropagation()
        e.preventDefault()
        #dlog(e)
        #dlog(e.dataTransfer)
        #dlog(e.dataTransfer.items)
        #dlog(e.dataTransfer.files)
        #dlog(e.dataTransfer.files[0])
        #dlog(e.dataTransfer.items[0])
        #dlog(e.dataTransfer.items[0].getAsFile())
        for file in e.dataTransfer.files
          do (file) ->
            dlog('in the drop file loop')
            dlog(file)
            whatToDoWithTheFile(file,file.type)

        false
        #readerhelper(e.dataTransfer.files[0], what, callback)

      #PASTE
      #attach paste event handler
      @onpaste = (e) ->
        dlog e.clipboardData.items
        for item in e.clipboardData.items
          do (item) ->
            dlog item
            dlog JSON.stringify(item)
            if item.kind is 'file' #it's a file
              whatToDoWithTheFile(item.getAsFile(),item.type)

      #if its a file select attach fileselect event handler


      #callback(@)
      dlog "end of one iteration of the main jquery loop"