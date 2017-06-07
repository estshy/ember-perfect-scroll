import Ember from 'ember';
import layout from './template';


const {
  $,
  get,
  set,
  run,
  isPresent,
  computed,
  isEmpty,
  guidFor
} = Ember;

// Perfect Scrollbar scroll events
const psEvents = [
  'ps-scroll-y',
  'ps-scroll-x',
  'ps-scroll-up',
  'ps-scroll-down',
  'ps-scroll-left',
  'ps-scroll-right',
  'ps-y-reach-start',
  'ps-y-reach-end',
  'ps-x-reach-start',
  'ps-x-reach-end'
];


export default Ember.Component.extend({
  classNames: "ps-content",
  layout: layout,

  // Internal id for element
  scrollId: null,

  // Perfect scrollbar related settings
  wheelSpeed: 1,
  wheelPropagation: false,
  swipePropagation: true,
  minScrollbarLength: null,
  maxScrollbarLength: null,
  useBothWheelAxes: false,
  useKeyboard: true,
  suppressScrollX: false,
  suppressScrollY: false,
  scrollXMarginOffset: 0,
  scrollYMarginOffset: 0,
  includePadding: false,
  theme: 'default',

  _scrollTop: 0,
  scrollTop: computed('_scrollTop', {
    get() {
      return get(this, '_scrollTop') || 0;
    },
    set(key, value) {
      set(this, `_${key}`, value);
      run.schedule('afterRender', () => {
        this.element[key] = value;
        window.Ps.update(this.element);
      });
    }
  }),
  _scrollLeft: 0,
  scrollLeft: computed('_scrollLeft', {
    get() {
      return get(this, '_scrollLeft') || 0;
    },
    set(key, value) {
      set(this, `_${key}`, value);
      run.schedule('afterRender', () => {
        this.element[key] = value;
        window.Ps.update(this.element);
      });
    }
  }),

  scrolled(evt){
    this.setProperties({
      "_scrollTop": evt.target.scrollTop,
      "_scrollLeft": evt.target.scrollLeft
    });
  },


  init(){
    this._super(...arguments);

    if (isEmpty(get(this, 'scrollId'))) {
      set(this, 'scrollId', `perfect-scroll-${guidFor(this)}`);
    }
    set(this, 'elementId', get(this, 'scrollId'));
  },

  didInsertElement() {
    this._super(...arguments);

    run.schedule('afterRender', () => {
      window.Ps.initialize(this.element, this._getOptions());

      // TODO: This should possibly be put somewhere else.
      // Ideally, this handler would wrap any ps-scroll-y or -x handlers that are passed to this component, and then call them after it's done.
      // This is necessary to update the scrollTop and scrollLeft bound properties
      this.$().on('ps-scroll-y ps-scroll-x', (e) => {
        get(this, "scrolled").call(this, e);
      });

      this.bindEvents();
    });
  },

  didRender() {
    window.Ps.update(this.element);
  },

  willDestroyElement() {
    this._super(...arguments);


    if (this.element) {
      window.Ps.destroy(this.element);
    }

    this.unbindEvents();
  },

  /**
   * Binds perfect-scrollbar events to function
   * and then calls related events if user gives the action
   */
  bindEvents() {
    let self = this;
    let mapping = {};

    psEvents.map(evt => {
      mapping[evt] = function() {
        self.callEvent(evt);
      };

      this.$().on(evt, mapping[evt].bind(this));
    });

    set(this, 'mapping', mapping);
  },

  /**
   * Calls perfect-scrollbar
   * @param  {String} evt perfect-scrollbar event name
   */
  callEvent(evt) {
    if (isPresent(get(this, evt))) {
      this.sendAction(evt);
    }
  },

  /**
   * Unbinds all event listeners
   */
  unbindEvents() {
    let mapping = get(this, 'mapping');

    psEvents.map(evt => {
      this.$().off(evt, run.cancel(this, mapping[evt].bind(this)));
    });
  },

  _getOptions() {
    return {
      wheelSpeed            : get(this, 'wheelSpeed'),
      wheelPropagation      : get(this, 'wheelPropagation'),
      swipePropagation      : get(this, 'swipePropagation'),
      minScrollbarLength    : get(this, 'minScrollbarLength'),
      maxScrollbarLength    : get(this, 'maxScrollbarLength'),
      useBothWheelAxes      : get(this, 'useBothWheelAxes'),
      useKeyboard           : get(this, 'useKeyboard'),
      suppressScrollX       : get(this, 'suppressScrollX'),
      suppressScrollY       : get(this, 'suppressScrollY'),
      scrollXMarginOffset   : get(this, 'scrollXMarginOffset'),
      scrollYMarginOffset   : get(this, 'scrollYMarginOffset'),
      includePadding        : get(this, 'includePadding'),
      theme                 : get(this, 'theme'),
    };
  }
});
