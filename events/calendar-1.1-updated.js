//<![CDATA[
    // Previously /jquery/calendar/js/calendar-1.1.js

    var calendarPage = ''; // /calendar
    var cJsonlink = '';
    var hashDates = '';
    var jsonDates = '';
    var initialLoad = true;

    var param = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'));

    var hash = (function (a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i) {
            var p = a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.hash.substr(1).split('&'));

    var val = $.extend({}, param, hash); // load param and hash into val, hash overriding param.

    var jsonLinkBase = '/core/event/fullcalendarfeed.aspx';

    //TEMP
    //jsonLinkBase = "https://gpna.org" + jsonLinkBase; // Too much junk - tags and invalid dates
    jsonLinkBase = "https://gpna.org/core/event/fullcalendarfeed.aspx?json=1"
    //alert("jsonLinkBase: " + jsonLinkBase)

    function loadCalendar(initVals) { // Might only call this from outside this .js page, so params can override show.
        $(document).ready(function () {
            $('#calendarTitle').show();
            if (initVals["show"]) { // From activites page.

            } else if (val["show"]) { // Might determine hash needs to be used here, but aiming to include param for Google indexing.
                initVals['show'] = val["show"];
            } else {
                initVals['show'] = '';
            }
            if (!initVals['occurrenceShow']) {
                initVals['occurrenceShow'] = 500;
            }
            initParams(initVals['show'],initVals['tid']);
            loadDisplay(initVals);
            initialLoad = false; // Allows URI params to be added with arrow and go clicks.
        });
    }
    function initParams(show, tid) {
        // || location.host == 'review.gastateparks.org'
        if (location.host == 'localhost' || location.host == 'localhost.local' || location.host == 'review.gastateparks.org') {
            $('#adminMessage').show();
        }

        $('#creditsDiv').hide(); // To show later when link added and title updated.

        populateMonthDD();
        $("#from").datepicker();
        $("#to").datepicker();
        if(hash["siteid"])
        {
            $("#siteid").val(hash["siteid"]);
        }
        if(hash["distance"])
        {
            $("#distance").val(hash["distance"]);
        }
        if(hash["zip"])
        {
            $("#zip").val(hash["zip"]);
        }
        if(hash["cityid"])
        {
            $("#ctl00_ContentPlaceHolder1_CityDD").val(hash["cityid"]);
        }
        if(hash["profdev"])
        {
            var rbValue = hash["profdev"];
            $("[name=profdevRB]").filter("[value="+rbValue+"]").attr("checked","checked");
        }
        if(tid)
        {
            // Loop to set more than one tid checkbox
            var cbValue = tid;
            var thisValue = '';
            //$("[name=typeCB]").filter("[value="+cbValue+"]").attr("checked","checked");

            $("input[type='checkbox'][name='typeCB']").each(
                function()
                {
                    thisValue = this.value;
                    //if(this.checked)

                    // Loop through comma separated tid's from URL.
                    $(tid.split(",")).each(function(i,v){
                        if(thisValue == v)
                        {
                            $("[name=typeCB]").filter("[value="+v+"]").attr("checked","checked");
                        }
                    })
                }
            );
        }
        if (tid || val["p"]) {
            $("#calRightLink").html("<a href='/calendar'>View All Events</a>");
        }
        // fnl (from-newslevel) and tnl (to-newslevel) 
        if (hash["tnl"] == "3" || param["tnl"] == "3") {
            $("#newsLevelCB").attr("checked","checked");
        }
        
        if (show != "list") {
            $('#activeMonthly').css({ 'background-color': '#fff' });

            var startDate = new Date();
            var startDateString = (startDate.getMonth() + 1) + '/1/' + fourdigits(startDate.getYear());
            if(hash["sd"])
            {
                startDateString = hash["sd"];
            }
            var monthStart = new Date(startDateString);
            var dayOfWeek = monthStart.getDay();

            // Set calendar to start on day of first week, typically in previous month
            // For sites that want to show surrounding days.
            //startDate.setDate(monthStart.getDate() - dayOfWeek);
            //startDateString = (startDate.getMonth() + 1) + '/' + startDate.getDate() + '/' + fourdigits(startDate.getYear());

            $('#from').datepicker('setDate', startDateString);
            
            // Get the last day of month
            var endDateString = (monthStart.getMonth() + 2) + '/1/' + fourdigits(monthStart.getYear());  // Adding 2 is actually adding 1 month.
            var monthEnd = new Date(endDateString);
            monthEnd.setDate(monthEnd.getDate() - 1);
            endDateString = (monthEnd.getMonth() + 1) + '/' + monthEnd.getDate() + '/' + fourdigits(monthEnd.getYear());

            if (startDate.getMonth() == 11) { // December
                endDateString = ('1/31/' + fourdigits(startDate.getYear() + 1));
            }

            $('#to').datepicker('setDate', endDateString);
        } else {
            // hash["sd"]
            if (hash["sd"]) { // To do: Add date validation
                $('#from').datepicker('setDate', hash["sd"]);
            } else {
                $('#from').datepicker('setDate', new Date());
            }
            var sd = $("#from").val();
            var endDate = new Date();

            //End of next month
            endDate.setMonth(endDate.getMonth() + 1);
            var endDateString = (endDate.getMonth() + 1) + '/' + daysInMonth((endDate.getMonth() + 1), endDate.getYear()) + '/' + fourdigits(endDate.getYear());
            
            if (hash["ed"]) { // To do: Add date validation
                //alert(hash["ed"]); // Must start with 01, 02, etc.
                endDateString = hash["ed"];
            }
            //alert(endDateString);
            //$('#to').datepicker('setDate', '+2m'); // +3m 2d
            $('#to').datepicker('setDate', endDateString);
        }

    }
    function loadDisplay(initVals) {

        if (initVals['show'] == "list") {
            loadEventList(initVals);
        } else {
            loadMonth(initVals);
        }
    }
    jQuery.fn.getCheckboxVal = function () {
        var vals = [];
        var i = 0;
        this.each(function () {
            vals[i++] = jQuery(this).val();
        });
        return vals;
    } 
    function buildJsonLink(tid, show) {
        var profdev = '';
        if ($('input[name=profdevRB]')[0]) { // If exists
            profdev = $('input[name=profdevRB]:checked').val();
        }

        var typeIDs = '';
        if ($('input[name=typeCB]')[0]) { // If exists
            //typeIDs = $('input[name=typeCB]:checked').val();
            typeIDs = $('input[name=typeCB]:checked').getCheckboxVal();
        }
        if (!typeIDs && tid) {
            typeIDs = tid;
        }
        var partnerID = val["p"];
        var keywords = $("#keywords").val();
        var siteID = '';
        if (document.getElementById('ctl00_ContentPlaceHolder1_SiteDD')) {
            siteID = $("#ctl00_ContentPlaceHolder1_SiteDD").val();
        }
        var distance = '';
        if (document.getElementById('distance')) {
            distance = $("#distance").val();
        }
        var cityID = $("#ctl00_ContentPlaceHolder1_CityDD").val();
        var zip = $("#zip").val();
        var sd = $("#from").val();
        var ed = $("#to").val();
        var tid = '';
        if (typeIDs.length > 0) {
            tid = typeIDs;
        }
        else if (val["tid"]) {
            tid = val["tid"];
        }
        // Add 1 day to the end date to move to midnight
        var endDate = new Date(ed);

        // Set to end of date, one minute prior to next day. (One second would get rounded up to the next day.)
        ed = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + fourdigits(endDate.getYear()) + "+11:59+PM";
        if (param["show"] != "list") { // In month view, don't pass an end date.
            //ed = '';
        }
        //var cJsonlink = 'sample-json.txt?1=2';
        // fullcalendarfeed.aspx fullcaltest.txt
        
        cJsonlink = "";
        
        if (param["show"] != "list")
        {
            hashDates = 'sd=' + sd;
            jsonDates = 'sd=' + sd + '&amp;ed=' + ed; // End date still needed for monthly calendar
        } else {
            hashDates = 'sd=' + sd + '&ed=' + ed.replace("+11:59+PM",""); // Remove in URL only
            jsonDates = 'sd=' + sd + '&amp;ed=' + ed;
        }
        if (partnerID) { cJsonlink += '&amp;p=' + partnerID; }
        if (keywords) { cJsonlink += '&amp;k=' + keywords; }
        if (siteID) { cJsonlink += '&amp;siteid=' + siteID; }
        if (cityID) { cJsonlink += '&amp;cityid=' + cityID; };
        if (zip) { cJsonlink += '&amp;zip=' + zip; };
        if (distance) { cJsonlink += '&amp;distance=' + distance; };
        if ((cityID || zip) && !distance) { cJsonlink += '&amp;distance=10'; }; // Search use lat/lon center point, so distance required.
        
        if (profdev) { cJsonlink += '&amp;profdev=' + profdev; };
        if (tid) { cJsonlink += '&amp;tid=' + tid; };
        if ($("#newsLevelCB").attr('checked')) { cJsonlink += '&amp;tnl=' + $("#newsLevelCB").val(); };
        
        if (!initialLoad) // Allows URI to remain short initially.
        {
            // Build URL Hash
            window.location.hash = hashDates + cJsonlink.replace(/&amp;/g,"&");
        }

        //if (location.host == 'localhost' || location.host == 'localhost.local') {
        //    // || param["show"] == "list" || hash["show"] == "list"
        //    if (show == "list") {
        //        jsonLinkBase = '/jquery/calendar/json/event-list.txt';
        //    } else {
        //        jsonLinkBase = '/jquery/calendar/json/calendar.txt';
        //    }
        //}
        cJsonlink = jsonLinkBase + '?admin=1&json=1&amp;' + jsonDates + cJsonlink;

        //cJsonlink = '/~Silver/jquery/calendar/json.txt?1=2';

        //cJsonlink = 'http://review.eeingeorgia.org/core/event/fullcalendarfeed.aspx?s=0.0.68.4863&db=ee&admin=1&json=1&k=' + keywords + '&sd=' + sd + '&ed=' + ed + '&siteid=' + siteID + '&distance=' + distance + '&cityid=' + cityID + '&zip=' + zip + '&profdev=' + profdev + "&callback=?";
        
    }
    function loadEventList(initVals) {
        var tid = initVals['tid'];
        var show = initVals['show'];
        var occurrenceShow = initVals['occurrenceShow'];

        $('#monthDDHolder').hide();
        $('#dateRangeTable').show();
        $('#calendarTitle').hide();
        //$("#adminMessage").html(""); // Clear the previous adminMessage
        $('#displayCount').hide();
        $("#displayCount").html("");
        $("#eventList").html(""); // Clear the previous eventList
        $("#eventListOngoing").html(""); // Clear the previous eventListOngoing

        var systemVersion = 2;
        
        buildJsonLink(tid, show);
        eventListJsonLink = cJsonlink.replace(/&amp;/g,"&") + '&getwhat=results';
        alert("eventListJsonLink before: " + eventListJsonLink)

        // TEMP
        //eventListJsonLink = "https://gpna.org" + eventListJsonLink;
        eventListJsonLink = "https://gpna.org/core/event/fullcalendarfeed.aspx?admin=1&json=1";

        alert("eventListJsonLink after: " + eventListJsonLink)
        var gData;
        var days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
        var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
        var previousDateString;

        //if (param["show"] == "list") { // would need to use show == "list" if uncommented.
            $('#activeEvents').css({ 'background-color': '#fff'});

            $('#filters').show();
            $('#eventList').show();
            $('#loading').show();
            
            $("#adminMessage").append('Event List:<br><a href="' + eventListJsonLink + '">' + eventListJsonLink + '</a><br>');

            $.getJSON(eventListJsonLink, function (data, status, xhr) {

                $("#adminMessage").append('Data:<br>' + JSON.stringify(data));


                var parent = document.getElementById('eventList');
                var parentOngoing = document.getElementById('eventListOngoing');
                var dataModified = new Array();
                var dataOngoing = new Array();

                $.each(data.message, function (i, id) {
                    // Display admin messages from JSON file.
                    if (id.id) {
                        //child = document.createElement("div");
                        //child.innerHTML = '<div >' + id.id + '</div>';
                        //document.getElementById('adminMessage').appendChild(child);

                        $("#adminMessage").html(id.id);
                        //$('#adminMessage').show();
                    }
                });

                $.each(data.results, function (i, id) {
                    console.log("data.results id.start " + id.start);

                    var startDate = new Date(id.start);
                    var endDate = new Date(id.end);

                    var endRangeStr = $("#to").val();
        
                    // Add 1 day to the end date to move to midnight
                    endRangeStr = endRangeStr + " 11:59 PM";
                    var endRange = new Date(endRangeStr);
                    //alert('endRange: ' + endRange);

                    id.displayTime = +new Date(startDate).getTime();
                    id.totalDays = daysBetween(startDate, endDate);
                    if (id.totalDays != 0) {
                        id.totalDays += 1;
                        id.currentDay = 1;
                    }
                    if (id.totalDays < 15) {

                        dataModified.push(id);

                        var currentDay = 1;
                        while (daysBetween(startDate, endDate) != 0) {
                            startDate.setDate(startDate.getDate() + 1);
                            if (startDate <= endRange) // Only copy forward if within the range.
                            {
                                if ($("#newsLevelCB").val() == id.newslevel || $("#newsLevelCB").val() == "") {

                                    var copyid = clone(id);
                                    copyid.currentDay = ++currentDay;
                                    //startDate.setDate(startDate.getDate() + 1);
                                    copyid.displayTime = +new Date(startDate).getTime();
                                    dataModified.push(copyid);
                                }
                            }
                        }
                    } else {
                        dataOngoing.push(id);
                    }
                });
                // To do: If data.results count == 0
                // eventListOngoing style='float:left;max-width:750';

                //alert('before');
                // Then sort dataModified by start date.
                dataModified.sort(sortMyObjects);
                //alert('after');
                var title = '';
                var lineBreak = '';
                var thumbStr = '';
                var locationStr = '';
                var summaryStr = '';
                var numberDays = '';
                var occurrenceCount = 0;

                var fromDateString = $("#from").val();
                var fromDate = new Date(fromDateString);
                $('#loading').hide();
                $.each(dataModified, function (i, id) {

                    var startDate = new Date(id.start);
                    var startDateString = days[startDate.getDay()] + ", " + months[startDate.getMonth()] + ' ' + startDate.getDate() + ', ' + fourdigits(startDate.getYear());

                    var endDate = new Date(id.end);
                    var endDateString = days[endDate.getDay()] + ", " + months[endDate.getMonth()] + ' ' + endDate.getDate() + ', ' + fourdigits(endDate.getYear());

                    displayDate = new Date(id.displayTime);
                    var displayDateString = days[displayDate.getDay()] + ", " + months[displayDate.getMonth()] + ' ' + displayDate.getDate() + ', ' + fourdigits(displayDate.getYear());

                    floatRight = '';
                    title = '';
                    lineBreak = '';
                    timeStr = '';
                    thumbStr = '';
                    locationStr = '';
                    summaryStr = '';
                    numberDays = '';

                    //numberDays += '<br />fromDate ' + fromDate + '<br />';
                    //numberDays += '<br />displayDate ' + displayDate + '<br />';
                    //numberDays += 'startDate ' + startDate + '<br />';

                    if (displayDate >= fromDate) {
                        occurrenceCount++;
                        if (displayDateString != previousDateString) {

                            child = document.createElement("div");
                            if (occurrenceCount <= occurrenceShow) {
                                child.innerHTML = '<div class="dateRow">' + displayDateString + '</div>';
                            } else {
                                child.innerHTML = '<div class="dateRow hiddenDateRow">' + displayDateString + '</div>';
                            }
                            parent.appendChild(child);

                            previousDateString = displayDateString;
                        }

                        child = document.createElement("div");
                        //if (startDateString != endDateString) {
                        //    numberDays += ' - Day ' + id.currentDay + ' of ' + id.totalDays;
                        //}
                        if (id.location) {
                            if (systemVersion == 1)
                            {
                                locationStr = '<a href="/net/org/info.aspx?s=' + id.locationid + '" style="font-weight:bold; color:#4F4F4F;">' + id.location + '</a>';
                            } else {
                                locationStr = '<a href="/info/' + id.locationid + '" style="font-weight:bold; color:#4F4F4F;">' + id.location + '</a>';
                            }
                        }
                        if (id.distance >= 0) {
                            locationStr += ' <span>(Distance: ' + id.distance + ' miles)</span>';
                        }
                        if (id.city) {
                            locationStr += ', ' + id.city;
                        }
                        if (id.state) {
                            locationStr += ', ' + id.state;
                        }
                        if (id.thumbnail) {
                            thumbStr = '<img src="' + id.thumbnail + '" alt="" align="right" class="thumbnail" />';
                        }
                        if (id.description) {
                            summaryStr = '<span class="detailsLink"> - <span class="moreInfo">MORE</span></span>';
                            //summaryStr += '<span class="detailsText">' + thumbStr + ' - ' + id.description + '</span>'; //  
                            summaryStr += '<span class="detailsText"><br />' + id.description + '</span> '; //  <span class="hideLink">HIDE</span>
                        } else if (thumbStr != '') {
                            //summaryStr += '<span class="detailsText">' + thumbStr + '</span>';
                        }


                        if (startDateString != endDateString) {
                            floatRight = '<span class="patternText">Day ' + id.currentDay + ' of ' + id.totalDays + '</span>';
                        }
                        else if (id.pattern == '2') {
                            floatRight = '<span class="patternText">Sat-Sun</span>';
                        }
                        else if (id.pattern == '3') {
                            floatRight = '<span class="patternText">Fri, Sat, Sun</span>';
                        }
                        else if (id.pattern == '4') {
                            floatRight = '<span class="patternText">Mon-Fri</span>';
                        }

                        if (id.allDay != 'true') {
                            var startDate = new Date(id.start);
                            timeStr = showTheHours(startDate.getHours()) + showZeroFilled(startDate.getMinutes()) + showAmPm(startDate);
                        }
                        if (id.nullend != 'true') {
                            var endDate = new Date(id.end);
                            timeStr += ' to ' + showTheHours(endDate.getHours()) + showZeroFilled(endDate.getMinutes()) + showAmPm(endDate);
                        }
                        //if (id.allDay != 'true' || id.nullend != 'true') { // allDay represents nullstart for Full Calendar.
                        
                        if (locationStr.length > 0 || timeStr.length > 0) {
                            lineBreak = '<br />';
                        }
                        if (locationStr.length > 0 && timeStr.length > 0) {
                            timeStr += ' - ';
                        }
                        
                        title += id.title;
                        if (occurrenceCount <= occurrenceShow) {
                            child.innerHTML = '<div class="eventRow">' + thumbStr + floatRight + '<a class="largerTitle" href="' + id.url + '">' + title + numberDays + '</a>' + lineBreak + timeStr + locationStr + summaryStr + '</div>';
                        } else {
                            child.innerHTML = '<div class="eventRow hiddenEventRow">' + thumbStr + floatRight + '<a class="largerTitle" href="' + id.url + '">' + title + numberDays + '</a>' + lineBreak + timeStr + locationStr + summaryStr + '</div>';
                        }
                        parent.appendChild(child);
                    }

                });
                
                child = document.createElement("div");
                if (occurrenceCount > occurrenceShow) {
                    child.innerHTML = '<div class="showMoreEvents">SHOW MORE EVENTS</div>';
                } else if (occurrenceCount > 0) {
                    child.innerHTML = '<div style="margin-bottom:10px"></div>';
                } else {
                    child.innerHTML = '<!-- No events found matching search -->';
                }
                parent.appendChild(child);
                

                ongoingEventCount = 0;
                $.each(dataOngoing, function (i, id) {
                    ongoingEventCount++;
                    var startDate = new Date(id.start);
                    var startDateString = days[startDate.getDay()] + ", " + months[startDate.getMonth()] + ' ' + startDate.getDate() + ', ' + fourdigits(startDate.getYear());

                    var endDate = new Date(id.end);
                    var endDateString = days[endDate.getDay()] + ", " + months[endDate.getMonth()] + ' ' + endDate.getDate() + ', ' + fourdigits(endDate.getYear());

                    displayDate = new Date(id.displayTime);
                    var displayDateString = days[displayDate.getDay()] + ", " + months[displayDate.getMonth()] + ' ' + displayDate.getDate() + ', ' + fourdigits(displayDate.getYear());

                    locationStr = '';
                    thumbStr = '';
                    numberDays = '';
                    dateRangeString = '';

                    if (ongoingEventCount == 1) {
                        child = document.createElement("div");
                        child.innerHTML = '<div class="dateRow" style="background:#bba;">Ongoing Events <span style="font-size:12pt;">- <span style="white-space: nowrap;">14 days and longer</span></span></div>';
                        parentOngoing.appendChild(child);
                    }

                    child = document.createElement("div");
                    if (startDateString != endDateString) {
                        //numberDays = ' - ' + id.totalDays + ' Days';
                        dateRangeString = '<br />' + startDateString + '<br />until ' + endDateString;
                    }

                    if (id.location) {
                        locationStr = '<br /><a href="/info/' + id.locationid + '" style="color:#77a">' + id.location + '</a>';
                    }
                    if (id.distance >= 0) {
                        locationStr += '<br /><span>Distance: ' + id.distance + ' miles</span>';
                    }
                    if (id.city) {
                        locationStr += ', ' + id.city;
                    }
                    if (id.state) {
                        locationStr += ', ' + id.state;
                    }
                    if (id.thumbnail) {
                        thumbStr = '<img src="' + id.thumbnail + '" alt="" align="right" class="thumbnail" />';
                    }
                    if (id.description) {
                        locationStr += '<span class="detailsLink"> - <span class="moreInfo">MORE</span></span>';
                        //locationStr += '<span class="detailsText">' + thumbStr + ' - ' + id.description + '</span>'; //  <span class="hideLink"> - less</span>
                        locationStr += '<span class="detailsText"><br />' + id.description + '</span>'; //  <span class="hideLink"> - less</span>
                    }
                    //else if (thumbStr != '') {
                    //    locationStr += '<span class="detailsText">' + thumbStr + '</span>';
                    //}
                    child.innerHTML = '<div class="eventRow">' + thumbStr + '<a class="largerTitle" href="' + id.url + '">' + id.title + numberDays + '</a>' + dateRangeString + locationStr + '</div>';

                    parentOngoing.appendChild(child);
                });

               

               $.each(data.count, function (i, id) {
                   // Display admin messages from JSON file.
                   if (id.id) {
                       child = document.createElement("div");
                       var countStr = '';

                       // Instances are less than monthly because ongoing events are not counted in instances.
                       // Ongoing events that start outside of month are included in right side, so inflates amount
                       if (ongoingEventCount > 0) {
                           countStr += (ongoingEventCount + occurrenceCount) + ' events';
                           countStr += ' (' + occurrenceCount + ' plus ' + ongoingEventCount + ' ongoing)';
                       } else {
                           countStr += occurrenceCount + ' events.';
                       }
                       child.innerHTML = '<div >' + countStr + '</div>';

                       document.getElementById('displayCount').appendChild(child);
                       $('#displayCount').show();
                   }
               });

            })
            .success(function(data) { 

                //alert("loadEventList second success: " + JSON.stringify(data)); 

                

            })
            .error(function(data) { alert("loadEventList error " + JSON.stringify(data)); })
            //.complete(function() { alert("loadEventList complete"); })
            .fail(function(xhr){
               alert("fail xhr.responseText: " + xhr.responseText);
            });

            $('.showMoreEvents').on('click', null, function () {
                $('.showMoreEvents').hide();
                $('.hiddenDateRow').show();
                $('.hiddenEventRow').show();
            });
            $('.detailsLink').on('click', null, function () {
                // Display nested, then hide self
                $(this).parent('div').children('span').attr('style', 'display:inline');
                $(this).attr('style', 'display:none');
            });
            $('.hideLink').on('click', null, function () {
                // Hide nested, then display detailsLink
                $(this).parent('div').children('span').attr('style', 'display:none');
                
                // TO DO: Get this working to show detailLink:
                //$(this).parent('div').children('#detailsLink').attr('style', 'display:inline');
                // Activate hover on more info link
            });
        //} // End param("show") == "list"
    }
    function fourdigits(number) {
        return (number < 1000) ? number + 1900 : number;
    }
    function showTheHours(theHour) {
        if (theHour > 0 && theHour < 13) {
            if (theHour == "0") theHour = 12;
            return (theHour);
        }
        if (theHour == 0) {
            return (12);
        }
        return (theHour - 12);
    }
    function showZeroFilled(inValue) {
        if (inValue > 9) {
            return ":" + inValue;
        }
        if (inValue > 0) {
            return ":0" + inValue;
        }
        return "";
    }
    function showAmPm(inDate) {
        if (inDate.getHours() < 12) {
            return ("am");
        }
        return ("pm");
    }
    function daysBetween(date1, date2) {
        var DSTAdjust = 0;
        // constants used for our calculations below
        oneMinute = 1000 * 60;
        var oneDay = oneMinute * 60 * 24;
        // equalize times in case date objects have them
        date1.setHours(0);
        date1.setMinutes(0);
        date1.setSeconds(0);
        date2.setHours(0);
        date2.setMinutes(0);
        date2.setSeconds(0);
        // take care of spans across Daylight Saving Time changes
        if (date2 > date1) {
            DSTAdjust =
                (date2.getTimezoneOffset() - date1.getTimezoneOffset()) * oneMinute;
        } else {
            DSTAdjust =
                (date1.getTimezoneOffset() - date2.getTimezoneOffset()) * oneMinute;
        }
        var diff = Math.abs(date2.getTime() - date1.getTime()) - DSTAdjust;
        return Math.ceil(diff / oneDay);
    }

    function sortMyObjects(a, b) {
        return a.displayTime - b.displayTime;
    }

    function clone(obj) {
        if (obj == null || typeof (obj) != 'object')
            return obj;
        var temp = new obj.constructor();
        for (var key in obj)
            temp[key] = clone(obj[key]);
        return temp;
    }

    // http://jqueryui.com/demos/datepicker/#date-range
    $(function () {
        var dates = $("#from, #to").datepicker({
            defaultDate: "+1w",
            changeMonth: true,
            changeYear: true,
            numberOfMonths: 1,
            onSelect: function (selectedDate) {
                var option = this.id == "from" ? "minDate" : "maxDate",
                instance = $(this).data("datepicker");
                date = $.datepicker.parseDate(
                    instance.settings.dateFormat ||
                    $.datepicker._defaults.dateFormat,
                    selectedDate, instance.settings);
                dates.not(this).datepicker("option", option, date);
            },
            beforeShow: function (element, instance) {
                // Update each datepicker again before it is shown. The month and year dropdowns are recreated.
                updateDatePickerHtml(element, instance);
                var options = $(this).datepicker("option");
                return options;
            }
        });

        updateDatePickerHtml(null, null); // Update the hidden datepicker that is created by the plugin
    });

    function updateDatePickerHtml(element, instance) {
        // Since changeMonth and changeYear are enabled for the datepicker above,
        // add titles to the dropdown for accessibility. Use setTimeout since
        // there is a delay when the child elements are created.
        setTimeout(function () {
            $('select.ui-datepicker-month').attr('title', 'Month');
            $('select.ui-datepicker-year').attr('title', 'Year');
        }, 250);
    }

    // Usage Rules
    // To use or modify this script in a public website, you are required to provide  
    // access to your JSON feed so calendar network can aggregate events between sites.
    // Use the Contact Us form in the DreamStudio.com website to send us a link to your JSON feed.

    function getMonthFromDateSelect() {
        var sd = $("#from").val();
        var startDate = new Date(sd);
        startDate.setDate(startDate.getDate() + 7);
        return startDate.getMonth();
    }
    function getYearFromDateSelect() {
        var sd = $("#from").val();
        var startDate = new Date(sd);
        startDate.setDate(startDate.getDate() + 7);
        return fourdigits(startDate.getYear());
    }
    function loadMonth(initVals) {
        var tid = initVals['tid'];
        $('#calendar').show();
        $('#monthDDHolder').show();
        $('#dateRangeTable').hide();
        $('#arrowsByTitle').show();
        $("#calendar").html(""); // Clear the previous calendar
        $('#displayCount').hide();
        $("#displayCount").html(""); // Clear the previous adminMessage
        buildJsonLink(tid, initVals['show']);

        $("#adminMessage").html(cJsonlink.replace(/&amp;/g,"&") + '<br>');

        var jsonLinkCalendar = cJsonlink.replace(/&amp;/g,"&") + '&forcal=1';
        //alert(jsonLinkCalendar);
        // Sample of using getJSON and JSONP to investigate, add holidays.
        // http: //code.google.com/p/fullcalendar/issues/detail?id=338

        // Unfortunately, getMonthFromDateSelect() is only called on initial load.
        // , left: 'title', right: 'today month prev,next'
        // ,agendaWeek,agendaDay

        //alert('getMonthFromDateSelect() ' + getMonthFromDateSelect());
        //alert('jsonLinkCalendar ' + jsonLinkCalendar);

        // Add for performance:
        //cache: true,

        // BUG BUG - not working with initial Activities tab click.
        $('#calendar').fullCalendar({

            month: getMonthFromDateSelect(),
            year: getYearFromDateSelect(),
            editable: false,
            header: {
                left: '', right: ''
            },
            events: jsonLinkCalendar,
            
            eventDrop: function (event, delta) {
                alert(event.title + ' was moved ' + delta + ' days\n' +
                    '(should probably update your database)');
            },
            weekMode: 'liquid',
            loading: function (bool) {
                if (bool) $('#loading').show();
                else $('#loading').hide();
            },
            timeFormat: 'h(:mm)tt',
            viewDisplay: function (view) {
                //alert('The new title of the view is ' + view.start);
                var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');
        
                var startDate = new Date(view.start);
                $('#calendarTitle').html(months[startDate.getMonth()] + ' ' + fourdigits(startDate.getYear()));
                //$('#from').datepicker('setDate', view.start);
                //$('#to').datepicker('setDate', view.end);
            }
        });
        //alert('loadMonth end');
    }

    function showMonth() {
        $('#calendarTitle').show();
        var ed = $("#from").val();
        var endDate = new Date(ed);
        sd = (endDate.getMonth() + 1) + '/1/' + fourdigits(endDate.getYear());
        ed = (endDate.getMonth() + 1) + '/' + daysInMonth((endDate.getMonth() + 1), endDate.getYear()) + '/' + fourdigits(endDate.getYear());
        
        $('#from').datepicker('setDate', sd);
        $('#to').datepicker('setDate', ed);
        $("#MonthDD").val((endDate.getMonth() + 1) + '/1/' + fourdigits(endDate.getYear()));
        var initVals = {
            'show': 'calendar',
            'tid': hash["tid"]
        };
        loadDisplay(initVals);
    }
    function goNextMonth() {
        
        var ed = $("#to").val();
        var endDate = new Date(ed);
        
        //endDate.setDate(endDate.getDate() + 1);

        //sd = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + fourdigits(endDate.getYear());
        //ed = (endDate.getMonth() + 1) + '/' + daysInMonth((endDate.getMonth() + 1), endDate.getYear()) + '/' + fourdigits(endDate.getYear());
        
        var sd = $("#from").val();
        var startDate = new Date(sd);
        
        if (param["show"] == "list") // Use end as start
        {
            endDate.setDate(endDate.getDate() + 1);

            sd = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + fourdigits(endDate.getYear());
            ed = (endDate.getMonth() + 1) + '/' + daysInMonth((endDate.getMonth() + 1), endDate.getYear()) + '/' + fourdigits(endDate.getYear());
            $('#from').datepicker('setDate', sd);

            $('#to').datepicker('setDate', ed);

            $("#MonthDD").val((endDate.getMonth() + 1) + '/1/' + fourdigits(endDate.getYear()));

        } else { // Advance forward from start of current month
            if (startDate.getMonth() == 11) // December
            {
                sd = '1/1/' + fourdigits(startDate.getYear() + 1);
                ed = '1/' + daysInMonth(0, startDate.getYear() + 1) + '/' + fourdigits(startDate.getYear() + 1);
                $("#MonthDD").val('1/1/' + fourdigits(startDate.getYear() + 1));
                //alert(fourdigits(startDate.getYear() + 1));
            } else {
                sd = (startDate.getMonth() + 2) + '/1/' + fourdigits(startDate.getYear());
                ed = (startDate.getMonth() + 2) + '/' + daysInMonth((startDate.getMonth() + 2), startDate.getYear()) + '/' + fourdigits(startDate.getYear());
                $("#MonthDD").val((startDate.getMonth() + 2) + '/1/' + fourdigits(startDate.getYear()));
                //alert(sd);
            }
        }
        $('#from').datepicker('setDate', sd);
        $('#to').datepicker('setDate', ed);
        //$("#MonthDD").val((endDate.getMonth() + 1) + '/1/' + fourdigits(endDate.getYear()));
        var initVals = {
            'tid': hash["tid"]
        };
        loadDisplay(initVals);
    }
    function goPreviousMonth() {
        var ed = $("#from").val();
        var endDate = new Date(ed);
        endDate.setDate(endDate.getDate() - 1); // One day previous to prior start.  Pushes 1st into prior month.
        if (endDate.getDate() <= 7) { // Include previous month if near start of month
            //endDate.setDate(endDate.getMonth() - 1);
            sd = (endDate.getMonth()) + '/1/' + fourdigits(endDate.getYear());
            ed = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + fourdigits(endDate.getYear());
        } else {
            sd = (endDate.getMonth() + 1) + '/1/' + fourdigits(endDate.getYear());
            ed = (endDate.getMonth() + 1) + '/' + daysInMonth((endDate.getMonth() + 1), endDate.getYear()) + '/' + fourdigits(endDate.getYear());
        }
        $('#from').datepicker('setDate', sd);
        $('#to').datepicker('setDate', ed);
        $("#MonthDD").val((endDate.getMonth() + 1) + '/1/' + fourdigits(endDate.getYear()));
        var initVals = {
            'tid': hash["tid"]
        };
        loadDisplay(initVals);
    }
    function buildTabParams(paramsIn) {
        var tabParam = '?';
        if (param["mode"]) {
            tabParam += '&mode=' + param["mode"];
        }
        if (param["p"]) {
            tabParam += '&p=' + param["p"];
        }
        if (val["tid"]) {
            tabParam += '&tid=' + val["tid"];
        }
        if (paramsIn) { tabParam += '&' + paramsIn;}
        if (tabParam == '?') { tabParam = ''; }
        return tabParam.replace("?&","?");
    }
    function goCalendar() {
        location.href = calendarPage + buildTabParams('show=calendar');
    }
    function goSearchEvents() {
        location.href = calendarPage + buildTabParams('show=list');
    }
    function setRangeStartDate() {
        var sd = $("#from").val();
        var startDate = new Date(sd);
        var ed = $("#to").val();
        var endDate = new Date(ed);
        if (endDate < startDate) {
            // Set start to first day of month
            sd = (endDate.getMonth() + 1) + '/1/' + fourdigits(endDate.getYear());
            $('#from').datepicker('setDate', sd);
        }
    }
    function setRangeEndDate() {
        var sd = $("#from").val();
        var startDate = new Date(sd);
        var ed = $("#to").val();
        var endDate = new Date(ed);
        if (startDate > endDate) {
            // Set end to last day of month
            ed = (startDate.getMonth() + 1) + '/' + daysInMonth((startDate.getMonth() + 1), startDate.getYear()) + '/' + fourdigits(startDate.getYear());
            $('#to').datepicker('setDate', ed);
        }
    }
    function updateDateRange() {
        var sd = $("#MonthDD").val();
        $('#from').datepicker('setDate', sd);
        var startDate = new Date(sd);
        // Get last day of month
        var ed = (startDate.getMonth() + 1) + '/' + daysInMonth((startDate.getMonth() + 1), startDate.getYear()) + '/' + fourdigits(startDate.getYear());
        $('#to').datepicker('setDate', ed);
    }
    function daysInMonth(month, year) {
        var dd = new Date(year, month, 0);
        return dd.getDate();
    }

    function populateMonthDD() {
        //alert(window.location.hash);
        var startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);
        var numMonths = 24;
        var monthNumber = startDate.getMonth() - 1;
        if (monthNumber == 12) monthNumber = 0;
        var year = fourdigits(startDate.getYear());
        var months = new Array('January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December');

        var optionsValues = '<select id="MonthDD" title="Select Month" onchange="updateDateRange()">';
        for (var i = 0; i <= numMonths; i++) {
            monthNumber++;
            if (monthNumber > 11) {
                monthNumber = 0;
                year++;
            }
            //var option = new Option(months[monthNumber] + " " + year, (monthNumber + 1) + "/1/" + year);
            //sel.options[i] = option;
            optionsValues += '<option value="' + (monthNumber + 1) + "/1/" + year + '">' + months[monthNumber] + " " + year + '</option>';
        }
        optionsValues += '</select>';
        var options = $('#MonthDD');
        options.replaceWith(optionsValues); // Inserts all at once for fastest performance

        var today = new Date();
        if(hash["sd"])
        {
            today = new Date(hash["sd"]);
        }
        $("#MonthDD").val((today.getMonth() + 1) + '/1/' + fourdigits(today.getYear()));
    }