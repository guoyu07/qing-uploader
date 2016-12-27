class QingUploader extends QingModule

  @count: 0

  @opts:
    el: null
    allowMultiple: true
    url: ''
    params: null
    fileKey: 'upload_file'
    connectionCount: 3
    locales: null

  @locales:
    leaveConfirm: '''
      There is file being uploaded, are you sure to leave this page?
    '''

  constructor: (opts)->
    super
    @opts = $.extend {}, QingUploader.opts, opts
    @_locales = $.extend {}, QingUploader.locales, @opts.locales

    @files = [] # files being uploaded
    @queue = [] # files waiting to be uploaded
    @uploading = false # upload status
    @id = ++ QingUploader.count

    @_initFileField(@opts.el) if @opts.el
    @_bind()

  _initFileField: (el) ->
    $el = $ el
    return unless $el.length > 0

    $input = $el.find('input:file')
    $input.remove() if $input.length > 0

    $input = $('<input type="file">').appendTo($el)
    $input.attr('multiple', '') if @opts.allowMultiple
    $input.on 'change', (e) =>
      @upload $input[0].files
      @_initFileField $el

    @field = $input

  _bind: ->
    # upload the files in the queue
    @on 'uploadcomplete', (e, file) =>
      @files.splice($.inArray(file, @files), 1)
      if @queue.length > 0 and @files.length < @opts.connectionCount
        @upload @queue.shift()
      else if @files.length == 0
        @uploading = false
        @trigger 'emptyqueue'

    # confirm to leave page while uploading
    $(window).on 'beforeunload.uploader-' + @id, (e) =>
      return unless @uploading

      # for ie
      # TODO firefox can not set the string
      e.originalEvent.returnValue = @_locales.leaveConfirm
      # for webkit
      return @_locales.leaveConfirm

  generateFileId: (->
    id = 0
    return ->
      id += 1
  )()

  upload: (file, opts = {}) ->
    return unless file?

    if $.isArray(file) or file instanceof FileList
      @upload(f, opts) for f in file
      return
    else if $(file).is('input:file')
      key = $(file).attr('name')
      opts.fileKey = key if key
      @upload($.makeArray($(file)[0].files), opts)
    else if !file.id or !file.obj
      file = @getFile file

    return unless file and file.obj

    $.extend(file, opts)

    if @files.length >= @opts.connectionCount
      @queue.push file
      return

    return if @trigger('beforeupload', [file]) == false

    @files.push file
    @_xhrUpload file
    @uploading = true

  getFile: (fileObj) ->
    if fileObj instanceof window.File or fileObj instanceof window.Blob
      name = fileObj.fileName ? fileObj.name
    else
      return null

    id: @generateFileId()
    url: @opts.url
    params: @opts.params
    fileKey: @opts.fileKey
    name: name
    size: fileObj.fileSize ? fileObj.size
    ext: if name then name.split('.').pop().toLowerCase() else ''
    obj: fileObj

  _xhrUpload: (file) ->
    formData = new FormData()
    formData.append(file.fileKey, file.obj)
    formData.append("original_filename", file.name)
    formData.append(k, v) for k, v of file.params if file.params

    file.xhr = $.ajax
      url: file.url
      data: formData
      processData: false
      contentType: false
      type: 'POST'
      headers:
        'X-File-Name': encodeURIComponent(file.name)
      xhr: ->
        req = $.ajaxSettings.xhr()
        if req
          (req.upload || req).onprogress = (e) =>
            @progress(e) if $.isFunction(@progress)
        req
      progress: (e) =>
        return unless e.lengthComputable
        @trigger 'uploadprogress', [file, e.loaded, e.total]
      error: (xhr, status, err) =>
        @trigger 'uploaderror', [file, xhr, status]
      success: (result) =>
        @trigger 'uploadprogress', [file, file.size, file.size]
        @trigger 'uploadsuccess', [file, result]
      complete: (xhr, status) =>
        @trigger 'uploadcomplete', [file, xhr.responseText]

  cancel: (file) ->
    unless file.id
      for f in @files
        if f.id == file * 1
          file = f
          break

    # abort xhr will trigger complete event automatically
    file.xhr.abort() if file.xhr
    file.xhr = null

    @files.splice($.inArray(file, @files), 1)
    @uploading = false if @files.length == 0

    @trigger 'uploadcancel', [file]
    file

  readImageFile: (fileObj, callback) ->
    return unless $.isFunction callback

    img = new Image()
    img.onload = ->
      callback img
    img.onerror = ->
      callback false

    if window.FileReader &&
    FileReader.prototype.readAsDataURL &&
    /^image/.test(fileObj.type)
      fileReader = new FileReader()
      fileReader.onload = (e) ->
        img.src = e.target.result
      fileReader.readAsDataURL fileObj
    else
      callback false

  destroy: ->
    @queue.length = 0
    @cancel file for file in @files
    $(window).off '.uploader-' + @id
    @field.remove() if @field

module.exports = QingUploader
