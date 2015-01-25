$('.example_input').val($.datepicker.formatDate('dd.mm.yy', new Date()));

$('#example_1 .example_input').dayMonthYearCalendar({
    container: $('#example_1 .selects_container')
    , hideInput: false
});
$('#example_2 .example_input').dayMonthYearCalendar({
    container: $('#example_2 .selects_container')
    , hideInput: false
    , monthNames: $.datepicker._defaults.monthNames
});
$('#example_3 .example_input').dayMonthYearCalendar({
    container: $('#example_3 .selects_container')
    , hideInput: false
    , monthNames: $.datepicker._defaults.monthNames
    , minDate: new Date(2010, 3, 15)
    , maxDate: new Date()
});
$('#dateinput_4').val($.datepicker.formatDate('MM d, yy', new Date()));
$('#example_4 .example_input').dayMonthYearCalendar({
    container: $('#example_4 .selects_container')
    , hideInput: false
    , monthNames: $.datepicker._defaults.monthNames
    , minDate: new Date(2010, 3, 15)
    , maxDate: new Date()
    , dateFormatFunction: function(date) {
    	return $.datepicker.formatDate('MM d, yy',date);
    }
    , dateParseFunction: function(dateString){
    	return moment(dateString, 'MMM D, YYYY').toDate();
    }
});