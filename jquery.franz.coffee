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

##TODO: strings via copy&paste (or drop if possible), support mime/time restrictions, default common internet mime types
#making sure $ is the jquery object
# Reference jQuery
$ = jQuery

# Adds plugin object to jQuery
$.fn.extend
  # define franz
  franz: (callback, options) ->
    # Default settings
    settings =
      multiple: true #true - allow multile file transferactions in one go (callback is called multiple times) / false - only the first transferaction will be evaluated
      paste: true #ad paste event handler
      drop: true #ad drop event handler
      fileselect: true #ad change event handler to fileselect input types
      image: true #support images
      audio: true #support audio
      video: true #support video
      text: true #suppor text
      image_mime: ['image/gif', 'image/jpeg', 'image/pjpeg', 'image/png' , 'image/svg+xml' , 'image/tiff' , 'image/vnd.microsoft.icon']
      audio_mime: ['audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/vnd.wave', 'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/x-pn-wav',  'audio/vorbis', 'audio/mp4']
      video_mime: ['video/ogg', 'video/webm', 'video/mp4']
      text_mime: ['text/plain', 'text/html']
      onload_reader_callback: true #calls callback only after the onload event of an element
      sanitize: true #saniztes HTML in some cases #not yet implemented
      debug: false #debug flag
      dragactionclass: 'dragover' #class name which will be set to the droparea on dropstart / set false if behaviour is not desired
      errorcallback: (error) -> console.log(error.toString()); return error #errorcallback, nuff said
      maxfilesize: (20*1000*1024) #max file size of a single file
      textwrapper: 'div' #htmlelement in which the text of an transferaction will be wrapped
      no_html_in_text: true
      strings:
        maxfilesizeerror: 'File is too big!'
        mediatypenotsuppported: 'This media type is not supported!'
        nofiletype: "Don't know this type of file!"
        notransferkind: "Don't know what to do with this (kind of DataTransferItem)!"
        mimetypenotsupported: "The MIME-Type of the file is not supported :("


    #shortcuts
    err = settings.errorcallback

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
      #return true #awesome coffescript optimization with return in switch statements

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

    makeText = (file_or_blob_or_string) ->
      dlog 'in MAKETEXT'
      what = 'text'
      reader_callback = (text) ->
        dlog 'IN READER CALLBACK'
        dlog text
        #default - we don't want HTML in text
        if(settings.no_html_in_text is true)
          text = text.replace(/<(?:.|\n)*?>/gm, '')
          dlog ('WE stripped some tags')
          dlog text
        #default - we wrap the text in an HTML element
        if(settings.textwrapper and settings.textwrapper isnt '')
          dlog 'we wrap an HTML element around it'
          dlog text
          elem = document.createElement(settings.textwrapper)
          elem.innerText = text
          text = elem
          dlog text
        #there is no ONLOAD event on an common HTML element, so we call the callback directly
        callback(text)

      if (typeof file_or_blob_or_string is 'string')
        reader_callback(file_or_blob_or_string)
      else
        readerhelper(file_or_blob_or_string,what,reader_callback)

    #whattodo with the file based on the type
    whatToDoWithTheFile = (file, type) ->
      dlog (file)
      dlog (type)
      if not type then err(new Error(settings.strings.nofiletype)); return false

      if (file.size is undefined) or (file.size <= settings.maxfilesize)
        if /image\/.*/i.test(type) #it's an image
          if settings.image
            if(settings.image_mime == true) or (settings.image_mime?.indexOf(type) isnt -1)
              makeImage(file)
            else err(new Error(settings.string.mimetypenotsupported))
          else err(new Error(settings.strings.mediatypenotsuppported))
        else if /audio\/.*/i.test(type) #it's an audio
          if settings.audio
            if(settings.audio_mime == true) or (settings.audio_mime?.indexOf(type) isnt -1)
              makeAudio(file)
            else err(new Error(settings.strings.mimetypenotsupported))
          else err(new Error(settings.strings.mediatypenotsuppported))
          #if settings.audio then makeAudio(file) else err(new Error(settings.strings.mediatypenotsuppported))
        else if /video\/.*/i.test(type) #it's an audio
          if settings.video
            if(settings.video_mime == true) or (settings.video_mime?.indexOf(type) isnt -1)
              makeVideo(file)
            else err(new Error(settings.strings.mimetypenotsupported))
          else err(new Error(settings.strings.mediatypenotsuppported))
        else if /text\/.*/i.test(type) #it's a text file
          if settings.text
            if(settings.text_mime is true) or (settings.text_mime?.indexOf(type) isnt -1)
              makeText(file)
            else err(new Error(settings.strings.mimetypenotsupported))
          else err(new Error(settings.strings.mediatypenotsuppported))
      else
        err(new Error(settings.strings.maxfilesizeerror))



    # _Insert magic here._
    return @each ()->
      dlog "one iteration of the main jquery loop"
      dlog @

      #DROP

      #some drag]drop overhead, also we sett set dragover class
      @ondragstart = -> dlog('dragstart'); $(@).addClass(settings.dragactionclass); return false #addclass
      @ondragover = -> dlog('dragover');  $(@).addClass(settings.dragactionclass); return false #addclass
      @ondragend = -> dlog('dragend'); $(@).removeClass(settings.dragactionclass); return false #removeclass
      @ondragleave = -> dlog('dragleave'); $(@).removeClass(settings.dragactionclass); return false # removeclass

      @ondrop = (e) ->
        e.stopPropagation()
        e.preventDefault()
        $(@).removeClass(settings.dragactionclass) #removeclass
        if(settings.multiple)
          for file in e.dataTransfer.files
            do (file) -> whatToDoWithTheFile(file,file.type)
        else
           whatToDoWithTheFile(e.dataTransfer.files[0],e.dataTransfer.files[0].type)

        false

      #PASTE
      @onpaste = (e) ->
        dlog 'PASTE EVENT GOT FIRED'
        e.stopPropagation() #event gets handled only one time
        dlog 'IN PASTE'
        dlog e
        dlog e.clipboardData
        dlog e.clipboardData.items

        whatToDoWithTheItem = (item) ->
          dlog('whattodowiththeitem')
          dlog(item)
          if item.kind is 'file' #it's a file
            whatToDoWithTheFile(item.getAsFile(),item.type)
          else if item.kind is 'string'
            #ok, now we have an issue
            #as this method has a high chance of throwing two similar events, one time with text/plain one time with text/html
            dlog item.kind
            dlog item.type
            raw = e.clipboardData?.getData(item.type) #get the raw data
            dlog(typeof raw)
            if typeof raw is 'string'
                #makeText(raw)
                #we fake a file as we need to check it with all the settings
                whatToDoWithTheFile(raw,item.type)
            else #we don't know what it is
              err(new Error(settings.strings.notransferkind))

        if(settings.multiple)
          dlog ('e.clipboardData.items.length ->' + e.clipboardData.items.length)
          items = e.clipboardData.items
          #stupid workaround to prevent throwing two times a text event with text/html and text/plain
          if items.length is 2 and items[0].kind is 'string' and items[1].kind is 'string'
            dlog ('SUPER SPECIAL LOGIC AGAINST DUPLICATE TEXT/PLAIN TEXT/HTML ITEMS')
            #we get rid off all unsuported ones
            if settings.text_mime
              items = (item for item in items when (settings.text_mime.indexOf(item.type) isnt -1) )
             if items.length is 2
              #we kill the one with less information, which is the plain text one
              if items[0] is 'text/plain' then items = [items[1]] else  items = [items[0]]

          for item in items
            do (item) -> whatToDoWithTheItem(item)
        else
          whatToDoWithTheItem(e.clipboardData.items[0])

      #if its a file select attach fileselect event handler
      if $(@).is("input") and $(@).attr('type') is 'file'
        @onchange = (e) ->
          e.stopPropagation()
          dlog('onchange in input type file')
          dlog(e)
          if(e?.target?.files)
            e.stopPropagation()
            e.preventDefault()
            if(settings.multiple)
              for file in e.target.files
                do (file) -> whatToDoWithTheFile(file,file.type)
            else
              whatToDoWithTheFile(e.target.files[0],e.target.files[0].type)
          #readerhelper(e.target.files[0],what,callback)


      #callback(@)
      dlog "end of one iteration of the main jquery loop"