var root_url = window.location.protocol + '//' + window.location.host;
var data,det_row;
var row_exists = false;

function filterOnClick() {
    //to update the options according to revision selected to maintain unique index[testindex and platindex]
    updateSelectors('rev',function() {
        //after the options are updated according to revision, indexes can be picked
        var rev = $('#rev').val();
        var test = $('#test').val();
        var platform = $('#platform').val();
        var showall = 0;
        var testIndex = $("select[id='test'] option:selected").index();
        var platIndex = $("select[id='platform'] option:selected").index();
        if ($('#checkbox').is(":checked")) {
            console.log("checked");
            showall = 1;
        }
        document.cookie = "platform = " + platform;
        document.cookie = "test = " + test;

        var href = "alerts.html";
        var flag = '?';
        if (rev && rev != '') {
            href += flag + "rev=" + rev;
            flag = '&';
        }
        if (showall && showall != '') {
            href += flag + "showAll=" + showall;
            flag = '&';
        }
        if (testIndex && testIndex != '') {
            href += flag + "testIndex=" + testIndex;
            flag = '&';
        }
        if (platIndex && platIndex != '') {
            href += flag + "platIndex=" + platIndex;
            flag = '&';
        }
        location.href = href;

    });

    
}
function loadSelectors() {

    get_params = { 
                'name': [ 'keyrevision' ],
                'value': [ results['rev'] ]
            }
    
    $.getJSON(root_url + "/getvalues", $.param(get_params, true), function (data) {

        function compare(a, b) {
            a = a.toString().toLowerCase();
            b = b.toString().toLowerCase();
            if (a < b)
                return -1;
            if (a > b)
                return 1;
            return 0;
        }

        var tests = data['test'].sort(compare);
        var revs = data['rev'];
        var platforms = data['platform'].sort(compare);
        if (parseInt(results['showAll']) == 1) {
            document.getElementById("checkbox").checked = true;
        }

        for (var i in tests) {
            var newoption = document.createElement("option");
            newoption.id = "test";
            var value = tests[i];
            $("#test").append("<option value=\"" + value + "\">" + value + "</option>");
        }

        for (i in revs) {
            var newoption = document.createElement("option");
            newoption.id = "rev";
            var value = revs[i];
            $("#rev").append("<option value=\"" + value + "\">" + value + "</option>");
        }

        for (i in platforms) {
            var newoption = document.createElement("option");
            newoption.id = "platform";
            var value = platforms[i];
            $("#platform").append("<option value=\"" + value + "\">" + value + "</option>");
        }

        try {
            document.getElementById("rev").value = results['rev'];
            document.getElementById("test").selectedIndex = results['testIndex'];
            document.getElementById("platform").selectedIndex = results['platIndex'];
        } catch (e) {
            throw e;
        }

    });

    $('#button').bind("click", filterOnClick);
}

//used for lexical sorting
function compare(a, b) {
    a = a.toString().toLowerCase();
    b = b.toString().toLowerCase();
    if (a < b)
        return -1;
    if (a > b)
        return 1;
    return 0;
}

function resetOptions(data,id) {
    for (var i in data) {
        var newoption = document.createElement("option");
        newoption.id = id;
        var value = data[i];
        $("#"+id).append("<option value=\"" + value + "\">" + value + "</option>");
    }
}

