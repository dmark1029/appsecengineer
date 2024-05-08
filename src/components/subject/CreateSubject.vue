<template>
  <Page :title="title">
    <q-form greedy @submit="onSubmit()">
      <q-list class="row">
        <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <q-item-section>
            <BaseInput autofocus required :rules="required" v-model="subject.subject_name" />
          </q-item-section>
        </q-item>
        <q-item class="col-lg-6 col-md-6 col-sm-12 col-xs-12">
          <q-item-section>
            <BaseInput label="Description" required :rules="required" type="textarea" v-model="subject.description" />
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-actions>
        <q-btn class="col-grow" color="orange" outline @click="onCancel()">Cancel</q-btn>
        <q-btn class="col-grow" color="positive" type="submit">Save</q-btn>
      </q-card-actions>
    </q-form>
  </Page>
</template>

<script>
import BaseInput from 'components/shared/BaseInput.vue'
import Page from 'components/shared/coursePage'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { required } from 'src/utils/rules'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CreateSubject',
  components: { Page, BaseInput },
  props: ['id', 'title', 'subjectId'],
  data() {
    return {
      subject: {
        subject_name: '',
        description: '',
        event_id: urlSafeBase64Decode(this.id)
      },
      required
    }
  },
  watch: {
    singleSubjectInfo: {
      handler() {
        this.subject.subject_name = this.singleSubjectInfo.name
        this.subject.description = this.singleSubjectInfo.description
      }
    }
  },
  methods: {
    ...mapActions('subject', ['createSubject', 'updateSubject']),
    async onSubmit() {
      if (this.subjectId) {
        this.subject.subject_id = this.subjectId
        await this.updateSubject(this.subject)
      } else {
        await this.createSubject(this.subject)
      }
      this.subject = {}
      this.onCancel()
    },
    onCancel() {
      this.$emit('onCacel', { show: true })
    }
  },
  computed: {
    ...mapGetters('subject', ['singleSubjectInfo'])
  }
}
</script>
