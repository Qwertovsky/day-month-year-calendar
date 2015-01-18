/*
 * DayMonthYearCalendar, three selects calendar, should be applied to standart input field.
 * 
 * Copyright 2015 Qwertovsky
 * https://github.com/Qwertovsky/day-month-year-calendar
 *
 * MIT License
 *
 */


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

        function DayMonthYearCalendar(form_field, opt) {
            this.form_field = form_field;
            this.form_field_jq = $(form_field);
            this.setup_options(opt);
            this.setup_html();
        };

        DayMonthYearCalendar.prototype.setup_options = function(opt) {
            this.options = {
                minDate: new Date(new Date().setFullYear(new Date().getFullYear() - 100))
                , maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 100))
                , monthNames: []
                , daysClass: 'dmy-cal-days'
                , monthsClass: 'dmy-cal-months'
                , yearsClass: 'dmy-cal-years'
                , daysEmptyText: 'dd'
                , monthsEmptyText: 'mm'
                , yearsEmptyText: 'yyyy'
                , hideInput: true
                , dateFormatFunction: this.format_date
                , dateParseFunction: this.parse_date
            };
            this.options.disabled = this.form_field_jq.prop('disabled');
            var container_props = {
                    'class': this.form_field.className
                };
            this.options.container = $("<div />", container_props);
            $.extend(this.options, opt);
            this.container = this.options.container;
            if (!opt.container) {
                this.form_field_jq.parent().append(this.container);
            }
        };

        DayMonthYearCalendar.prototype.setup_html = function() {
            var _this = this;
            var daysId = this.form_field.id + 'Days';
            var monthsId = this.form_field.id + 'Months';
            var yearsId = this.form_field.id + 'Years';
            
            this.container.prepend('<div class="' + this.options.daysClass + '">'
                + '    <select id="' + daysId + '"></select>'
                + '</div>'
                + '<div class="' + this.options.monthsClass + '">'
                + '  <select id="' + monthsId + '"></select>'
                + '</div>'
                + '<div class="' + this.options.yearsClass + '">'
                + '  <select id="' + yearsId + '"></select>'
                + '</div>');
            
            this.years = $(document.getElementById(yearsId));
            this.months = $(document.getElementById(monthsId));
            this.days = $(document.getElementById(daysId));


            this.years.append($('<option selected="selected" value="0" disabled="disabled">' + this.options.yearsEmptyText + '</option>'));
            for (var i = this.options.maxDate.getFullYear(); i >= this.options.minDate.getFullYear(); i--) {
                this.years.append($('<option />').val(i).html(i));
            }

            this.append_options(this.months, 1, 12, this.options.monthNames, this.options.monthsEmptyText);

            this.append_options(this.days, 1, 31, [], this.options.daysEmptyText);
            
            if (this.options.hideInput) {
                this.form_field_jq.hide();
            }

            this.load_form_field();

            this.bind_events();
            
            this.form_field_jq.bind('change', this.on_form_field_change);

            this.container.find('select').prop('disabled', this.disabled);
        };
            

        DayMonthYearCalendar.prototype.on_form_field_change = function() {
            var calendar = $(this).data('dayMonthYearCalendar');
            calendar.container.find('select').unbind('change');
            calendar.load_form_field();
            calendar.bind_events();
        };

        DayMonthYearCalendar.prototype.bind_events = function() {
            var _this = this;
            this.days.on('change', function () {
                _this.update_form_field();
                _this.days.trigger('dmy:update');
            });
            this.months.on('change', function () {
                _this.update_number_of_days();
                _this.update_form_field();
                _this.days.trigger('dmy:update');
                _this.months.trigger('dmy:update');
            });
            this.years.on('change', function () {
                _this.update_number_of_months();
                _this.update_number_of_days();
                _this.update_form_field();
                _this.days.trigger('dmy:update');
                _this.months.trigger('dmy:update');
                _this.years.trigger('dmy:update');
            });
        };

        DayMonthYearCalendar.prototype.update_number_of_days = function() {
            var day = this.days.val() || 0;
            this.days.html('');
            var month = this.months.val();
            var year = this.years.val();
            var minYear = this.options.minDate.getFullYear();
            var maxYear = this.options.maxDate.getFullYear();
            var minMonth = this.options.minDate.getMonth() + 1;
            var maxMonth = this.options.maxDate.getMonth() + 1;

            var minDay = 1;
            if (minYear == year && minMonth == month) {
                minDay = this.options.minDate.getDate();
            }
            var maxDay = this.days_in_month(month, year);
            if (maxYear == year && maxMonth == month) {
                maxDay = this.options.maxDate.getDate();
            }

            this.append_options(this.days, minDay, maxDay, [], this.options.daysEmptyText);

            if (day > maxDay) {
                day = maxDay;
            }
            if (day != 0 && day < minDay) {
                day = minDay;
            }
            this.days.val(day);
        };

        DayMonthYearCalendar.prototype.update_number_of_months = function() {
            var month = this.months.val() || 0;
            this.months.html('');

            var year = this.years.val();
            var minYear = this.options.minDate.getFullYear();
            var maxYear = this.options.maxDate.getFullYear();
            var minMonth = 1;
            if (minYear == year) {
                minMonth = this.options.minDate.getMonth() + 1;
            }
            var maxMonth = 12;
            if (maxYear == year) {
                maxMonth = this.options.maxDate.getMonth() + 1;
            }

            this.append_options(this.months, minMonth, maxMonth, this.options.monthNames, this.options.monthsEmptyText);

            if (month > maxMonth) {
                month = maxMonth;
            }
            if (month != 0 && month < minMonth) {
                month = minMonth;
            }
            this.months.val(month);
        };

        DayMonthYearCalendar.prototype.update_form_field = function() {
            var day = this.days.val();
            var month = this.months.val();
            var year = this.years.val();

            if (day > 0 && month > 0 && year > 0) {
                var date = new Date(year, month-1, day);
                this.form_field_jq.val(this.options.dateFormatFunction(date));
            } else {
                this.form_field_jq.val('');
            }
            this.form_field_jq.unbind('change', this.on_form_field_change);
            this.form_field_jq.change();
            this.form_field_jq.bind('change', this.on_form_field_change);
        };

        DayMonthYearCalendar.prototype.load_form_field = function() {
            var value = this.form_field_jq.val();
            var date = this.options.dateParseFunction(value);
            if (date) {
                var yearValue = date.getFullYear();
                if (this.years.find('option[value="' + yearValue + '"]').length > 0) {
                    this.years.val(yearValue);
                } else {
                    this.years.val(0);
                }
                this.update_number_of_months();
                var monthValue = date.getMonth() + 1;
                if (this.months.find('option[value="' + monthValue + '"]').length > 0) {
                    this.months.val(monthValue);
                } else {
                    this.months.val(0);
                }
                this.update_number_of_days();
                var dayValue = date.getDate();
                if (this.days.find('option[value="' + dayValue + '"]').length > 0) {
                    this.days.val(dayValue);
                } else {
                    this.days.val(0);
                }

                this.days.trigger('dmy:update');
                this.months.trigger('dmy:update');
                this.years.trigger('dmy:update');
            }
        };

        DayMonthYearCalendar.prototype.days_in_month = function(month, year) {
            return new Date(year, month, 0).getDate();
        };

        DayMonthYearCalendar.prototype.format_date = function(date) {
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var resultString = ('0000' + day).substr(-2)
                + '.' + ('0000' + month).substr(-2)
                + '.' + ('0000' + year).substr(-4);
            return resultString;
        };

        DayMonthYearCalendar.prototype.parse_date = function(dateString) {
            var resultDate = undefined;
            if (dateString && dateString.length == 10) {
                var dateFields = dateString.split('.');
                var yearValue = parseInt(dateFields[2], 10);
                var monthValue = parseInt(dateFields[1], 10);
                var dayValue = parseInt(dateFields[0], 10);
                resultDate = new Date(yearValue, monthValue - 1, dayValue);
            }
            return resultDate;
        };

        DayMonthYearCalendar.prototype.append_options = function(select, min, max, keys, emptyText) {
            select.append($('<option selected="selected" value="0" disabled="disabled">' + emptyText + '</option>'));
            for (var i = min; i <= max; i++) {
                select.append($('<option />').val(i).html(keys[i-1] || i));
            }
        };

        DayMonthYearCalendar.prototype.destroy = function() {
            this.container.remove();
            this.form_field_jq.removeData('dayMonthYearCalendar');
            return this.form_field_jq.show();
        };

        return DayMonthYearCalendar;
    })();

})(this);