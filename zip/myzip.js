(function(obj) {

    var doclist=new Array();

    var requestFileSystem = obj.webkitRequestFileSystem || obj.mozRequestFileSystem || obj.requestFileSystem;

    function onerror(message) {
        alert(message);
    }

    function createTempFile(callback) {
        var tmpFilename = "tmp.dat";
        requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, function(filesystem) {
            function create() {
                filesystem.root.getFile(tmpFilename, {
                    create: true
                }, function(zipFile) {
                    callback(zipFile);
                });
            }

            filesystem.root.getFile(tmpFilename, null, function(entry) {
                entry.remove(create, create);
            }, create);
        });
    }

    var model = (function() {
        var URL = obj.webkitURL || obj.mozURL || obj.URL;

        return {
            getEntries: function(file, onend) {
                zip.createReader(new zip.BlobReader(file), function(zipReader) {
                    zipReader.getEntries(onend);
                }, onerror);
            },
            getEntryFile: function(entry, creationMethod, onend, onprogress) {
                var writer, zipFileEntry;

                function getData() {
                    entry.getData(writer, function(blob) {
                        var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
                        onend(blobURL);
                    }, onprogress);
                }

                if (creationMethod == "Blob") {
                    writer = new zip.BlobWriter();
                    getData();
                } else {
                    createTempFile(function(fileEntry) {
                        zipFileEntry = fileEntry;
                        writer = new zip.FileWriter(zipFileEntry);
                        getData();
                    });
                }
            }
        };
    })();

    (function() {
        var fileInput = document.getElementById("file-input");
        var unzipProgress = document.createElement("progress");
        var fileList = document.getElementById("file-list");
        var creationMethodInput = document.getElementById("creation-method-input");

        function download(entry, li, a) {
            model.getEntryFile(entry, creationMethodInput.value, function(blobURL) {
                var clickEvent = document.createEvent("MouseEvent");
                if (unzipProgress.parentNode)
                    unzipProgress.parentNode.removeChild(unzipProgress);
                unzipProgress.value = 0;
                unzipProgress.max = 0;
                clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                a.href = blobURL;
                a.download = entry.filename;
                a.dispatchEvent(clickEvent);
            }, function(current, total) {
                unzipProgress.value = current;
                unzipProgress.max = total;
                li.appendChild(unzipProgress);
            });
        }

        if (typeof requestFileSystem == "undefined")
            creationMethodInput.options.length = 1;
        fileInput.addEventListener('change', function() {
            fileInput.disabled = true;
           
            model.getEntries(fileInput.files[0], function(entries) {
                fileList.innerHTML = "";
                entries.forEach(function(entry) {

                    // get first entry content as text
                    entry.getData(new zip.TextWriter(), function(text) {
                        // text contains the entry data as a String
                        if(text.indexOf("Mac OS X") >= 0||entry.filename.indexOf(".jpeg")>=0){
                            return;
                        }
                       // console.log(text);
                        var doc = new DOMParser({
                            /**
                             * locator is always need for error position info
                             */
                            locator:{},
                            /**
                             * you can override the errorHandler for xml parser
                             * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
                             */
                            errorHandler:{
                                warning:function(w){
                                    console.warn(w);
                                },
                                error:function(error){
                                     console.log(entry.filename);
                                    //console.log(error);
                                },
                                fatalError:function(fatalError){

                                }}
                            //only callback model
                            //errorHandler:function(level,msg){console.log(level,msg)}
                        }).parseFromString(text,'text/xml');
                        
                        doclist.push(doc);
                        // close the zip reader
                       // reader.close(function() {
                            // onclose callback
                      //  });

                    }, function(current, total) {
                        // onprogress callback
                    });

                    var li = document.createElement("li");
                    var a = document.createElement("a");
                    a.textContent = entry.filename;
                    a.href = "#";
                    a.addEventListener("click", function(event) {
                        if (!a.download) {
                            download(entry, li, a);
                            event.preventDefault();
                            return false;
                        }
                    }, false);
                    li.appendChild(a);
                    fileList.appendChild(li);
                });
            });
        }, false);
    })();

})(this);