function updateSelectors(changedElementId, callback) {
    
    //to prevent selecting the button while the options are being updated [ to avoid irregular indexes of options ]
    $('#button').unbind("click", filterOnClick).attr('disabled','disabled');
    
    rev = $('#rev').val() || "";
    test = $('#test').val() || "";
    platform = $('#platform').val() || "";
    
    if ( callback && typeof(callback) === "function") {
        //callback function is used only when filter button click event happens
        //we want to re-order the list of options according to the revision selection only
        // so that the indexes i.e. testindex and platindex are uniform when the result is loaded using URL
        var get_params = {
            'name': ['keyrevision'],
            'value': [rev]
        };
    } else {
       var get_params = { 
            'name': [ 'keyrevision', 'test', 'platform' ],
            'value': [ rev, test, platform ]
        }; 
    }
    
    var elements = { 'rev': '#rev', 'test': '#test', 'platform': '#platform' };
    var attribute = elements[changedElementId];

    //to prevent from choosing value while options are being updated
    for (var key in elements) {
        if (key != changedElementId)
            $(elements[key]).attr('disabled','disabled');
    }
    
    $.getJSON(root_url+"/getvalues", $.param(get_params, true),function(data) {
        
        var sorted_data = { 
            'rev': data['rev'], 
            'test': data['test'].sort(compare), 
            'platform': data['platform'].sort(compare) 
        };

        var select_phrase = { 'rev': 'Revision', 'test': 'Test', 'platform': 'Platform'};
        
        for (var key in elements) {
            if(key != changedElementId) {
                $("#"+key).children().remove().end().append('<option value="">Select ' + select_phrase[key] +'</option>');
                resetOptions(sorted_data[key],key);
            }
        }

        try {
            $('#rev').val(rev);
            $('#test').val(test);
            $('#platform').val(platform);
        } catch (e) {
            throw e;
        }

        //after changes are finalised, button is safe to click
        $('#button').bind("click", filterOnClick).removeAttr('disabled');

        //after the changes are made updated options are ready to be choosed
        for (var key in elements) {
            if (key != changedElementId)
                $(elements[key]).removeAttr('disabled');
        }

        if (callback && typeof(callback)==="function") {
            callback();
        }
    });

}

function hideMerged(originalkeyrev, showall) {
    var req = new XMLHttpRequest();
    req.onload = function (e) {
        var raw_data = JSON.parse(req.response);

        var fields = ["push_date", "branch", "test", "platform", "percent", "graphurl", "changeset", "tbplurl", "comment", "bug", "status"]
        var alerts = raw_data.alerts;

        var keyrev = "";
        var tbl = "";
        // insert revisions into lower table
        for (var alert in alerts) {
            if (alerts[alert]["mergedfrom"] == originalkeyrev) {
                tbl = document.getElementById(originalkeyrev + "-tbl");
            } else {
                continue;
            }
            var row = $(document.getElementById(alerts[alert]["id"] + "-" + originalkeyrev));
            if (row) {
                row.remove();
            }
        }
        var mergedfromhtml = "<span id=\"mergedfrom-" + originalkeyrev + "\" onclick=\"showMerged('" + originalkeyrev + "', " + showall + ");\">view merged alerts</span>";

        $(document.getElementById(originalkeyrev + "-hdr")).html("<h4><a href=?rev=" + originalkeyrev + "&showAll=1&testIndex=0&platIndex=0>" + originalkeyrev + "</a></h4>" + mergedfromhtml);
    }
    req.open('get', root_url + '/mergedalerts?keyrev=' + originalkeyrev, true);
    req.send();
}

function showMerged(originalkeyrev, showall) {
    var req = new XMLHttpRequest();
    req.onload = function (e) {
        var raw_data = JSON.parse(req.response);
        var alerts = raw_data.alerts;

        var tbl = "";
        // insert revisions into lower table
        for (var alert in alerts) {
            if (alerts[alert]["mergedfrom"] != originalkeyrev) {
                continue;
            }
            tbl = document.getElementById(originalkeyrev + "-tbl");
            addAlertToUI(tbl, alerts[alert], showall, originalkeyrev);
        }
        var mergedfromhtml = "<span id=\"mergedfrom-" + originalkeyrev + "\" onclick=\"hideMerged('" + originalkeyrev + "', " + showall + ");\">hide merged alerts</span>";
        $(document.getElementById(originalkeyrev + "-hdr")).html("<h4><a href=?rev=" + originalkeyrev + "&showAll=1&testIndex=0&platIndex=0>" + originalkeyrev + "</a></h4>" + mergedfromhtml);
    }
    req.open('get', root_url + '/mergedalerts?keyrev=' + originalkeyrev, true);
    req.send();
}

