google.load('visualization', '1.0', {
    packages: ["timeline"]
});

function showme() {
    var urlStatus = $('#voto').val();

    $(document).ready(function() {

        if (urlStatus == "") {
            alert("Please put Url");
        } else {
            $("#table").find("tr:gt(0)").remove();
            var d = document.getElementById("table").style;

            $.get(urlStatus, function(response) {
                $('#overlay').show();
                $('#loading-img').show();
                $.each(response.bugs, function(index, elem) {

                    jQuery.ajax({
                        url: "http://bugs.check24tech.de/rest/bug/" + elem.id + "/history",
                        success: function(data) {

                            handleData(data, elem.id, elem.cf_aufwand, elem.summary, elem.creation_time);
                        },
                        complete: function() {
                            if (index === response.bugs.length - 1) {
                                $('#loading-img').hide();
                                $('#overlay').hide();
                                d.display = 'block';
                            }
                        },
                        async: false
                    });

                });


            });

        }
    });

}



function gettimeline() {

    var id = $('#Id').val();

    if (id == "Id") {


        alert("Put ID");
    } else {
        jQuery.ajax({
            url: "http://bugs.check24tech.de/rest/bug?id=" + id,
            success: function(data) {

                var startDate = data.bugs[0].creation_time;
                var title = data.bugs[0].summary;
                var $c = $("#container");
                //ajax call to http://bugs.check24tech.de/rest/bug?id=16161
                // save startDate -> bugs[0].created
                //
                jQuery.ajax({
                    url: "http://bugs.check24tech.de/rest/bug/" + id + "/history",
                    success: function(data) {

                        var link = "href='http://bugs.check24tech.de/show_bug.cgi?id=" + id + "'";

                        $c.html(" <a " + link + ">" + title + "</a> ");

                        var table = drawtable(id, data, startDate);
                        calbackfunc2(title, id, table);



                    },
                    async: false
                });
            }
        });
    }
}




function HistoryBugzilla() {



    $(document).ready(function() {


        var id = $('#Id').val();

        if (id == "Id") {


            alert("Put ID");
        } else {
            var newPath = 'http://bugs.check24tech.de/show_activity.cgi?id=' + id
            window.location.href = newPath;
        }
    });
}

