class window.BookingPlugin extends window.LimePlugin
  init: ->
    @name = 'BookingPlugin'
    annotation = undefined
    console.info "Initialize BusinessPlugin"

    for annotation in @lime.annotations
      if annotation.resource.value.indexOf("#BusinessEntity") > 0 and annotation.relation.value in ['http://connectme.at/ontology#explicitlyShows', 'http://connectme.at/ontology#explicitlyMentions', 'http://connectme.at/ontology#implicitlyShows' , 'http://connectme.at/ontology#implicitlyMentions', 'http://connectme.at/ontology#hasContent']
        # if annotation.resource.value.indexOf("geonames") < 0 && annotation.resource.value.indexOf("dbpedia") < 0 && annotation.resource.value.indexOf("youtube") < 0
        @handleAnnotation annotation

  # Putting this into a function keeps the annotation in the context
  handleAnnotation: (annotation) ->
    # console.info "The annotation #{annotation.resource} looks interesting, get the whole entity so we can show it in a widget!", annotation
    # annotation.entityPromise.done (entities) =>
    # console.info "entities for annotation #{annotation.resource} loaded, create a widget for it!", annotation
    nonConcept = annotation.resource.value
    #nonConcept = nonConcept.replace("No description found.","")
    if(nonConcept.length >= 3)
      url = annotation.resource.value;
      domain = url.replace('http://','').replace('https://','').split(/[/?#]/)[0].replace('www.', '')

      widget = @lime.allocateWidgetSpace @,
        thumbnail: "img/shop.png" # should go into CSS
        title: "#{domain}"
        type: "BusinessWidget"
        sortBy: ->
          10000 * annotation.start + annotation.end

      # We're going to need the annotation for the widget's `activate` event
      widget.annotation = annotation
      # widget was activated, we show details now
      jQuery(widget).bind 'activate', (e) =>
        @showAbstractInModalWindow annotation, @getModalContainer()

      # Hang the widget on the annotation
      annotation.widgets[@name] = widget

      jQuery(annotation).bind "becomeActive", (e) =>
        annotation.widgets[@name].setActive()

      jQuery(annotation).bind "becomeInactive", (e) =>
        annotation.widgets[@name].setInactive()

      jQuery(widget).bind "downarrow", (e) =>
        @bookingtabsiterator = if @videotabs.length is @bookingtabsiterator + 1 then 0 else @bookingtabsiterator + 1

        if (@bookingtabsiterator == 0)
          $("#businessWho").trigger 'click'
          $("#businessWho").addClass 'selected'
        if (@bookingtabsiterator == 1)
          $("#businessWhat").trigger 'click'
          $("#businessWhat").addClass 'selected'
        if (@bookingtabsiterator == 2)
          $("#businessWhere").trigger 'click'
          $("#businessWhere").addClass 'selected'


      jQuery(widget).bind "uparrow", (e) =>
        @bookingtabsiterator = if @bookingtabsiterator is 0 then @videotabs.length - 1  else @bookingtabsiterator - 1
        $('.videotab.selected').removeClass 'selected'
        if (@bookingtabsiterator == 0)
          $("#businessWho").trigger 'click'
          $("#businessWho").addClass 'selected'
        if (@bookingtabsiterator == 1)
          $("#businessWhat").trigger 'click'
          $("#businessWhat").addClass 'selected'
        if (@bookingtabsiterator == 2)
          $("#businessWhere").trigger 'click'
          $("#businessWhere").addClass 'selected'


  showAbstractInModalWindow: (annotation, outputElement) ->
    modalContent = $(outputElement)
    modalContent.css "width", "600px"
    modalContent.css "height", "600px"
    #console.log("latitude: " + latitude + " longitude: " + longitude + " = latlong: " + latlng);
    lime = this.lime
    resource = ""
    resource = annotation.resource.value

    if annotation.resource.value.indexOf("webtv.feratel.com") > 0
      resource = resource.replace /\$\$/g, "&"

    console.log resource
    #result = "<div id=\"listContainer\" style=\"position:relative; float: left; z-index: 10; width:35%; height: 95%; background: white; box-shadow: rgba(85,85,85,0.5) 0px 0px 24px;\" >" + "<img src=\"" + depiction + "\" style=\"display: block; width: auto; max-height: 300px; max-width:90%; margin-top: 30px; margin-left: auto;  margin-right: auto; border: 5px solid black; \" >" + "</div>" + "<div id=\"displayArea\" style=\"position:relative; float: left; z-index: 1; width: 65%; height:95%; background: #DBDBDB; overflow: auto;\">" + "<p style=\"margin-left: 10px; font-size: 22px; text-align: left; color:black; font-family: 'Share Tech', sans-serif; font-weight: 400;\">" + comment + "</p>" + "</div>";
    result = """
             <div id="bookingWidgetExpanded" style="position: relative; z-index: 900; width: 600px; height: 600px; background-color: #f1f1f1;">
             <div id="forthTile" style="position: relative; float: left; width: 300px; height: 300px;">
             <div style="width: 100%; position: relative; height: 30px; font-size: 20px; color: #00BFFF; background-color: #696969;">
             STI Research and Consulting GmbH.</div>
             <div style="width: 100%; position: relative; font-size: 16px; height: 50px; background-color: #303030; color: #f1f1f1;">
             Neubaugasse 10/15, 1070 Wien, Austria</div>
             <div style="width: 100%; position: relative; height: 30px; font-size: 16px; background-color: #303030; color: #f1f1f1; text-align: center;">
             +43-3687-22042-0</div>
             <div style="width: 100%; position: relative; height: 190px; font-size: 14pt; background-color: #303030; color: #f1f1f1;">
             About us</div>
             </div>
             <div id="thirdTile" style="width: 300px; height: 300px; float: left; position: relative;">
             <div id="businessWho" style="width: 100%; height: 100px; position: relative; float: left; background-color: #696969; color: #00BFFF; font-size: 49px;">
             Who?<div id="businessWhoLabel" style="position: absolute; z-index: 900; left: 0px; bottom: 0px; height: 50%; width: 100%; font-size: 14pt; color: white; background-color: #303030;">
             STI Research and Consulting GmbH.</div>
             </div>
             <div id="businessWhat" style="width: 100%; height: 100px; float: left; position: relative; background-color: #696969; color: #FA8072; font-size: 49px;">
             What?<div id="businessWhatLabel" style="position: absolute; z-index: 900; left: 0px; bottom: 0px; height: 50%; width: 100%; font-size: 14pt; color: white; background-color: #303030;">
             STI Research and Consulting GmbH.</div>
             </div>
             <div id="businessWhere" style="width: 100%; height: 100px; position: relative; float: left; background-color: #696969; color: #90EE90; font-size: 49px;">
             Where?<div id="businessWhereLabel" style="position: absolute; z-index: 900; width: 100%; height: 50%; left: 0px; bottom: 0px; font-size: 14pt; color: white; background-color: #303030;">
             STI Research and Consulting GmbH.</div>
             </div>
             </div>
             <div id="secondTile" style="width: 300px; height: 300px; position: relative; float: left;">
             <div id="businessName" style="width: 100%; position: relative; height: 30px; font-size: 20px; color: #FA8072; background-color: #696969;">
             STI Research and Consulting GmbH.</div>
             <div id="businessAddress" style="width: 100%; position: relative; font-size: 16px; height: 50px; background-color: #303030; color: #f1f1f1;">
             Neubaugasse 10/15, 1070 Wien, Austria</div>
             <div id="businessTelephone" style="width: 100%; position: relative; height: 30px; font-size: 16px; background-color: #303030; color: #f1f1f1; text-align: center;">
             +43-3687-22042-0</div>
             <div id="businessService" style="width: 100%; position: relative; height: 100px; background-color: #ffffff;">
             <div id="businessService1" style="width: 100%; height: 20px; position: relative;">
             Service 1 - Price XXXX EUR</div>
             <div id="businessService2" style="width: 100%; height: 20px; position: relative;">
             Service 2 - Price XXXX EUR</div>
             <div id="businessService3" style="width: 100%; height: 20px; position: relative;">
             Service 3 - Price XXXX EUR</div>
             <div id="businessService4" style="width: 100%; height: 20px; position: relative;">
             Service 4 - Price XXXX EUR</div>
             <div id="businessService5" style="width: 100%; height: 20px; position: relative;">
             Service 5 - Price XXXX EUR</div>
             </div>
             <div id="businessOpeningHours" style="width: 100%; position: relative; height: 60px; background-color: #303030; color: #f1f1f1;">
             Opening Hours</div>
             <div id="businessContact" style="width: 100%; position: relative; height: 30px; color: black; background-color: lightgray; font-size: 21px; text-align: center; background-image: -webkit-gradient(radial, center center, 10, center center, from(white), to(#909090)); background-image: -o-radial-gradient(white, #909090); background-image: -ms-radial-gradient(white, #909090); background-image: -moz-radial-gradient(white, #909090); background-image: -webkit-radial-gradient(white, #909090); background-image: radial-gradient(white, #909090);">
             &lt; Contact us</div>
             </div>
             <div id="firstTile" style="position: relative; float: left; width: 300px; height: 300px;">
             <div style="width: 100%; position: relative; height: 30px; font-size: 20px; background-color: #696969; color: #90EE90;">
             STI Research and Consulting GmbH.</div>
             <img data-dojo-type="clipart.StreetMap" id="Map" style="width: 100%; position: absolute; z-index: 900; height: 89%;"></img>
             </div>
             </div>
             """
    modalContent.append result