function addMergedLinks(showall) {
    var req = new XMLHttpRequest();
    req.onload = function (e) {
        var raw_data = JSON.parse(req.response);

        var fields = ["id", "push_date", "bug", "status", "keyrevision", "bugcount", "mergedfrom"]
        var alerts = raw_data.alerts;

        var count = 0;
        for (var alert in alerts) {
            if (alerts[alert]['mergedfrom'] != '') {
                var mf = alerts[alert]['mergedfrom'];
                if ($(document.getElementById(mf + "-hdr")).html() == "") {
                    continue;
                }

                var mergedfromhtml = "<span id=\"mergedfrom-" + mf + "\" onclick=\"showMerged('" + mf + "', " + showall + ");\">view merged alerts</span>";
                $(document.getElementById(mf + "-hdr")).html("<h4><a href=?rev=" + mf + "&showAll=1&testIndex=0&platIndex=0>" + mf + "</a></h4>" + mergedfromhtml);
            }
        }
    }
    req.open('get', root_url + '/mergedids', true);
    req.send();
}

function updateStatus(alertid, duplicate, bugid, mergedfrom) {
    var status = $(document.getElementById(alertid + "-status")).val();
    if (status == 'Duplicate') {
        // popup window with field for duplicate, seeded with alert['duplicate']
        // consider merged rev if needed
        suggestedDuplicate = duplicate;
        if (suggestedDuplicate == 'null' || suggestedDuplicate == '') {
            suggestedDuplicate = mergedfrom;
        }

        AddDuplicateUI.openDuplicateBox(alertid, suggestedDuplicate);
    } else if (status == 'Backout') {
        var bug = bugid;
        if (bug == '') {
            bug = $(document.getElementById(alertid + "-bug")).val();
        }
        AddBugUI.openBugBox(alertid, bug, 'Backout');
    } else {
        $.ajax({
             url: root_url + "/updatestatus",
            type: "POST",
            data: {
                id: alertid,
                status: status,
            }
        });
    }
}


//function to check whether a name exists in an array
function containsObject(obj, list) {
    for (var i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }

    return false;
}

