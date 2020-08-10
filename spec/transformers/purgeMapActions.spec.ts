import { purgeMapActions } from '../../transformers/purgeMapActions'
import { __purgeTest } from '../utils/purge'

describe('~/src/transformers/purgeMapActions.spec.ts', () => {
  test('Convert TypeScript code', () => {
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
        loginUser(payload?: unknown): unknown { return this.$store.dispatch("loginUser", payload); },
        switchToEditorView(payload?: unknown): unknown { return this.$store.dispatch("ui/switchToEditorView", payload); }
    }
});
`.replace(/\n/, '')
    expect(__purgeTest(source, [purgeMapActions])).toBe(output)
  })

  test('Convert JavaScript code', () => {
    const source = `
// [vuex-map-purge]: js
import Vue from 'vue'

export default Vue.extend({
  methods: {
    ...mapActions(['loginUser']),
    ...mapActions('ui', ['switchToEditorView'])
  }
})
`.replace(/\n/, '')

    const output = `
// [vuex-map-purge]: js
import Vue from "vue";
export default Vue.extend({
    methods: {
        loginUser(payload) { return this.$store.dispatch("loginUser", payload); },
        switchToEditorView(payload) { return this.$store.dispatch("ui/switchToEditorView", payload); }
    }
});
`.replace(/\n/, '')
    expect(__purgeTest(source, [purgeMapActions])).toBe(output)
  })
})