function handleData(data, id, aufwand, title, startDate) {

    var start,
        lastInProgress = "",
        lastOnProduction = "",
        end,
        valStartprogress,

        valStartfronted,
        valStartitfronted,

        valEndclosed,
        valEndproduction,
        valEndtested,
        valEndready,
        valEndpmtest,
        excepstart,
        excepend,
        $c = $("#container"),
        $t = $("#table"),
        addedOnProduction,
        addedInProgress,
        addedClosed,
        addedFrontendDev,
        removedItFrontendQueue,
        addedPmtestready,
        addedTested,
        addedRft,
        frontendDevs = {
            "olaf.keding": true,
            "philipp.faisst": true,
            "andrey.tikhomirov": true,
            "ibrahim.rekik": true,
            "michael.bier": true

        };
    //var display = "";
    //display += "ID: "+id;
    //display += "cf_aufwand: "+aufwand;


    $.each(data.bugs[0].history, function(historyIndex, historyElem) {




        //var table = table from the function 




        $.each(historyElem.changes, function(changeIndex, changeElem) {


            if (changeElem.added === "IN-PROGRESS") {
                addedInProgress = historyElem.when;
                valStartprogress = "IN-PROGRESS";
            }



            if (!valStartprogress && changeElem.removed === "it-frontend-kfz") {
                removedItFrontendQueue = historyElem.when;
                valStartitfronted = "it-frontend-kfz";
            }

            if (!valStartprogress && !valStartitfronted && frontendDevs[changeElem.added]) {
                addedFrontendDev = historyElem.when;
                valStartfronted = "frontendDevs"

            }
            if (!addedOnProduction && changeElem.added === "ON PRODUCTION") {
                addedOnProduction = historyElem.when;
                valEndproduction = "ON PRODUCTION";
            } else if (!valEndproduction && changeElem.added === "CLOSED") {
                addedClosed = historyElem.when;
                valEndclosed = "CLOSED";

            } else if (!valEndproduction && !valEndclosed && changeElem.added === "TESTED") {
                addedTested = historyElem.when;
                valEndtested = "TESTED";
            } else if (!valEndproduction && !valEndclosed && !valEndtested && !valEndpmtest && changeElem.added === "READY-FOR-TEST") {
                addedRft = historyElem.when;
                valEndready = "READY-FOR-TEST";

            }




        })



    });

    start = addedInProgress || removedItFrontendQueue || addedFrontendDev || false;
    // start = addedInProgress || removedItFrontendQueue || addedFrontendDev || false;
    end = addedTested || addedPmtestready || addedOnProduction || addedRft || addedClosed || false;
    valend = valEndproduction || valEndclosed || valEndtested || valEndready || false;
    valStart = valStartprogress || valStartitfronted || valStartfronted || false;




    var noend = "No End"
    var vide = "---";

    var nostart = "No start"
    var linkBugzilla = "href='http://bugs.check24tech.de/show_bug.cgi?id=" + id + "'";



    if ((start && end) && (start < end)) {
        NbOfDdate = calculateSpan(start, end);
        if (NbOfDdate < 0) {
            NbOfDdate = calculateSpan(removedItFrontendQueue, end);
        }
        RealTaille = Comparaison(NbOfDdate);



        var RQ = InWhichCaseWeAre(aufwand, RealTaille);
        var chainevide = "---";
        if (aufwand === "---") {

            $t.append("<tr style='cursor: pointer;' onclick='D(" + id + ")' > <td><a " + linkBugzilla + ">" + title + "</a></td><td>" + id + "</td><td> " + NbOfDdate + "</td><td>" + aufwand + "</td><td> " + RealTaille + "</td><td  >" + chainevide + " </td><td>" + valStart + "</td><td>" + valend + "</td></tr>");




        } else {
            if (RQ === "ok") {

                $t.append("<tr style='cursor: pointer;' onclick='D(" + id + ")' > <td><a " + linkBugzilla + ">" + title + "</a></td><td>" + id + "</td><td> " + NbOfDdate + "</td><td>" + aufwand + "</td><td> " + RealTaille + "</td><td   bgcolor='#32CD32'>" + RQ + " </td><td>" + valStart + "</td><td>" + valend + "</td></tr>");
            } else if (RQ === "Real time is  Bigger") {
                $t.append("<tr style='cursor: pointer;'   onclick='D(" + id + ")' > <td><a " + linkBugzilla + ">" + title + "</a> </td> <td>" + id + "</td><td> " + NbOfDdate + "</td><td>" + aufwand + "</td><td> " + RealTaille + "</td><td  bgcolor='  	#FF4500'>" + RQ + " </td><td>" + valStart + "</td><td>" + valend + "</td></tr>");
            } else if (RQ === "Real time is Smaller") {
                $t.append("<tr style='cursor: pointer;' onclick='D(" + id + ")' > <td><a " + linkBugzilla + ">" + title + "</a> </td><td >" + id + "</td><td> " + NbOfDdate + "</td><td>" + aufwand + "</td><td> " + RealTaille + "</td><td onclick='D(" + id + ")' bgcolor='#FF7F50'> " + RQ + " </td><td>" + valStart + "</td><td>" + valend + "</td></tr>");
            }
        }




        // add table to row
        // addTimeline(id, startDate, history)



    } else if (valStart != false && valend === false) {



        $t.append("<tr style='cursor: pointer;' onclick='D(" + id + ")' > <td><a " + linkBugzilla + ">" + title + "</a> </td><td >" + id + "</td><td> " + vide + "</td><td>" + aufwand + "</td><td> " + vide + "</td><td onclick='D(" + id + ")' > " + vide + " </td><td>" + valStart + "</td><td>" + noend + "</td></tr>");
    } else if (valend != false && valStart === false) {




        $t.append("<tr style='cursor: pointer;' onclick='D(" + id + ")' > <td><a " + linkBugzilla + ">" + title + "</a> </td><td >" + id + "</td><td> " + vide + "</td><td>" + aufwand + "</td><td> " + vide + "</td><td onclick='D(" + id + ")' > " + vide + " </td><td>" + nostart + "</td><td>" + valend + "</td></tr>");
    } else if (valStart === false && valend === false) {


        $t.append("<tr style='cursor: pointer;' onclick='D(" + id + ")' > <td><a " + linkBugzilla + ">" + title + "</a> </td><td >" + id + "</td><td> " + vide + "</td><td>" + aufwand + "</td><td> " + vide + "</td><td onclick='D(" + id + ")' > " + vide + " </td><td>" + nostart + "</td><td>" + noend + "</td></tr>");
    } else {


        $t.append("<tr style='cursor: pointer;' onclick='D(" + id + ")' > <td><a " + linkBugzilla + ">" + title + "</a> </td><td >" + id + "</td><td> " + vide + "</td><td>" + aufwand + "</td><td> " + vide + "</td><td onclick='D(" + id + ")'> " + vide + " </td><td>" + valStart + "</td><td>" + noend + "</td></tr>");

    }




    $t.append('<tr id="idofrow_' + id + '" > <td colspan="8" id="row_' + id + '" style=" width: 800px;height: 300px" > here you can find Details !</td></tr>');

    var table = drawtable(id, data, startDate);


    calbackfunc(id, table);


}

function D(id) {
    if (1 === 1) {
        va_et_vient("row_" + id);
    }
}


function va_et_vient(div) {
    var d = document.getElementById(div).style;
    (d.display == 'block') ? d.display = 'none': d.display = 'block';
}

