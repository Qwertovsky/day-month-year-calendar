

(function() {
  var $, DayMonthYearCalendar;

  $ = jQuery;

  $.fn.extend({
    dayMonthYearCalendar: function(options) {
      return this.each(function(input_field){
        var $this, dayMonthYearCalendar;
        $this = $(this);
        dayMonthYearCalendar = $this.data('dayMonthYearCalendar');
        if (options === 'destroy' && dayMonthYearCalendar instanceof DayMonthYearCalendar) {
          dayMonthYearCalendar.destroy();
        } else if (!(dayMonthYearCalendar instanceof DayMonthYearCalendar)) {
          $this.data('dayMonthYearCalendar', new DayMonthYearCalendar(this, options));
        }
      });
    }
  });

DayMonthYearCalendar = (function() {

    function DayMonthYearCalendar(form_field, options) {
      this.form_field = form_field;
      this.form_field_jq = $(form_field);
      this.options = options || {};
      this.setup_default_options();
      this.setup_html();
    };

    DayMonthYearCalendar.prototype.setup_default_options = function() {
      var currentDate = new Date();
      this.minDate = this.options.minDate || new Date(currentDate.setFullYear(currentDate.getFullYear() - 100));
      this.maxDate = this.options.maxDate || new Date(currentDate.setFullYear(currentDate.getFullYear() + 100));
      this.fullMonthArray = this.options.monthNames || [];
      this.daysClass = this.options.daysClass || 'dmy-cal-days';
      this.monthsClass = this.options.monthsClass || 'dmy-cal-months';
      this.yearsClass = this.options.yearsClass || 'dmy-cal-years';
      this.disabled = this.form_field_jq.prop('disabled');
      this.daysEmptyText = this.options.daysEmptyText || 'dd';
      this.monthsEmptyText = this.options.monthsEmptyText || 'mm';
      this.yearsEmptyText = this.options.yearsEmptyText || 'yyyy';
    };

    DayMonthYearCalendar.prototype.setup_html = function() {
      var _this = this;
      var container_props = {
        'class': this.form_field.className
      };
      this.container = $("<div />", container_props);
      this.container.html('<div class="' + this.daysClass + '">'
                          + '    <select id="days"></select>'
                          + '</div>'
                          + '<div class="' + this.monthsClass + '">'
                          + '  <select id="months"></select>'
                          + '</div>'
                          + '<div class="' + this.yearsClass + '">'
                          + '  <select id="years"></select>'
                          + '</div>');
      this.years = this.container.find('#years');
      this.months = this.container.find('#months');
      this.days = this.container.find('#days');


      this.years.append($('<option selected value="0">' + this.yearsEmptyText + '</option>'));
      for (var i = this.maxDate.getFullYear(); i >= this.minDate.getFullYear(); i--) {
        this.years.append($('<option />').val(i).html(i));
      }

      this.months.append($('<option selected value="0">' + this.monthsEmptyText + '</option>'));
      for (var i = 1; i < 13; i++) {
        this.months.append($('<option />').val(i).html(this.fullMonthArray[i-1] || i));
      }
      
      this.form_field_jq.hide();
      this.form_field_jq.after(this.container);

      this.load_form_field();

      this.container.find('#years, #months').change(function () {
        _this.update_number_of_days(); 
      });
      this.container.find('select').on('change', function () {
          _this.update_form_field();
        });

      this.container.find('select').prop('disabled', this.disabled);
    };

    DayMonthYearCalendar.prototype.update_number_of_days = function() {
      var day = this.days.val() || 0;
      this.days.html('');
      month = this.months.val();
      year = this.years.val();
      days = this.days_in_month(month, year);

      this.days.append($('<option selected value="0">' + this.daysEmptyText + '</option>'));
      for (i=1; i < days+1 ; i++) {
        this.days.append($('<option />').val(i).html(i));
      }

      if (day > days) {
        day = days;
      }
      this.days.val(day);
    };

    DayMonthYearCalendar.prototype.update_form_field = function() {
      var day = this.days.val();
      var month = this.months.val();
      var year = this.years.val();

      if (day > 0 && month > 0 && year > 0) {
        this.form_field_jq.val(this.pad_date_field(day,2)
          + '.' + this.pad_date_field(month,2)
          + '.' + this.pad_date_field(year,4));
      } else {
        this.form_field_jq.val('');
      }
      this.form_field_jq.change();
    };

    DayMonthYearCalendar.prototype.load_form_field = function() {
      var value = this.form_field_jq.val();
      if (value && value.length == 10) {
        var dateFields = value.split('.');
        this.months.val(parseInt(dateFields[1], 10));
        this.years.val(parseInt(dateFields[2], 10));
        this.update_number_of_days();
        this.days.val(parseInt(dateFields[0], 10));
      } else {
        this.update_number_of_days();
      }
    };

    DayMonthYearCalendar.prototype.days_in_month = function(month, year) {
      return new Date(year, month, 0).getDate();
    };

    DayMonthYearCalendar.prototype.pad_date_field = function(value, size) {
      return ('0000' + value).substr(-size); 
    };

    DayMonthYearCalendar.prototype.destroy = function() {
      this.container.remove();
      this.form_field_jq.removeData('dayMonthYearCalendar');
      return this.form_field_jq.show();
    };

    return DayMonthYearCalendar;
  })();

}).call(this);