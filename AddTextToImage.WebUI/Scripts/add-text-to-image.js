﻿var textAsImage = (function () {

    var errorMessage = (function (){
        function show(message) {

            $("#error-message").text(message).show();

            setTimeout(function () { $("#error-message").hide(); }, 5000);
        }
    
        return {
            show: show
        }
    })();

    var model = (function () {

        var id = 0;
        var canvas;
        var modelItems = [];
        var selectedItem = null;
        var selectedElement = null;
        var elementStart;
        var mouseStart;
        var svgPoint;


        var ModelItem = function () {

            this.id = 0;
            this.modelId = 0;
            this.itemType = 0;
            this.positionLeft = 0;
            this.positionTop = 0;
            this.text = "Enter text";
            this.templateId = 1;
            this.fontSize = 21;
            this.fontColor = "#FF00FF";
            this.rotation = 0;
        };

        ModelItem.prototype.getParameredUrl = function () {

            return "?Text=" + encodeURIComponent(this.text) + "&FontSize=" + this.fontSize + "&TemplateId=" + this.templateId + "&ItemType=" + this.itemType + "&FontColor=" + encodeURIComponent(this.fontColor) + "&Rotation=" + encodeURIComponent(this.rotation);
        }

        ModelItem.prototype.getData = function () {

            return "ModelId=" + this.modelId + "&Id=" + this.id + "&ItemType=" + this.itemType + "&PositionLeft=" + this.positionLeft + "&PositionTop=" + this.positionTop + "&Text=" + encodeURIComponent(this.text) + "&FontSize=" + this.fontSize + "&TemplateId=" + this.templateId + "&FontColor=" + encodeURIComponent(this.fontColor) + "&Rotation=" + encodeURIComponent(this.rotation);
        }

        ModelItem.prototype.select = function () {

            $("#rect" + this.id).show();
            $("#del" + this.id).show();
        }

        ModelItem.prototype.deselect = function () {

            $("#rect" + this.id).hide();
            $("#del" + this.id).hide();
        }

        ModelItem.prototype.updateDatabase = function () {

            $.ajax({
                url: basePath + "api/ModelItem/Update/",
                type: 'POST',
                dataType: 'json',
                data: this.getData(),

                error: function (xhr, textStatus, errorThrown) {
                    errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                }
            });
        }

        ModelItem.prototype.change = function () {

            this.updateDatabase();

            $("#img" + this.id)[0].setAttributeNS('http://www.w3.org/1999/xlink', 'href', basePath + "api/Image/ModelItem/" + this.id + "/" + this.getParameredUrl());

            $("#hidden-img" + this.id).attr('src', basePath + "api/Image/ModelItem/" + this.id + "/" + this.getParameredUrl());
        }


        var textSelector = (function () {

            var selectedItemId = 0;
            var selectedGalleryId = 0;
            var textGallery = [];
            var scrollTop = 0
            var dialog;

            function init() {

                loadData();

                selectedItemId = $("#btn-template").data("text-template-id");              
                selectedGalleryId = $("#btn-template").data("text-template-gallery-id");  

                dialog = $("#text-templates-dialog").dialog({
                    title: "Select template",
                    autoOpen: false,
                    dialogClass: "xui-dialog",
                    modal: true,
                    buttons: {
                        Cancel: function() {
                            dialog.dialog( "close" );
                        }
                    }
                });

                $("#btn-template").on("click", function () {

                    //xxxx id not index ??????

                    $("#text-gallery-list").val(selectedGalleryId);

                    showGallery();

                    dialog.dialog("open");

                    $("#text-templates-holder").scrollTop(scrollTop);

                });

                $("#text-gallery-list").on("change", function () {

                    selectedGalleryId = $("#text-gallery-list").val(); //XXXX ParseInt
                    showGallery();
                });
            }

            function loadData() {

                $.ajax({
                    type: "GET",
                    url: basePath + "api/TextGallery/List/",
                    dataType: 'json',

                    success: function (data) {

                        data.forEach(function (gallery) {

                            var tg = {
                                id: gallery.Id,
                                name: gallery.Name,
                                items: []
                            }

                            gallery.Items.forEach(function (item) {

                                tg.items.push({
                                    id: item.Id,
                                    name: item.Name,
                                    textColor1: argbToRGB(item.TextColor1)
                                });
                            })

                            textGallery[tg.id] = tg;
                        })
                    },

                    error: function (xhr, textStatus, errorThrown) {
                        errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                    }
                });
            }

            function showGallery() {

                if ($("#text-gallery")) {
                    $("#text-gallery").remove();
                }

                var $textTemplateGallery = $("<div>", { id: "text-gallery" });

                var i = 0;
                var indx = 0;

                textGallery[selectedGalleryId].items.forEach(function (item) {

                    var $div = $("<div>", { id: "text-template" + item.id });

                    $div.attr({
                        "data-id": item.id,
                        "data-name": item.name,
                        "data-text-color1": item.textColor1
                    });

                    if (item.id == selectedItemId) {

                        $div.addClass("text-template-item-selected");

                        indx = i;
                    }

                    $div.append($("<img>", { 
                        id: "text-template-img" + item.id, 
                        src: basePath + "api/TextTemplate/Image/" + item.id + "/"
                    }));


                    // Create separately
                    $div.on("click", function (e) {

                        e.stopPropagation();

                        selectedItemId = $(this).data("id")
                        $("#template-name").text($(this).data("name"));
                        $("#font-color").spectrum("set", $div.attr("data-text-color1"));

                        if (selectedItem != null) {
                            selectedItem.templateId = $(this).data("id");
                            selectedItem.fontColor = $div.attr("data-text-color1");
                            selectedItem.change();
                        }

                        dialog.dialog("close");
                    })

                    $textTemplateGallery.append($div);

                    i++;
                });

                $("#text-templates-holder").append($textTemplateGallery);

                scrollTop = 0;
                if (indx > 2) {
                    scrollTop = indx * 106;
                }
            }

            function setTextTemplate(itemId) {

                textGallery.forEach(function (gallery) {

                    gallery.items.forEach(function (item) {

                        if (item.id == itemId) {

                            selectedItemId = itemId;
                            selectedGalleryId = gallery.id;
                            $("#template-name").text(item.name);
                            $("#font-color").spectrum("set", item.textColor1);
                        }
                    })
                })
            }

            function getSelectedItemId() {
                return selectedItemId;
            }

            return {
                init: init,
                setTextTemplate: setTextTemplate,
                getSelectedItemId: getSelectedItemId
            }

        })();

        var clipartSelector = (function () {

            var selectedGallery = 1;
            var cliaprtGallery = [];
            var dialog;

            function init() {

                loadData();

                selectedGallery = $("#clipart-gallery-list  option:first").val();

                dialog = $("#clipart-template-dialog").dialog({
                    title: "Select clipart",
                    autoOpen: false,
                    dialogClass: "xui-dialog",
                    modal: true,
                    buttons: {
                        Cancel: function () {
                            dialog.dialog("close");
                        }
                    }
                });

                $("#btn-template-clipart").on("click", function () {

                    $("#clipart-gallery-list").val(selectedGallery);

                    showGallery();

                    dialog.dialog("open");
                });

                $("#clipart-gallery-list").on("change", function () {

                    selectedGallery = $("#clipart-gallery-list").val();

                    showGallery();
                });
            }

            function loadData() {

                $.ajax({
                    type: "GET",
                    url: basePath + "api/ClipartGallery/List/",
                    dataType: 'json',

                    success: function (data) {

                        data.forEach(function (gallery) {

                            var cg = {
                                id: gallery.Id,
                                name: gallery.Name,
                                items: []
                            };

                            gallery.Items.forEach(function (item) {

                                cg.items.push({
                                    id: item.Id,
                                    name: item.Name,
                                    text: item.Text,
                                    textColor1: argbToRGB(item.TextColor1)
                                });
                            })

                            cliaprtGallery[cg.id] = cg;
                        })
                    },

                    error: function (xhr, textStatus, errorThrown) {
                        errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                    }
                });
            }

            function showGallery() {

                if ($("#clipart-gallery")) {
                    $("#clipart-gallery").remove();
                }

                var $clipartGallery = $("<div>", {
                    id: "clipart-gallery"
                });

                cliaprtGallery[selectedGallery].items.forEach(function (item) {

                    var $div = $("<div>", {
                        id: "clipart-template" + item.id,
                        on: {                     
                            click: onClickClipart
                        }
                    });

                    $div.attr({
                        "data-id": item.id,
                        "data-text": item.text,
                        "data-text-color1": item.textColor1
                    });

                    $div.append($("<img>", { 
                        id: "clipart-template-img" + item.id, 
                        src: basePath + "api/ClipartTemplate/Image/" + item.id + "/"
                    }));

                    $clipartGallery.append($div);
                });

                $("#clipart-templates-holder").append($clipartGallery);
            }

            function onClickClipart(e) {

                e.stopPropagation();

                $div = $(e.target).parent();

                $("#font-color").spectrum("set", $div.attr("data-text-color1"));

                var modelItem = new ModelItem();
                modelItem.id = 0;
                modelItem.modelId = id;
                modelItem.itemType = 1;
                modelItem.text = $div.attr("data-text");
                modelItem.templateId = $div.attr("data-id");
                modelItem.fontSize = $("#font-size").val();
                modelItem.fontColor = $div.attr("data-text-color1");
                modelItem.rotation = $("#rotation").val();

                $.ajax({
                    url: basePath + "api/Model/AddModelItem/",
                    type: 'PUT',
                    dataType: 'json',
                    data: modelItem.getData(),
                    success: function (modelItemId) {

                        modelItem.id = modelItemId;
                        addModelItem(modelItem);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                    }
                });

                dialog.dialog("close");
            }

            return {
                init: init
            }
        })();


        function init() {

            textSelector.init();
            clipartSelector.init();

            canvas = document.getElementById("canvas");
            svgPoint = canvas.createSVGPoint();

            $(canvas).on("click", function () {

                deselectItem();
                $("#sample-text").val("");
            });

            $("#font-size").on("change", function () {

                if (selectedItem != null) {
                    selectedItem.fontSize = $("#font-size").val();
                    selectedItem.change();
                }
            });

            $("#rotation").on("change", function () {

                if (selectedItem != null) {
                    selectedItem.rotation = $("#rotation").val().valueOf();
                    selectedItem.change();
                }
            });

            $("#font-color").spectrum({
                color: "#FF0000",
                chooseText: "Ok",

                change: function (color) {

                    if (selectedItem != null) {
                        selectedItem.fontColor = color.toHexString();
                        selectedItem.change();
                    }
                }
            });

            $("#font-color").spectrum("set", $("#btn-template").data("text-template-text-color1"));

            $("#sample-text").on("input", function () {

                if (selectedItem != null) {
                    selectedItem.text = $("#sample-text").val();
                    selectedItem.change();
                }
            });

            $("#btn-add-text").on("click", function () {

                var modelItem = new ModelItem();
                modelItem.id = 0;
                modelItem.modelId = id;
                modelItem.itemType = 0;
                modelItem.text = $("#sample-text").val();
                modelItem.templateId = textSelector.getSelectedItemId();
                modelItem.fontSize = $("#font-size").val();
                modelItem.fontColor = $("#font-color").spectrum("get").toHexString();
                modelItem.rotation = $("#rotation").val();

                $.ajax({
                    url: basePath + "api/Model/AddModelItem/",
                    type: 'PUT',
                    dataType: 'json',
                    data: modelItem.getData(),

                    success: function (modelItemId) {

                        modelItem.id = modelItemId;

                        addModelItem(modelItem);
                    },

                    error: function (xhr, textStatus, errorThrown) {
                        errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                    }
                });
            });
        }

        function populate(modelId, modelWidth, modelHeight) {

            id = modelId;

            var svgimg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            svgimg.setAttribute('id', "model" + id);
            svgimg.setAttribute('height', "100%");
            svgimg.setAttribute('width', "100%");
            svgimg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', basePath + "api/Model/Image/" + id + "/");
            svgimg.setAttribute('x', '0');
            svgimg.setAttribute('y', '0');

            canvas.setAttribute("style", "margin-left: auto; margin-right: auto; max-width: " + modelWidth + "px;");
            canvas.setAttribute("viewBox", "0 0 " + modelWidth + " " + modelHeight);

            canvas.appendChild(svgimg);

            if (detectIE()) {

                var imgHeigth = modelHeight;

                if (modelWidth - $("#image-main").width() > 0){

                    imgHeigth = modelHeight * $("#image-main").width() / modelWidth;
                }

                $("#image-main").css("height", imgHeigth + "px");
            }


            $("#form-save-result").attr("action", basePath + "api/Image/Result/" + id);
        }

        function populateFromSample(data) {

            populate(data.Id, data.ImageWidth, data.ImageHeight);

            for (var i = 0; i < data.Items.length; i++) {
                var modelItem = data.Items[i];

                var mi = new ModelItem();
                mi.id = modelItem.Id;
                mi.modelId = data.Id;
                mi.itemType = modelItem.ItemType;
                mi.text = modelItem.Text;
                mi.fontSize = modelItem.FontSize;
                mi.templateId = modelItem.TemplateId;
                mi.fontColor = modelItem.FontColor;
                mi.rotation = modelItem.Rotation;
                mi.positionLeft = modelItem.PositionLeft;
                mi.positionTop = modelItem.PositionTop;

                addModelItem(mi);

                if (i == data.Items.length - 1) {

                    mi.select();

                    textSelector.setTextTemplate(mi.templateId);
                }
            }

        }

        function addModelItem(modelItem) {

            var svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            svgGroup.setAttribute("id", "img-group" + modelItem.id);

            var svgRect = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            svgRect.setAttribute('id', "rect" + modelItem.id);
            svgRect.setAttribute('x', modelItem.positionLeft);
            svgRect.setAttribute('y', modelItem.positionTop);
            svgRect.setAttribute('height', "0");
            svgRect.setAttribute('width', "0");
            svgRect.setAttribute('stroke', "red");
            svgRect.setAttribute('stroke-width', "1");
            svgRect.setAttribute('stroke-dasharray', "1");
            svgRect.setAttribute('fill-opacity', "0.4");
            svgRect.setAttribute('fill', "none");
            svgRect.style.display = "none";

            svgGroup.appendChild(svgRect);

            var svgMainImg = document.createElementNS("http://www.w3.org/2000/svg", 'image');
            svgMainImg.setAttribute('id', "img" + modelItem.id);
            svgMainImg.setAttribute('height', "0");
            svgMainImg.setAttribute('width', "0");
            svgMainImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', basePath + "api/Image/ModelItem/" + modelItem.id + "/" + modelItem.getParameredUrl());
            svgMainImg.setAttribute('x', modelItem.positionLeft);
            svgMainImg.setAttribute('y', modelItem.positionTop);
            svgMainImg.style.cursor = "move";

            svgGroup.appendChild(svgMainImg);

            var svgDelImg = document.createElementNS("http://www.w3.org/2000/svg", 'image');
            svgDelImg.setAttribute('id', "del" + modelItem.id);
            svgDelImg.setAttribute('height', "16");
            svgDelImg.setAttribute('width', "16");
            svgDelImg.setAttributeNS('http://www.w3.org/1999/xlink', 'href', basePath + "Content/Images/delete.png");
            svgDelImg.setAttribute('x', modelItem.positionLeft);
            svgDelImg.setAttribute('y', modelItem.positionTop - 16);
            svgDelImg.style.display = "none";
            svgDelImg.style.cursor = "pointer";

            svgGroup.appendChild(svgDelImg);

            canvas.appendChild(svgGroup);

            var $img = $("<img>", {
                id: "hidden-img" + modelItem.id,
                src: basePath + "api/Image/ModelItem/" + modelItem.id + "/" + modelItem.getParameredUrl()
            });

            $("#hidden-images").append($img);

            $($img).on("load", function (e) {

                var id = this.id.substring(10);

                $("#img" + id).attr("width", this.width);
                $("#img" + id).attr("height", this.height);
                $("#rect" + id).attr("width", this.width);
                $("#rect" + id).attr("height", this.height);
                $("#del" + id).attr("x", parseInt($("#del" + id).attr("x")) + this.width);
            })

            $(svgMainImg).on("mousedown", onMouseDown);
            $(svgMainImg).on("mouseup", onMouseUp);
            $(svgMainImg).on("mouseover", onMouseOver);
            $(svgMainImg).on("mouseout", onMouseOut);
            $(svgMainImg).on("click", onClick);

            $(svgDelImg).on("click", function (e) {

                e.stopPropagation();

                if (selectedItem != null) {

                    $.ajax({
                        url: basePath + "api/ModelItem/Delete/",
                        type: 'DELETE',
                        dataType: 'json',
                        data: selectedItem.getData(),
                        success: function () {

                            $("#img-group" + selectedItem.id).remove();

                            modelItems.splice($.inArray(selectedItem, modelItems), 1);
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                        }
                    });
                }
            })

            modelItems.push(modelItem);
            selectItem(modelItem.id);
        }

        function selectItem(id) {

            deselectItem();

            modelItems.forEach(function (item) {

                if (item.id == id) {
                    selectedItem = item;
                }
            });

            if (selectedItem != null) {
                selectedItem.select();
            }

            selectedElement = document.getElementById("img" + id);
        }

        function deselectItem() {

            if (selectedItem != null) {

                selectedItem.deselect(); //ToDo ???????????
                selectedItem = null;
            }
        }

        function onMouseDown(e) {

            e.stopPropagation();
            e.preventDefault();

            mouseStart = cursorPoint(e);
            elementStart = { x: e.target['x'].animVal.value, y: e.target['y'].animVal.value };

            $(e.target).on("mousemove", onMouseMove);

            selectItem(e.target.id.substring(3));

            if (selectedItem != null) {

                $("#sample-text").val(selectedItem.text);
                $("#font-size").val(selectedItem.fontSize);
                $("#font-color").spectrum("set", selectedItem.fontColor);
                $("#rotation").val(selectedItem.rotation);

                textSelector.setTextTemplate(selectedItem.templateId);
            }
        }

        function onMouseMove(e) {

            e.stopPropagation();
            e.preventDefault();

            var id = e.target.id.substring(3);

            var current = cursorPoint(e);
            svgPoint.x = current.x - mouseStart.x;
            svgPoint.y = current.y - mouseStart.y;

            var m = e.target.getTransformToElement(canvas).inverse();

            m.e = m.f = 0;
            svgPoint = svgPoint.matrixTransform(m);

            $("#img" + id).attr({ "x": elementStart.x + svgPoint.x, 'y': elementStart.y + svgPoint.y });
            $("#rect" + id).attr({"x": elementStart.x + svgPoint.x, 'y': elementStart.y + svgPoint.y});
            $("#del" + id).attr({"x": elementStart.x + svgPoint.x + parseInt($("#img" + id).attr("width")), 'y': elementStart.y + svgPoint.y - 16});
            //$("#del" + id).attr({ "x": elementStart.x + svgPoint.x + parseInt($("#img" + id).attr("width")) - 16, 'y': elementStart.y + svgPoint.y });

            if (selectedItem != null) {

                selectedItem.positionLeft = Math.round(elementStart.x + svgPoint.x);
                selectedItem.positionTop = Math.round(elementStart.y + svgPoint.y);
            }
        }

        function onMouseUp(e) {

            e.stopPropagation();
            e.preventDefault();

            $(e.target).off("mousemove", onMouseMove);

            if (selectedElement != null) {
                selectedElement = null;
            }

            if (selectedItem != null) {
                selectedItem.updateDatabase();
            }
        }

        function onMouseOver(e) {

            //e.stopPropagation();
            //e.preventDefault();

            //$("#del" + e.target.id.substring(3)).show();
        }

        function onMouseOut(e) {

            //e.stopPropagation();
            //e.preventDefault();

            //$("#del" + e.target.id.substring(3)).hide();
        }

        function onClick(e) {

            e.stopPropagation();
            e.preventDefault();
        }

        //ToDo Delete
        function disableAllItems() {

            $("#sample-text").prop('disabled', true);
            $("#btn-add-text").prop('disabled', true).addClass('disable');
            $("#btn-template").prop('disabled', true).addClass('disable');
            $("#font-size").prop('disabled', true);
            $("#rotation").prop('disabled', true);
            $("#font-color").prop('disabled', true);
            $("#btn-template-clipart").prop('disabled', true).addClass('disable');
            $("#font-size").prop('disabled', true);
        }

        //ToDo Delete
        function enableAllItems() {

            $("#sample-text").prop('disabled', false);
            $("#btn-add-text").prop('disabled', false).removeClass('disable');
            $("#btn-template").prop('disabled', false).removeClass('disable');
            $("#font-size").prop('disabled', false);
            $("#rotation").prop('disabled', false);
            $("#font-color").prop('disabled', false);
            $("#btn-template-clipart").prop('disabled', false).removeClass('disable');
            $("#font-size").prop('disabled', false);
        }


        function cursorPoint(evt) {

            svgPoint.x = evt.clientX;
            svgPoint.y = evt.clientY;
            return svgPoint.matrixTransform(canvas.getScreenCTM().inverse());
        }

        function argbToRGB(color) {

            return '#' + ('000000' + (color & 0xFFFFFF).toString(16)).slice(-6);
        }

        function detectIE() {
            var ua = window.navigator.userAgent;

            var msie = ua.indexOf('MSIE ');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }

            var trident = ua.indexOf('Trident/');
            if (trident > 0) {
                // IE 11 => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }

            var edge = ua.indexOf('Edge/');
            if (edge > 0) {
                // Edge (IE 12+) => return version number
                return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
            }

            // other browser
            return false;
        }

        return {
            init: init,
            populate: populate,
            populateFromSample: populateFromSample,
            addModelItem: addModelItem
        }
    })();

    var sampleSelector = (function () {

        var model = null;
        var samplePageIndex = 0;
        var sampleTotalPage = 0;

        var init = function (modelParam) {

            model = modelParam;

            sampleTotalPage = $('#samples-holder').data("sample-total-page");

            $("#btn-sample-prev").on("click", function (e) {

                if (samplePageIndex > 0) {

                    changeSamplePage(-1);
                }
            });

            $("#btn-sample-next").on("click", function (e) {

                if (samplePageIndex < sampleTotalPage) {

                    changeSamplePage(1);
                }
            });

            $(".sample-item").on("click", function (event) {

                var id = $(this).children().first().data("id");

                $.ajax({
                    url: basePath + "api/Model/CreateFromSample/" + id + "/", //XXXX
                    type: "PUT",
                    dataType: "json",
                    data: "templateId=" + id,

                    success: function (data) {
                        $("#select-image").remove();
                        $("#image-worker").show();

                        model.populateFromSample(data);
                    },

                    error: function (xhr, textStatus, errorThrown) {
                        errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                    }
                });
            });
        }

        function changeSamplePage(pageIncrement) {

            samplePageIndex += pageIncrement;

            if (samplePageIndex == 0){
                $("#btn-sample-prev").prop('disabled', true).addClass('disable');
            }
            else {
                $("#btn-sample-prev").prop('disabled', false).removeClass('disable');
            }

            if (samplePageIndex == sampleTotalPage) {
                $("#btn-sample-next").prop('disabled', true).addClass('disable');
            }
            else {
                $("#btn-sample-next").prop('disabled', false).removeClass('disable');
            }

            $.ajax({
                type: "GET",
                url: basePath + "api/Sample/List/",
                dataType: 'json',
                data: "samplePageIndex=" + samplePageIndex, //ToDo

                success: function (sampleIds) {

                    sampleIds.forEach(function (item, i) {
                        $("#sample" + i).attr("src", basePath + "api/Sample/Thumbnail/" + item + "/");
                        $("#sample" + i).attr("data-id", item); //ToDo
                    })
                },

                error: function (xhr, textStatus, errorThrown) {
                    errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                }
            });
        }

        return {
            init: init,
        }
    })();

    var fileUpload = (function () {

        var model = null;

        function uploadFile(files) {

            var data = new FormData();

            // Add the uploaded image content to the form data collection
            if (files.length > 0) {
                data.append("UploadedImage", files[0]);
            }

            $.ajax({
                type: "POST",
                url: basePath + "api/Model/UploadFile/",
                contentType: false,
                processData: false,
                data: data,
                //timeout:5000,

                success: function (data) {

                    $("#select-image").remove();
                    $("#image-worker").show();

                    model.populate(data.Id, data.ImageWidth, data.ImageHeight);
                },

                error: function (xhr, textStatus, errorThrown) {
                    errorMessage.show("The server encountered an error. Detailed description: " + errorThrown);
                }
            });
        }


        function init(modelParam) {

            model = modelParam;

            $('#drop-file').on('dragover', function (e) {

                e.preventDefault();
                e.stopPropagation();
            });

            $('#drop-file').on('dragenter', function (e) {

                e.preventDefault();
                e.stopPropagation();
            });

            $('#drop-file').on('drop', function (e) {

                if (e.originalEvent.dataTransfer) {

                    if (e.originalEvent.dataTransfer.files.length) {

                        e.preventDefault();
                        e.stopPropagation();

                        uploadFile(e.originalEvent.dataTransfer.files);
                    }
                }
            });

            $('#fileUpload').on('change', function () {

                uploadFile($("#fileUpload").get(0).files);
            });
        }

        return {
            init: init,
        }
    })();
 
    function init() {

        model.init();
        sampleSelector.init(model);
        fileUpload.init(model);
    };

    return {
        init: init
    }
})();

$(function () {
    textAsImage.init();
});