/*
 * DayMonthYearCalendar, three selects calendar, should be applied to standart input field.
 * 
 * Copyright 2014 Qwertovsky
 * https://bitbucket.org/qwertovsky/day-month-year-calendar
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
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

        DayMonthYearCalendar.prototype.options = {
            minDate: new Date(new Date().setFullYear(new Date().getFullYear() - 100))
            , maxDate: new Date(new Date().setFullYear(new Date().getFullYear() + 100))
            , fullMonthArray: []
            , daysClass: 'dmy-cal-days'
            , monthsClass: 'dmy-cal-months'
            , yearsClass: 'dmy-cal-years'
            , daysEmptyText: 'dd'
            , monthsEmptyText: 'mm'
            , yearsEmptyText: 'yyyy'
            , hideInput: true
        };

        function DayMonthYearCalendar(form_field, options) {
            this.form_field = form_field;
            this.form_field_jq = $(form_field);
            this.setup_options(options);
            this.setup_html();
        };

        DayMonthYearCalendar.prototype.setup_options = function(options) {
            this.options.disabled = this.form_field_jq.prop('disabled');
            var container_props = {
                    'class': this.form_field.className
                };
            this.options.container = $("<div />", container_props);
            $.extend(this.options, options);
            this.container = this.options.container;
        };

        DayMonthYearCalendar.prototype.setup_html = function() {
            var _this = this;
            var daysId = this.form_field.id + 'Days';
            var monthsId = this.form_field.id + 'Months';
            var yearsId = this.form_field.id + 'Years';
            this.container.html('<div class="' + this.options.daysClass + '">'
                + '    <select id="' + daysId + '"></select>'
                + '</div>'
                + '<div class="' + this.options.monthsClass + '">'
                + '  <select id="' + monthsId + '"></select>'
                + '</div>'
                + '<div class="' + this.options.yearsClass + '">'
                + '  <select id="' + yearsId + '"></select>'
                + '</div>');
            this.years = this.container.find('#' + yearsId);
            this.months = this.container.find('#' + monthsId);
            this.days = this.container.find('#' + daysId);


            this.years.append($('<option selected value="0">' + this.options.yearsEmptyText + '</option>'));
            for (var i = this.options.maxDate.getFullYear(); i >= this.options.minDate.getFullYear(); i--) {
                this.years.append($('<option />').val(i).html(i));
            }

            this.append_options(this.months, 1, 12, this.options.fullMonthArray, this.options.monthsEmptyText);

            this.append_options(this.days, 1, 31, [], this.options.daysEmptyText);
            
            if (this.options.hideInput) {
                this.form_field_jq.hide();
            }
            this.form_field_jq.after(this.container);

            this.load_form_field();

            this.months.change(function () {
                _this.update_number_of_days(); 
            });
            this.years.change(function () {
                _this.update_number_of_months(); 
            });
            this.container.find('select').on('change', function () {
              _this.update_form_field();
            });

            this.container.find('select').prop('disabled', this.disabled);
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

            this.append_options(this.months, minMonth, maxMonth, this.options.fullMonthArray, this.options.monthsEmptyText);

            if (month > maxMonth) {
                month = maxMonth;
            }
            if (month != 0 && month < minMonth) {
                month = minMonth;
            }
            this.months.val(month);
            this.months.change();
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
                this.years.val(parseInt(dateFields[2], 10));
                this.update_number_of_months();
                this.months.val(parseInt(dateFields[1], 10));
                this.update_number_of_days();
                this.days.val(parseInt(dateFields[0], 10));
            }
        };

        DayMonthYearCalendar.prototype.days_in_month = function(month, year) {
            return new Date(year, month, 0).getDate();
        };

        DayMonthYearCalendar.prototype.pad_date_field = function(value, size) {
            return ('0000' + value).substr(-size); 
        };

        DayMonthYearCalendar.prototype.append_options = function(select, min, max, keys, emptyText) {
            select.append($('<option selected value="0">' + emptyText + '</option>'));
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