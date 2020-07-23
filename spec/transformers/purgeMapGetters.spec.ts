import { purgeMapGetters } from '../../transformers/purgeMapGetters'
import { __purgeTest } from '../utils/purge'

describe('~/src/transformers/purgeMapGetters.spec.ts', () => {
  test('convert', () => {
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
    expect(__purgeTest(source, [purgeMapGetters])).toBe(output)
  })
})
