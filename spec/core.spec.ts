import * as Core from '../core'

describe('~/src/core.ts', () => {
  describe('convert', () => {
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
  })
})