function performAction() {
    var action = $(document.getElementById("actions")).val();
    console.log("Selected action-"+action);

    var status_options = ["NEW", "Back Filling", "Investigating", "Resolved", "Shipped", "Wont Fix", "False Alarm", "Ignore", "Not Tracking", "Too Low"];

    //get ids of all the checked alerts
   var checkedIds = $(":checkbox:checked").map(function() {
        return this.id;
    }).get();
   //Check if atleast one alert is chosen
   if (checkedIds.length<=0 && action != "Actions") {
    console.log("No alert chosen");
    alert("Please Choose atleast one Alert");
   } else {
        var ids = {};
        for (var alertid in checkedIds) {
            if (checkedIds[alertid] == 'checkbox')
                continue;

            ids[alertid] = checkedIds[alertid].split('-')[1];
        }
        checkedIds = ids;

        //Check if status has to be changed
        if (containsObject(action, status_options)) {
            console.log("change status-"+action);
            //Update the status one by one by calling updatestatus()
            for (id in checkedIds) {
                $.ajax({
                     url: root_url + "/updatestatus",
                    type: "POST",
                    data: {
                        id: checkedIds[id],
                        status: action,
                    }
                });
            }
            location.reload();
        }

        else if (action == "Change Revision") {
            var newRev = prompt("Please enter new Revision");
            for (id in checkedIds) {

                var bug = '1234';
                if (bug == '') {
                    bug = $(document.getElementById(alertid + "-bug")).val();
                }
    
                if (newRev != null) {
                    console.log('new revision-'+newRev);
                    $.ajax({
                         url: root_url + "/updaterev",
                        type: "POST",
                        data: {
                            id: checkedIds[id],
                            revision: newRev,
                        }
                    });
                }
            }
            location.reload();

        }

        else if (action == "Add Bug") {
            var BugID = prompt("Please enter Bug ID");
            console.log('BUG ID-'+BugID);
            if (BugID != null) {
                for (id in checkedIds) {
                    $.ajax({
                         url: root_url + "/updatefields?type=bug",
                        type: "POST",
                        data: {
                            id: checkedIds[id],
                            BugID: BugID,
                        }
                    });

                }
                location.reload();
            
            }
        }

        else if (action == "Add Comment") {
            $(function() {
                $("#addCommentpopup").dialog({
                    autoOpen: false,
                    modal: true,
                    buttons: { 
                        Ok: function() {
                            var email = $("#commentName").val();
                            var comment = $("#commentText").val();
                            for (id in checkedIds) {
                                console.log("Sending POST for-" + checkedIds[id]);
                                $.ajax({
                                         url: root_url + "/submit",
                                        type: "POST",
                                        data:{
                                            id: checkedIds[id],
                                            comment: comment,
                                            email: email,
                                        }
                                });
                            }
                            $(this).dialog("close");
                       },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    }
                });
            });
            $("#addCommentpopup").dialog("open");
        }
            //For changing branch
        else if (action == "Change Branch") {
            $(function() {
                $("#changeBranchpopup").dialog({
                    autoOpen: false,
                    modal: true,
                    buttons: { 
                        Ok: function() {
                            var branch = $("#branchName").val();
                            var rev = $("#revisionName").val();
                            for (id in checkedIds) {
                                $.ajax({
                                         url: root_url + "/updatefields?type=branch",
                                        type: "POST",
                                        data:{
                                            id: checkedIds[id],
                                            branch: branch,
                                            revision: rev,
                                        }
                                });
                            }
                            $(this).dialog("close");
                       },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    }
                });
            });
            $("#changeBranchpopup").dialog("open");
        }

        //Duplicates
        else if (action == 'Duplicate') {
            $(function() {
                $("#markDuplicatepopup").dialog({
                    autoOpen: false,
                    modal: true,
                    buttons: { 
                        Ok: function() {
                            var new_rev = $("#markDuplicateRev").val();
                            for (id in checkedIds) {
                                $.ajax({
                                         url: root_url + "/updatefields?type=duplicate",
                                        type: "POST",
                                        data:{
                                            id: checkedIds[id],
                                            rev: new_rev,
                                        }
                                });
                            }
                            $(this).dialog("close");
                       },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    }
                });
            });
            $("#markDuplicatepopup").dialog("open");
        }

        //Backout
        else if (action == 'Backout') {
            $(function() {
                $("#BackoutPopup").dialog({
                    autoOpen: false,
                    modal: true,
                    buttons: { 
                        Ok: function() {
                            var bug = $("#BackoutPopupText").val();
                            for (id in checkedIds) {
                                $.ajax({
                                         url: root_url + "/updatestatus?type=bug",
                                        type: "POST",
                                        data:{
                                            id: checkedIds[id],
                                            bug: bug,
                                            status: "Backout",
                                        }
                                });
                            }
                            $(this).dialog("close");
                       },
                        Cancel: function () {
                            $(this).dialog("close");
                        }
                    }
                });
            });
            $("#BackoutPopup").dialog("open");
        }      
   }
}

function fileBug (keyrev) {
    console.log("File bug for-"+keyrev.split('-')[1]);
    var req = new XMLHttpRequest();
    req.onload = function (e) {
        var raw_data = JSON.parse(req.response);
        console.log(raw_data);
        $("#summaryText").val(raw_data['summary'])
        $("#descriptionText").val(raw_data['desc'])
        
        $(function() {
        $("#fileBugpopup").dialog({
            autoOpen: false,
            modal: true,
            width: 900,
            height: 600,
            buttons: { 
                Dismiss: function() {
                    console.log("Done Filling");
                    $(this).dialog("close");
               }
            }
        });
    });
    $("#fileBugpopup").dialog("open");

    }
    req.open('get', root_url + '/file_bug?keyrev=' + keyrev.split('-')[1], true);
    req.send();

}

