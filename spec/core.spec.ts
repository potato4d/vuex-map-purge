import * as Core from '../core'

describe('~/src/core.ts', () => {
  describe('convert', () => {
    test('mapGetters', () => {
      const source = `
import Vue from 'vue'

export default Vue.extend({
  computed: {
    ...mapGetters(['user']),
    ...mapGetters('ui', ['isEditorView'])
  }
})
`.replace(/\n/, '')

      const output = `
import Vue from "vue";
export default Vue.extend({
    computed: {
        user() { return this.$store.getters["user"]; },
        isEditorView() { return this.$store.getters["ui/isEditorView"]; }
    }
});
`.replace(/\n/, '')
      expect(Core.purge(source)).toBe(output)
    })

    test('mapMutations', () => {
      const source = `
import Vue from 'vue'

export default Vue.extend({
  methods: {
    ...mapMutations(['loginUser']),
    ...mapMutations('ui', ['switchToEditorView'])
  }
})
`.replace(/\n/, '')

      const output = `
import Vue from "vue";
export default Vue.extend({
    methods: {
        loginUser(payload) { return this.$store.commit("loginUser", payload); },
        switchToEditorView(payload) { return this.$store.commit("ui/switchToEditorView", payload); }
    }
});
`.replace(/\n/, '')
      expect(Core.purge(source)).toBe(output)
    })

    test('mapActions', () => {
      const source = `
import Vue from 'vue'

export default Vue.extend({
  methods: {
    ...mapActions(['loginUser']),
    ...mapActions('ui', ['switchToEditorView'])
  }
})
`.replace(/\n/, '')

      const output = `
import Vue from "vue";
export default Vue.extend({
    methods: {
        loginUser(payload) { return this.$store.dispatch("loginUser", payload); },
        switchToEditorView(payload) { return this.$store.dispatch("ui/switchToEditorView", payload); }
    }
});
`.replace(/\n/, '')
      expect(Core.purge(source)).toBe(output)
    })
  })
})
