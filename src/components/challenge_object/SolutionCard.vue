<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-down" transition-hide="flip-down">
    <q-card style="min-width: 700px" dark>
      <q-card-section>
        <div class="text-subtitle1 ase-roboto text-weight-normal">
          <q-icon name="code" />
          Attach/Detach Solution
          <hr />
        </div>
      </q-card-section>
      <q-form greedy @submit="onSubmit()">
        <q-card-section class="q-pt-none">
          <q-list class="row">
            <q-item class="col-12 q-mb-md">
              <q-item-section>
                <BaseFile
                  label="Solution File *"
                  multiple
                  :rules="required"
                  v-model="solution.file"
                  @update:model-value="uploadFile($event)"
                />
                <p v-if="fetchErrorMsgs.file" class="text-caption text-negative">{{ fetchErrorMsgs.file_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item v-for="(url, index) in solution.url" class="col-12 q-py-none" :key="index">
              <q-item-section>
                <BaseInput copyButton label="URL" readonly :rules="required" :model-value="url" />
                <p v-if="fetchErrorMsgs.url" class="text-caption text-negative">{{ fetchErrorMsgs.url_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item v-if="solution.created_on" class="col-6">
              <q-item-section>Created On: {{ solution.created_on }}</q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions>
          <q-btn class="col-grow" color="orange" outline @click="onCancel()">Cancel</q-btn>
          <q-btn v-if="solution.url.length" class="col-grow" color="negative" @click="onDetach()">Detach Solutions</q-btn>
          <q-btn v-if="solution.url.length" class="col-grow" color="positive" type="submit">Save</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import BaseFile from 'components/shared/BaseFile.vue'
import BaseInput from 'components/shared/BaseInput.vue'
import { required } from 'src/utils/rules'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'SolutionCard',
  props: ['id', 'show'],
  components: { BaseFile, BaseInput },
  data: () => ({
    solution: {
      file: [],
      url: [],
      created_on: ''
    },
    required,
    dataShow: true
  }),
  async created() {
    await this.getSolution({ challenge_id: this.id }).then(() => {
      this.solution.url = this.fetchSolution.instructions
      this.solution.created_on = new Date(this.fetchSolution.created_at).toLocaleString()
    })
  },
  methods: {
    ...mapActions('challenge', ['getSolution', 'uploadSolution', 'attachSolution', 'detachSolution']),
    ...mapActions('course', ['S3UploadFile']),
    async uploadFile(files) {
      this.solution.url = []
      for (const file of files) {
        let responsePost = {}
        await this.uploadSolution({ challenge_id: this.id, script_file: file.name }).then((res) => (responsePost = res.data))
        const showDesignDataGetter = responsePost.post_url
        if (showDesignDataGetter.url && showDesignDataGetter.fields.key) {
          const signedUrl = showDesignDataGetter.url
          const form = {}
          Object.entries(showDesignDataGetter.fields).forEach(([field, value]) => (form[field] = value))
          form.file = file
          await this.S3UploadFile({ signedUrl, form })
          if (this.statusOfS3Getter === 204) {
            this.solution.url.push(responsePost.solution_url)
          }
          if (this.statusOfS3Getter === 400) {
            this.$q.notify({
              type: 'negative',
              position: 'top',
              progress: true,
              icon: 'warning',
              timeout: 1100,
              message: 'Session Expired!!!'
            })
            localStorage.removeItem('token')
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('breadcrumbs')
            this.$router.push('/')
          }
        }
      }
    },
    async onDetach() {
      await this.detachSolution({ challenge_id: this.id }).then(() => {
        this.solution.url = []
        this.solution.created_on = ''
      })
    },
    async onSubmit() {
      const payload = {
        challenge_id: this.id,
        instructions: this.solution.url
      }
      await this.attachSolution(payload).then(() => this.onCancel())
    },
    onCancel() {
      this.$emit('onCancel', { show: true })
      this.challenge = {}
    }
  },
  computed: {
    ...mapGetters('challenge', ['fetchSolution', 'fetchErrorMsgs']),
    ...mapGetters('course', ['statusOfS3Getter'])
  }
}
</script>