function updateBug(alertid, bugid, status) {
    var bug = bugid;
    if (bug == '') {
        bug = $(document.getElementById(alertid + "-bug")).val();
    }
    if (status == '') {
        status = 'NEW';
    }

    AddBugUI.openBugBox(alertid, bug, status);
}

function updateTbplURL(alertid, tbplurl) {
    AddTbplUI.openTbplBox(alertid, tbplurl);
}

function addAlertToUI(tbl, alert, showall, rev) {
    addMergedAlertToUI(tbl, alert, showall, rev);
}


// Function idDescending sorts the objects in the descending order of their id. This way, we can view the most recent alerts at the top.
// The objects have been sorted based on their id and not on their push_date as sorting by the push_date field was not working.
function idDescending(a, b) {
    if (a["id"] < b["id"]) {
        return 1;
    }
    else {
        return -1;
    }
}

function showDetails(i) {
    var table = document.getElementById("detail");
    if (row_exists) {
        
        det_row.deleteCell(0);
        det_row.deleteCell(0);
        det_row.deleteCell(0);
        det_row.deleteCell(0);
        row_exists = false;
        
    }
    det_row = table.insertRow(0);
    var cell0 = det_row.insertCell(0);
    cell0.innerHTML = "<a href=https://bugzilla.mozilla.org/show_bug.cgi?id="+data[i]["bug"]+">&nbsp;"+ data[i]["bug"] +"&nbsp;</a>";
    var cell1 = det_row.insertCell(1);
    cell1.innerHTML = "<a href="+data[i]["graphurl"]+">&nbsp; graphurl &nbsp;</a>";
    var cell2 = det_row.insertCell(2);
    cell2.innerHTML = "<a href="+data[i]["tbplurl"]+">&nbsp; tbplurl &nbsp; </a>";
    var cell3 = det_row.insertCell(3);
    cell3.innerHTML = "<a href="+data[i]["changeset"]+">&nbsp; changeset &nbsp; </a>";
    row_exists=true;
}

function loadAllAlertsTable_win8(showall, rev, test, platform, current, show_improvement) {
    loadAllAlertsTable_raw(showall, rev, test, platform, current, show_improvement, 'win8only');
}

function loadAllAlertsTable(showall, rev, test, platform, current, show_improvement) {
    loadAllAlertsTable_raw(showall, rev, test, platform, current, show_improvement, 'alertsbyrev');
}