function va(div) {
    var d = document.getElementById(div).style;
    d.display = 'none';
}

function calbackfunc(id, table) {
    var timelineHolder = document.getElementById("row_" + id);
    var timeline = new google.visualization.Timeline(timelineHolder);

    timeline.draw(table);

    google.visualization.events.addListener(timeline, 'ready', function() {


        //$(timelineHolder).css("display", "none");

    });


    $(timelineHolder).css("display", "none");




}
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf())
    date.setDate(date.getDate() + days);
    return date;
}


function calculateSpan(start, end) {
    var Dstart = new Date(start);
    var Dend = new Date(end);




    NbOfDdate = Math.round(((((Dend - Dstart) / 1000) / 60) / 60) / 12);
    NbOfDdate = NbOfDdate / 2;

    var numOfWeekends = getNumOfWeekends(Dstart, Dend);
    NbOfDdate = NbOfDdate - (numOfWeekends * 2);

    return NbOfDdate === 0 ? 0.5 : NbOfDdate;
}




function getNumOfWeekends(startDate, endDate) {
    var count = 0;
    var curDate = startDate;
    while (curDate <= endDate) {
        var dayOfWeek = curDate.getDay();
        var isWeekend = (dayOfWeek == 6) || (dayOfWeek == 0);
        if (isWeekend)
            count++;
        curDate = curDate.addDays(1);
    }
    return count / 2;
}



function Comparaison(nb) {
    if (nb >= 0.5 && nb <= 1.5) {
        return ("XS");

    } else if (nb >= 1.5 && nb <= 3) {
        return ("S");
    } else if (nb > 3 && nb <= 6) {
        return ("M");
    } else if (nb > 6 && nb <= 12) {
        return ("L");
    } else if (nb > 12 && nb <= 18) {
        return ("XL");

    } else if (nb > 18) {
        return ("XXL");

    } else return (nb);

}


function InWhichCaseWeAre(sz1, sz2, RQ) {




    if (sz1 === sz2) {

        return ("ok");
    } else if (sz1 === "XS" && ((sz2 === "S") || (sz2 === "M") || (sz2 === "L") || (sz2 === "XL") || (sz2 === "XXL"))) {
        return ("Real time is  Bigger");
    } else if (sz1 === "S" && ((sz2 === "M") || (sz2 === "L") || (sz2 === "XL") || (sz2 === "XXL")))

    {
        return ("Real time is  Bigger");
    } else if (sz1 === "M" && (sz2 === "L") || (sz2 === "XL") || (sz2 === "XXL"))

    {
        return ("Real time is  Bigger");
    } else if (sz1 === "L" && (sz2 === "XL") || (sz2 === "XXL"))

    {
        return ("Real time is  Bigger");
    } else if (sz1 === "xL" && (sz2 === "XXL"))

    {
        return ("Real time is  Bigger");
    } else return ("Real time is Smaller");

}




function drawtable(id, data, startDate) {


    var rowLabel = "";



    label = "created";


    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'index');
    dataTable.addColumn('string', 'event');
    dataTable.addColumn('date', 'Start Date');
    dataTable.addColumn('date', 'End Date');

    var finale = data.bugs[0].history[0].when;


    var relevantRows = [];
    dataTable.addRow([0 + "", label, new Date(startDate), new Date(finale)]);

    $.each(data.bugs[0].history, function(historyIndex, historyElem) {

        rowLabel = getUsefullString(historyElem);


        if (rowLabel) {

            //startDate = historyElem.when;
            //dataTable.addRow([historyIndex+1 + "", rowLabel, new Date(startDate), new Date(finale)]);

            relevantRows.push({
                index: historyIndex + 1,
                rowLabel: rowLabel,
                whenDate: historyElem.when
            });
        }
    });

    //var endDate;
    startDate = data.bugs[0].history[0].when
    $.each(relevantRows, function(index, row) {

        dataTable.addRow([row.index + "", row.rowLabel, new Date(startDate), new Date(row.whenDate)]);
        startDate = row.whenDate;

    });

    return dataTable;


}

function getUsefullString(historyElem) {
    var ret = "";
    var displayChange = false;
    var displayString = "";
    var displayStringadd = "";

    var displayStringfield = "";

    $.each(historyElem.changes, function(indexChanges, changesElem) {

        $.each(changesElem, function(key, value) {
            if (key === "added") {

                displayStringadd += value + " ";


            } else if (key === "field_name" && (value === "status" || value === "assigned_to")) {
                displayStringfield += "  " + value + " ";
                displayChange = true;

            }


        });
    });
    displayString += displayStringfield + " : " + displayStringadd

    return displayChange ? displayString : false;
}


function calbackfunc2(titleBug, id, table) {


    var timelineHolder = document.getElementById("timelineHolder");
    var timeline = new google.visualization.Timeline(timelineHolder);

    var options = {

        width: 1800,
        height: 2000,

    };
    timeline.draw(table, options);




}