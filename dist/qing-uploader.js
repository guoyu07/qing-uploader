/**
 * qing-uploader v1.0.0
 * http://mycolorway.github.io/qing-uploader
 *
 * Copyright Mycolorway Design
 * Released under the MIT license
 * http://mycolorway.github.io/qing-uploader/license.html
 *
 * Date: 2016-12-27
 */
;(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('jquery'),require('qing-module'));
  } else {
    root.QingUploader = factory(root.jQuery,root.QingModule);
  }
}(this, function ($,QingModule) {
var define, module, exports;
var b = require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"qing-uploader":[function(require,module,exports){
var QingUploader,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

QingUploader = (function(superClass) {
  extend(QingUploader, superClass);

  QingUploader.count = 0;

  QingUploader.opts = {
    el: null,
    multiple: true,
    fileFormat: null,
    url: '',
    params: null,
    fileKey: 'upload_file',
    connectionCount: 3,
    locales: null
  };

  QingUploader.locales = {
    leaveConfirm: 'There is file being uploaded, are you sure to leave this page?'
  };

  function QingUploader(opts) {
    QingUploader.__super__.constructor.apply(this, arguments);
    this.opts = $.extend({}, QingUploader.opts, opts);
    this._locales = $.extend({}, QingUploader.locales, this.opts.locales);
    this.files = [];
    this.queue = [];
    this.uploading = false;
    this.id = ++QingUploader.count;
    if (this.opts.el) {
      this._initFileField(this.opts.el);
    }
    this._bind();
  }

  QingUploader.prototype._initFileField = function(el) {
    var $el, $input;
    $el = $(el);
    if (!($el.length > 0)) {
      return;
    }
    $input = $el.find('input:file');
    if ($input.length > 0) {
      $input.remove();
    }
    $input = $('<input type="file">').appendTo($el);
    if (this.opts.multiple) {
      $input.attr('multiple', '');
    }
    if (this.opts.fileFormat) {
      $input.attr('accept', this.opts.fileFormat);
    }
    $input.on('change', (function(_this) {
      return function(e) {
        _this.upload($input[0].files);
        return _this._initFileField($el);
      };
    })(this));
    return this.field = $input;
  };

  QingUploader.prototype._bind = function() {
    this.on('uploadcomplete', (function(_this) {
      return function(e, file) {
        _this.files.splice($.inArray(file, _this.files), 1);
        if (_this.queue.length > 0 && _this.files.length < _this.opts.connectionCount) {
          return _this.upload(_this.queue.shift());
        } else if (_this.files.length === 0) {
          _this.uploading = false;
          return _this.trigger('emptyqueue');
        }
      };
    })(this));
    return $(window).on('beforeunload.uploader-' + this.id, (function(_this) {
      return function(e) {
        if (!_this.uploading) {
          return;
        }
        e.originalEvent.returnValue = _this._locales.leaveConfirm;
        return _this._locales.leaveConfirm;
      };
    })(this));
  };

  QingUploader.prototype.generateFileId = (function() {
    var id;
    id = 0;
    return function() {
      return id += 1;
    };
  })();

  QingUploader.prototype.upload = function(file, opts) {
    var f, i, key, len;
    if (opts == null) {
      opts = {};
    }
    if (file == null) {
      return;
    }
    if ($.isArray(file) || file instanceof FileList) {
      for (i = 0, len = file.length; i < len; i++) {
        f = file[i];
        this.upload(f, opts);
      }
      return;
    } else if ($(file).is('input:file')) {
      key = $(file).attr('name');
      if (key) {
        opts.fileKey = key;
      }
      this.upload($.makeArray($(file)[0].files), opts);
    } else if (!file.id || !file.obj) {
      file = this.getFile(file);
    }
    if (!(file && file.obj)) {
      return;
    }
    $.extend(file, opts);
    if (this.files.length >= this.opts.connectionCount) {
      this.queue.push(file);
      return;
    }
    if (this.trigger('beforeupload', [file]) === false) {
      return;
    }
    this.files.push(file);
    this._xhrUpload(file);
    return this.uploading = true;
  };

  QingUploader.prototype.getFile = function(fileObj) {
    var name, ref, ref1;
    if (fileObj instanceof window.File || fileObj instanceof window.Blob) {
      name = (ref = fileObj.fileName) != null ? ref : fileObj.name;
    } else {
      return null;
    }
    return {
      id: this.generateFileId(),
      url: this.opts.url,
      params: this.opts.params,
      fileKey: this.opts.fileKey,
      name: name,
      size: (ref1 = fileObj.fileSize) != null ? ref1 : fileObj.size,
      ext: name ? name.split('.').pop().toLowerCase() : '',
      obj: fileObj
    };
  };

  QingUploader.prototype._xhrUpload = function(file) {
    var formData, k, ref, v;
    formData = new FormData();
    formData.append(file.fileKey, file.obj);
    formData.append("original_filename", file.name);
    if (file.params) {
      ref = file.params;
      for (k in ref) {
        v = ref[k];
        formData.append(k, v);
      }
    }
    return file.xhr = $.ajax({
      url: file.url,
      data: formData,
      processData: false,
      contentType: false,
      type: 'POST',
      headers: {
        'X-File-Name': encodeURIComponent(file.name)
      },
      xhr: function() {
        var req;
        req = $.ajaxSettings.xhr();
        if (req) {
          (req.upload || req).onprogress = (function(_this) {
            return function(e) {
              if ($.isFunction(_this.progress)) {
                return _this.progress(e);
              }
            };
          })(this);
        }
        return req;
      },
      progress: (function(_this) {
        return function(e) {
          if (!e.lengthComputable) {
            return;
          }
          return _this.trigger('uploadprogress', [file, e.loaded, e.total]);
        };
      })(this),
      error: (function(_this) {
        return function(xhr, status, err) {
          return _this.trigger('uploaderror', [file, xhr, status]);
        };
      })(this),
      success: (function(_this) {
        return function(result) {
          _this.trigger('uploadprogress', [file, file.size, file.size]);
          return _this.trigger('uploadsuccess', [file, result]);
        };
      })(this),
      complete: (function(_this) {
        return function(xhr, status) {
          return _this.trigger('uploadcomplete', [file, xhr.responseText]);
        };
      })(this)
    });
  };

  QingUploader.prototype.cancel = function(file) {
    var f, i, len, ref;
    if (!file.id) {
      ref = this.files;
      for (i = 0, len = ref.length; i < len; i++) {
        f = ref[i];
        if (f.id === file * 1) {
          file = f;
          break;
        }
      }
    }
    if (file.xhr) {
      file.xhr.abort();
    }
    file.xhr = null;
    this.files.splice($.inArray(file, this.files), 1);
    if (this.files.length === 0) {
      this.uploading = false;
    }
    this.trigger('uploadcancel', [file]);
    return file;
  };

  QingUploader.prototype.readImageFile = function(fileObj, callback) {
    var fileReader, img;
    if (!$.isFunction(callback)) {
      return;
    }
    img = new Image();
    img.onload = function() {
      return callback(img);
    };
    img.onerror = function() {
      return callback(false);
    };
    if (window.FileReader && FileReader.prototype.readAsDataURL && /^image/.test(fileObj.type)) {
      fileReader = new FileReader();
      fileReader.onload = function(e) {
        return img.src = e.target.result;
      };
      return fileReader.readAsDataURL(fileObj);
    } else {
      return callback(false);
    }
  };

  QingUploader.prototype.destroy = function() {
    var file, i, len, ref;
    this.queue.length = 0;
    ref = this.files;
    for (i = 0, len = ref.length; i < len; i++) {
      file = ref[i];
      this.cancel(file);
    }
    $(window).off('.uploader-' + this.id);
    if (this.field) {
      return this.field.remove();
    }
  };

  return QingUploader;

})(QingModule);

module.exports = QingUploader;

},{}]},{},[]);

return b('qing-uploader');
}));