function loadAllAlertsTable_raw(showall, rev, test, platform, current, show_improvement, queryname) {
    if (rev == '') {
        document.getElementById("warn").innerHTML = "<h4><font color=red>Table view is available per revision and not for the entire list</font></h4>";
    }
    document.getElementById("jump").innerHTML="<h4><a href="+root_url+"/alerts.html?rev="+rev+"&showAll=1&testIndex=0&platIndex=0>Toggle View</a></h4>";
    if (show_improvement == 1)
        document.getElementById("hide").innerHTML="<h5><b><a href="+root_url+"/alerts.html?rev="+rev+"&table=1&show_improvement=0>Hide Improvement</a></b></h5>";
    else
        document.getElementById("hide").innerHTML="<h5><b><a href="+root_url+"/alerts.html?rev="+rev+"&table=1&show_improvement=1>Show Improvement</a></b></h5>";

    var req = new XMLHttpRequest();
    req.onload = function(e) {
        var raw_data = JSON.parse(req.response);
        data = raw_data.alerts;
        var plats = [];
        var tests = [];
        var rowlist = [];
        var celllist = [];
        // HACK: to get the comments displayed
        var comment = rev + " : " + data[0]['comment'];
        document.getElementById("revision").innerHTML = "<h4><a href="+root_url+"/alerts.html?rev="+rev+"&showAll=1&testIndex=0&platIndex=0>" + comment + "</a></h4>";
        var table = document.getElementById("data");
        var row = table.insertRow(0);
        var cell = row.insertCell(0);
        cell.innerHTML=" ";
        for (var i=0;i<data.length;i++) {
            if (plats.indexOf(data[i]["platform"]) == -1) {
                plats.push(data[i]["platform"]);
                cell = row.insertCell(1);
                cell.innerHTML="<b>"+data[i]["platform"]+"</b>";
                cell.style.backgroundColor="#CCCCCC"; // light grey
            }
            
            if (tests.indexOf(data[i]["test"]) == -1) {
                tests.push(data[i]["test"]);
                var row0 = table.insertRow(1);
                rowlist.push(row0);
                var cell0 = row0.insertCell(0);
                cell0.innerHTML ="<b>&nbsp;"+data[i]["test"]+"&nbsp;</b>";
                cell0.style.backgroundColor="#CCCCCC"; // light grey
            }
        }
        for (var y=0;y<tests.length;y++) {
            for (var x=0;x<plats.length;x++) {
                var cell00= rowlist[y].insertCell(1)
                celllist.push(cell00);
            }
        }
        for (var i=0;i<data.length;i++) {
            var cell1 = celllist[(tests.indexOf(data[i]["test"])*plats.length)+plats.indexOf(data[i]["platform"])];
            var percent = parseInt((data[i]["percent"].split("%"))[0]);
            var color="";
            if (percent <= -10) {
                color="#EA9999"; //red
            } else if (percent<0 && percent>-10) {
                color="#FCE5CD"; //orange
            } else if (percent>0 && percent<10) {
                if (show_improvement == 0)
                    continue;
                color="#B6D7A8"; //light green
            } else {
                if (show_improvement == 0)
                    continue;
                color="#93C47D"; // green
            }
            
            //Obtaining the pre-existing value of each cell and also the current value to be added.
            value = cell1.innerHTML           
            var prevVal = 0;
            var curVal = getCurrent(data[i]); 
            if (value != "") {
                 prevVal = parseHTML(value);                 
            }
            //The new data is added if it is not a duplicate of existing data
           // window.alert(prevVal+"=="+curVal);
            if (curVal != prevVal) {           
                var strike_value = data[i]['percent'];
                if (!(checkStatusActive(data[i]['status']))) {
                    strike_value = "<strike><b>"+strike_value+"</b></strike>";
                }
                if (isPGO(i)) {
                    value =  value + "<p onmouseover='showDetails("+i+")'>"+strike_value;
                    //PGO Values are highlighted in blue
                    value = "<font color=blue><b>"+value +"</b></font>"; 
                    value = value + "</p>";
                }
                else
                {
                    value =  "<p onmouseover='showDetails("+i+")'><b>"+strike_value+"</b></p>"+value;
                }               
            }
            cell1.innerHTML = "<div style=background:"+color+" class=stitched>"+value+"</div>";
        }
    }
    req.open('get', root_url+'/' + queryname + '?expired=0&keyrevision='+rev, true);
    req.send();
}

function isPGO(i)
{
    if (data[i]['branch'].endsWith("Non-PGO"))
        return false;
    return true;
}

function parseHTML(value)
{
    var tempVal = value.split("%");
    var tempVal1 = tempVal[tempVal.length-2].split("b>");
    var prevVal = parseInt(tempVal1[tempVal1.length-1]); 
    return prevVal;
}

function getCurrent(values)
{
    return parseInt(values["percent"].split("%")[0]);
}

function loadAllAlerts(showall, rev, test, platform, current) {
    loadAllAlerts_raw(showall, rev, test, platform, current, 'alertsbyrev');
}

function loadAllAlerts_win8(showall, rev, test, platform, current) {
    loadAllAlerts_raw(showall, rev, test, platform, current, 'win8only');
}

