import { purgeMapMutations } from '../../transformers/purgeMapMutations'
import { __purgeTest } from '../utils/purge'

describe('~/src/transformers/purgeMapMutations.spec.ts', () => {
  test('convert', () => {
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
    expect(__purgeTest(source, [purgeMapMutations])).toBe(output)
  })
})
