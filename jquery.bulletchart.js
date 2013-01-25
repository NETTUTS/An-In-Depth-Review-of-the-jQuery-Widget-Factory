(function ($) {

  /***********************************************************
   *          Base BulletChart widget
   ***********************************************************
   */
  $.widget('nt.bulletchart', {
    options: {
      // percentage: 0 - 100
      size: 100,

      //  [{ title: 'Sample Bar', value: 75, css: '' }],
      bars: [],

      //  [{ title: 'Sample Marker', value: 50, css: '' }],
      markers: [],

      // ticks -- percent values
      ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    },

    widgetEventPrefix: 'bulletchart:',

    _create: function () {
      this.element.addClass('bullet-chart');

      // chart container
      this._container = $('<div class="chart-container"></div>')
        .appendTo(this.element);

      this._setOptions({
        'size': this.options.size,
        'ticks': this.options.ticks,
        'bars': this.options.bars,
        'markers': this.options.markers
      });

    },
    _destroy: function () {
      this.element.removeClass('bullet-chart');
      this.element.empty();
      this._super();
    },


    _setOption: function (key, value) {
      var self = this,
        prev = this.options[key],
        fnMap = {
          'bars': function () {
            createBars(value, self);
          },
          'markers': function () {
            createMarkers(value, self);
          },
          'ticks': function () { createTickBar(value, self); },
          'size': function () {
            self.element.find('.chart-container')
              .css('width', value + '%');
          }
        };

      // base
      this._super(key, value);

      if (key in fnMap) {
        fnMap[key]();

        // Fire event
        this._triggerOptionChanged(key, prev, value);
      }
    },

    _triggerOptionChanged: function (optionKey, previousValue, currentValue) {
      this._trigger('setOption', {type: 'setOption'}, {
        option: optionKey,
        previous: previousValue,
        current: currentValue
      });
    }
  });

  /***********************************************************
   *          Extended BulletChart widget - with Legend support
   ***********************************************************
   */
  $.widget('nt.bulletchart2', $.nt.bulletchart, {
    options: {
      // Show/hide legend
      legend: true
    },

    // this ensures we keep the same namespace as the base
    widgetEventPrefix: $.nt.bulletchart.prototype.widgetEventPrefix,

    _create: function () {
      var self = this;

      this._legend = $('<div class="legend"></div>')
        .appendTo(this.element);

      // Events
      this._on({
        'click .legend-item': function (event) {
          var elt = $(event.currentTarget),
            item = elt.data('chart-item'),
            selector = '[' + item.type + '-index=' + item.index + ']';

          this.element.find(selector).fadeToggle();
          elt.toggleClass('fade');
        }
      });

      // Apply legend on changes to markers and bars
      this.element.on('bulletchart:setoption', function (event, data) {
        if (data.option === 'markers') {
          createLegend(data.current, self.options.bars, self);
        }
        else if (data.option === 'bars') {
          createLegend(self.options.markers, data.current, self);
        }
      });

      // Call the base
      this._super();

      this._setOption('legend', this.options.legend);
    },

    _destroy:function(){
      this.element.find('.legend').empty();
      this._off(this.element, 'click .legend-item');
      this._super();
    },

    _setOption: function (key, value) {
      // Call base
      this._super(key, value);

      if (key === 'legend') {
        var prev = this.options[key];
        this.element.find('.legend').toggle(value);

        this._triggerOptionChanged(key, prev, value);
      }
    }
  });

// Private Helper functions
  function createTickBar(ticks, widget) {

    // Clear existing
    widget._container.find('.tick-bar').remove();

    var tickBar = $('<div class="tick-bar"></div>');
    $.each(ticks, function (idx, tick) {
      var t = $('<div class="tick"></div>')
        .css('left', tick + '%');

      var tl = $('<div class="tick-label"></div>')
        .css('left', tick + '%')
        .text(tick);

      tickBar.append(t);
      tickBar.append(tl);
    });

    widget._container.append(tickBar);

  }

  function createMarkers(markers, widget) {

    // Clear existing
    widget._container.find('.marker').remove();

    $.each(markers, function (idx, m) {
      var marker = $('<div class="marker"></div>')
        .css({ left: m.value + '%' })
        .addClass(m.css)
        .attr('marker-index', idx);

      widget._container.append(marker);
    });

  }

  function createBars(bars, widget) {

    // Clear existing
    widget._container.find('.bar').remove();

    $.each(bars, function (idx, bar) {
      var bar = $('<div class="bar"></div>')
        .css({ left: 0, width: '0%' })
        .addClass(bar.css)
        .attr('bar-index', idx)
        .animate({
          width: bar.value + '%'
        });

      widget._container.append(bar);
    });

  }

  function createLegend(markers, bars, widget) {

    // Clear existing
    widget._legend.empty();

    var items = $.map(markers,function (m, idx) {
      return $.extend({ type: 'marker', index: idx }, m);
    }).concat(
        $.map(bars, function (b, idx) {
          return $.extend({ type: 'bar', index: idx }, b);
        })
      );

    $.each(items, function (idx, m) {
      var marker = $('<span class="legend-symbol"></span>')
          .addClass(m.type)
          .addClass(m.css),
        label = $('<span class="legend-label"></span>')
          .text(m.title);

      $('<div class="legend-item"></div>')
        .append(marker)
        .append(label)
        .data('chart-item', { type: m.type, index: m.index })
        .appendTo(widget._legend);
    });

  }
})(jQuery);