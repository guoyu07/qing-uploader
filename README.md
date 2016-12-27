QingUploader
=============

[![Latest Version](https://img.shields.io/npm/v/qing-uploader.svg)](https://www.npmjs.com/package/qing-uploader)
[![Build Status](https://img.shields.io/travis/mycolorway/qing-uploader.svg)](https://travis-ci.org/mycolorway/qing-uploader)
[![Coveralls](https://img.shields.io/coveralls/mycolorway/qing-uploader.svg)](https://coveralls.io/github/mycolorway/qing-uploader)
[![David](https://img.shields.io/david/mycolorway/qing-uploader.svg)](https://david-dm.org/mycolorway/qing-uploader)
[![David](https://img.shields.io/david/dev/mycolorway/qing-uploader.svg)](https://david-dm.org/mycolorway/qing-uploader#info=devDependencies)
[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/mycolorway/qing-uploader)


A simple upload component based on QingModule.


## Installation

Install via npm:

```bash
npm install --save qing-uploader
```

## Usage

```html
<script type="text/javascript" src="node_modules/jquery/dist/jquery.js"></script>
<script type="text/javascript" src="node_modules/qing-module/dist/qing-module.js"></script>
<script type="text/javascript" src="node_modules/qing-uploader/dist/qing-uploader.js"></script>

<a href="javascript:;" class="link-upload">Click to upload files</a>
```

```js
var uploader = qing.uploader({
  el: '.link-upload',
  url: '/upload/url'
});
```

## Options

__url__  String, Required

Specify the upload API url on server.

__params__  Hash

Specify extra params which will be sent to server with file data.

__fileKey__  String

Specify the name that server will use to get file data.

__connectionCount__  Number, Default: 3

Specify max number of upload connection that can exist simultaneously.

__el__  Selector/Element/jQuery Object, Optional

Specify the container where QingUploader will render a `input:file` field for you. The files selected by this `input:file` field will be uploaded automatically by QingUploader.

__multiple__  Boolean, Default: true

Specify whether the `input:file` field create by QingUploader can select multiple files.

__fileFormat_ String, Default: null

Same as `accept` input attribute.

## Methods

__upload__ ([File Object]/[File Element]/[File Array])

Use this method to start uploading, accept file object or `input:file` element or file object arrays as the only param.

__cancel__ ([File Object]/fileId)

Cancel uploading a specific file and remove it from the upload queue.

__destroy__

Cancel all uploadings and destroy the component instance.


__readImageFile__ ([File Object], callback)

Get base64 data of an image file, which is useful to preview image before uplloading.

## Events

__beforeupload__ (e, file)

Triggered before uploading, return false to cancel uploading.

__uploadprogress__ (e, file, loaded, total)

Triggered multiple times during uploading process.

__uploadsuccess__ (e, file, result)

Triggered after uploading complete and response status is 200.

__uploaderror__ (e, file, xhr, status)

Triggered after uploading complete and response status is not 200.

__uploadcomplete__ (e, file, responseText)

Triggered after uploading complete.

__uploadcancel__ (e, file)

Triggered when a uploading is canceled by `cancel()` method


## Development

Clone repository from github:

```bash
git clone https://github.com/mycolorway/qing-uploader.git
```

Install npm dependencies:

```bash
npm install
```

Run default gulp task to build project, which will compile source files, run test and watch file changes for you:

```bash
gulp
```

Now, you are ready to go.

## Publish

If you want to publish new version to npm and bower, please make sure all tests have passed before you publish new version, and you need do these preparations:

* Check the version number in `bower.json` and `package.json`.

* Add new release information in `CHANGELOG.md`. The format of markdown contents will matter, because build scripts will get version and release content from this file by regular expression. You can follow the format of the older release information.

* Put your [personal API tokens](https://github.com/blog/1509-personal-api-tokens) in `/.token`, which is required by the build scripts to request [Github API](https://developer.github.com/v3/) for creating new release.

* Commit changes and push.

Now you can run `gulp publish` task, which will request Github API to create new release.

If everything goes fine, you can see your release at [https://github.com/mycolorway/qing-uploader/releases](https://github.com/mycolorway/qing-uploader/releases). At the End you can publish new version to npm with the command:

```bash
npm publish
```

Please be careful with the last step, because you cannot delete or republish a release on npm.
