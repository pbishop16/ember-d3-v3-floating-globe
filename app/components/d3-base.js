import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNameBindings: ['elementClass'],

  elementClass: null,

  formattedClassName: computed('elementClass', function() {
    return `.${this.get('elementClass')}`;
  }),
});