function loadAllAlerts_raw(showall, rev, test, platform, current, queryname) {
    var req = new XMLHttpRequest();
    req.onload = function (e) {
        var raw_data = JSON.parse(req.response);
        var alerts = raw_data.alerts;
        alerts.sort(idDescending);

        var keyrev = "";
        var tbl = "";
        // insert revisions into lower table
        if (alerts.length != 0) {
            for (var alert = 0; alert < alerts.length; alert++) {
                if (alerts[alert]["keyrevision"] != keyrev) {
                    keyrev = alerts[alert]["keyrevision"];
                    if ($(document.getElementById(keyrev + "-hdr")).html() == null) {
                        var newdiv = document.createElement("div");
                        newdiv.id = keyrev;
                        $("#revisions").append(newdiv);
                        $(document.getElementById(keyrev)).append("<span id=\"" + keyrev + "-hdr\"><a href=?rev=" + keyrev + "&showAll=1&testIndex=0&platIndex=0><h4>" + keyrev + "</h4></a></span>");

                    }
                    if ($(document.getElementById(keyrev + "-tbl")).html() == null) {
                        var kdiv = document.getElementById(keyrev);
                        var newtbl = document.createElement("table");
                        newtbl.id = keyrev + '-tbl';
                        newtbl.className='table table-bordered';
                        $(document.getElementById(keyrev)).append(newtbl);
                    }

                    $(document.getElementById(keyrev + "-hdr")).html("<a href=?rev=" + keyrev + "&showAll=1&testIndex=0&platIndex=0><h4>" + keyrev + "</h4></a><span id=\"file-"+keyrev+"\" onclick=\"fileBug(this.id)\">File Bug</span>");
                    tbl = document.getElementById(keyrev + "-tbl");
                }
                var r = addAlertToUI(tbl, alerts[alert], showall, rev);
                if ($(document.getElementById(keyrev + '-tbl')).find('tr').size() == 0) {
                    $(document.getElementById(keyrev + "-hdr")).html("");
                }
            }
            addMergedLinks(showall);
            AddCommentUI.init();
            AddDuplicateUI.init();
            AddBugUI.init();
            AddTbplUI.init();
        
        } else {
            var newdiv = document.createElement("div");
            newdiv.id = "not-found";
            $("#revisions").append(newdiv);
            $(document.getElementById("not-found")).append("<h4> No alerts for " + rev + " Found </h4>");
        }
    }
    url = '/' + queryname;
    if (current == "true") {
        url += "?expired=0";
    } else {
        url += "?expired=1";
    }
    if (rev && rev != '') {
        url += "&rev=" + rev;
    }
    if (test && test != '') {
        url += "&test=" + test;
    }
    if (platform && platform != '') {
        url += "&platform=" + platform;
    }
    req.open('get', (root_url + url), true);
	req.setRequestHeader("Accept-Encoding", "gzip,deflate");
    req.send();
}

function editAlert(id, body) {
    return function () {
        AddCommentUI.openCommentBox(id, body);
    }
}

function hideDiv(name) {
    document.getElementById(name).style.display = "none";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function getJsonFromUrl() {
    var query = location.search.substr(1);
    var data = query.split("&");
    var result = {};
    for (var i = 0; i < data.length; i++) {
        var item = data[i].split("=");
        if (item[0].trim().length > 0) result[item[0]] = item[1];
    }
    return result;
}

function checkStatusActive(status) {
    if (status == "NEW" || status == "Investigating" || status == "") {
        return true;
    }
    
    return false;
}

//RETURN FIRST NOT NULL, AND DEFINED VALUE
function nvl() {
    var args = arguments.length == 1 ? arguments[0] : arguments;
    var a;
    for (var i = 0; i < args.length; i++) {
        a = args[i];
        if (a !== undefined && a != null) return a;
    }//for
    return null;
}//method

coalesce = nvl;
