function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] > b[1]) ? -1 : 1;
    }
}

function getLastTuesdayOf(date) {
    var d = new Date(date),
        day = d.getDay(),
        diff = (day <= 2) ? (7 - 2 + day ) : (day - 2);

    d.setDate(d.getDate() - diff);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);

    return d.getTime();
}