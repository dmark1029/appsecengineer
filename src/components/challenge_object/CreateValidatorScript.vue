<template>
  <q-dialog v-model="dataShow" persistent transition-show="flip-down" transition-hide="flip-down">
    <q-card dark style="width: 750px; max-width: 90vw">
      <q-card-section>
        <div class="text-subtitle1">
          <q-icon name="code" />
          {{ data.sk ? 'Update Validator Script' : 'Create Validator Script' }}
          <q-separator spaced dark />
        </div>
      </q-card-section>
      <q-form greedy @submit="onSubmit()">
        <q-card-section class="q-pt-none">
          <q-list class="row">
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput autofocus label="Script Name *" required :rules="minLength(2)" v-model="validator_script.name" />
                <p v-if="fetchErrorMsgs.name" class="text-caption text-negative">{{ fetchErrorMsgs.name_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseSelect label="Script Type *" :options="script_type_options" :rules="required" v-model="validator_script.type" />
                <p v-if="fetchErrorMsgs.type" class="text-caption text-negative">{{ fetchErrorMsgs.type_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12" v-if="!isScriptTypeCallback">
              <q-item-section>
                <BaseFile clearable v-model="validator_script.file" @update:model-value="uploadFile($event)" />
                <p v-if="fetchErrorMsgs.file" class="text-caption text-negative">{{ fetchErrorMsgs.file_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12" v-if="!isScriptTypeCallback">
              <q-item-section>
                <BaseInput copyButton label="Script URL *" :maxlength="-1" readonly required v-model="validator_script.url" />
                <p v-if="fetchErrorMsgs.url" class="text-caption text-negative">{{ fetchErrorMsgs.url_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput label="Invoke Order" type="number" v-model="validator_script.invoke_order" />
                <p v-if="fetchErrorMsgs.invoke_order" class="text-caption text-negative">{{ fetchErrorMsgs.invoke_order_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12" v-if="!isScriptTypeCallback">
              <q-item-section>
                <BaseInput label="Code Dir File" v-model="validator_script.code_dir_file" />
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12" v-if="!isScriptTypeCallback">
              <q-item-section>
                <BaseInput label="Target URI" v-model="validator_script.target_uri" />
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12" v-if="!isScriptTypeCallback">
              <q-item-section>
                <BaseInput label="Entrypoint" required v-model="validator_script.entrypoint" />
                <p v-if="fetchErrorMsgs.entrypoint" class="text-caption text-negative">{{ fetchErrorMsgs.entrypoint_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput label="Output File *" required :rules="minLength(2)" v-model="validator_script.output_file" />
                <p v-if="fetchErrorMsgs.output_file" class="text-caption text-negative">{{ fetchErrorMsgs.output_file_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12" v-if="!isScriptTypeCallback">
              <q-item-section>
                <BaseInput label="Script Out File *" required :rules="minLength(2)" v-model="validator_script.script_out_file" />
                <p v-if="fetchErrorMsgs.script_out_file" class="text-caption text-negative">{{ fetchErrorMsgs.script_out_file_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12">
              <q-item-section>
                <BaseInput label="Validate Query *" required :rules="minLength(2)" v-model="validator_script.validate_query" />
                <p v-if="fetchErrorMsgs.validate_query" class="text-caption text-negative">{{ fetchErrorMsgs.validate_query_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-sm-6 col-xs-12" v-if="!isScriptTypeCallback">
              <q-item-section>
                <BaseInput label="Run Command *" required :rules="minLength(2)" v-model="validator_script.run_command" />
                <p v-if="fetchErrorMsgs.run_command" class="text-caption text-negative">{{ fetchErrorMsgs.run_command_msg }}</p>
              </q-item-section>
            </q-item>
            <q-item class="col-12">
              <q-item-section>
                <BaseInput autogrow label="Valid Expr" :maxlength="-1" v-model="validator_script.valid_expr" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions>
          <q-btn class="col-grow" color="orange" outline @click="onCancel()">Back</q-btn>
          <q-btn class="col-grow" color="positive" @click="onSubmit()">Save</q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import BaseFile from 'components/shared/BaseFile.vue'
import BaseInput from 'components/shared/BaseInput.vue'
import BaseSelect from 'components/shared/BaseSelect.vue'
import { replaceEmptyString } from 'src/utils/challenge'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'
import { minLength, required } from 'src/utils/rules'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ValidatorScript',
  props: ['data', 'id', 'show'],
  components: { BaseFile, BaseInput, BaseSelect },
  data: () => ({
    columns: [
      { name: 'Name', label: 'Name', field: 'script_name', sortable: true, align: 'left' },
      { name: 'Date', label: 'Date', field: 'created_on', sortable: true, align: 'left' },
      { name: 'Action', label: 'Action', field: 'Action', sortable: false, align: 'right' }
    ],
    validator_script: {
      name: '',
      type: '',
      file: [],
      url: '',
      invoke_order: 0,
      code_dir_file: '',
      target_uri: '',
      entrypoint: '',
      output_file: '',
      script_out_file: '',
      validate_query: '',
      valid_expr: '',
      run_command: ''
    },
    script_type_options: [
      { value: 'offensive', label: 'Offensive' },
      { value: 'defensive', label: 'Defensive' },
      { value: 'callback', label: 'Callback' }
    ],
    minLength,
    required,
    dataShow: true
  }),
  created() {
    this.resetValidation()

    if (this.data.sk) {
      this.validator_script.name = this.data.script_name
      this.validator_script.type = this.data.script_type
      this.validator_script.file = this.data.file
      this.validator_script.url = this.data.script_url
      this.validator_script.invoke_order = this.data.invoke_order
      this.validator_script.code_dir_file = this.data.code_dir_file
      this.validator_script.target_uri = this.data.target_uri
      this.validator_script.entrypoint = this.data.entrypoint
      this.validator_script.output_file = this.data.output_file
      this.validator_script.script_out_file = this.data.script_out_file
      this.validator_script.validate_query = this.data.validate_query
      this.validator_script.run_command = this.data.run_command
      this.validator_script.valid_expr = urlSafeBase64Decode(this.data.valid_expr)
    }
  },
  methods: {
    ...mapActions('challenge', [
      'addValidatorScript',
      'updateValidatorScript',
      'uploadValidatorScript',
      'fetchListValidatorScripts',
      'errorMsgReset'
    ]),
    ...mapActions('course', { S3UploadFileCourse: 'S3UploadFile' }),
    resetValidation() {
      const errorMsgs = {
        status: true,
        name: false,
        name_msg: '',
        type: false,
        type_msg: '',
        url: false,
        url_msg: '',
        entrypoint: false,
        entrypoint_msg: '',
        output_file: false,
        output_file_msg: '',
        script_out_file: false,
        script_out_file_msg: '',
        validate_query: false,
        validate_query_msg: '',
        run_command: false,
        run_command_msg: ''
      }
      this.errorMsgReset(errorMsgs)
    },
    async uploadFile(file) {
      let responsePost = {}
      const payload = {
        challenge_id: this.id,
        script_file: file.name
      }
      await this.uploadValidatorScript(payload)
        .then((res) => {
          responsePost = res.data
          this.validator_script.url = res.data.script_url
        })
        .catch((err) => console.error(err))
      const showDesignDataGetter = responsePost.post_url
      if (showDesignDataGetter.url && showDesignDataGetter.fields.key) {
        const signedUrl = showDesignDataGetter.url
        const form = {}
        Object.entries(showDesignDataGetter.fields).forEach(([field, value]) => {
          form[field] = value
        })
        form.file = file
        this.validator_script.file = file.name
        await this.S3UploadFileCourse({ signedUrl, form })
        if (this.statusOfS3Getter === 204) {
          this.validator_script.file = file
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
    },
    base64encode(str) {
      const encode = encodeURIComponent(str).replace(/%([a-f0-9]{2})/gi, (m, $1) => String.fromCharCode(parseInt($1, 16)))
      return btoa(encode)
    },
    getCallbackPayload(payload) {
      return {
        script_name: payload.script_name,
        script_type: payload.script_type,
        invoke_order: parseInt(payload.invoke_order),
        output_file: payload.output_file,
        valid_expr: payload.valid_expr,
        challenge_id: payload.challenge_id,
        validate_query: payload.validate_query
      }
    },
    async onSubmit() {
      const payload = {
        challenge_id: this.id,
        script_name: this.validator_script.name,
        script_type: this.validator_script.type.value,
        script_url: this.validator_script.url,
        invoke_order: parseInt(this.validator_script.invoke_order),
        code_dir_file: this.validator_script.code_dir_file,
        target_uri: this.validator_script.target_uri,
        entrypoint: this.validator_script.entrypoint,
        output_file: this.validator_script.output_file,
        script_out_file: this.validator_script.script_out_file,
        validate_query: this.validator_script.validate_query,
        valid_expr: this.base64encode(this.validator_script.valid_expr),
        run_command: this.validator_script.run_command
      }

      replaceEmptyString(payload, ['target_uri'])

      const requestPayload = this.isScriptTypeCallback ? this.getCallbackPayload(payload) : payload

      if (this.data.sk) {
        requestPayload.script_id = this.data.sk
        await this.updateValidatorScript(requestPayload)
      } else {
        await this.addValidatorScript(requestPayload)
      }
      if (this.fetchStatusOfApi) {
        this.validator_script = {
          status: true,
          name: false,
          name_msg: '',
          type: false,
          type_msg: '',
          file: false,
          file_msg: '',
          url: false,
          url_msg: '',
          invoke_order: false,
          invoke_order_msg: '',
          code_dir_file: false,
          code_dir_file_msg: '',
          target_uri: false,
          target_uri_msg: '',
          entrypoint: false,
          entrypoint_msg: '',
          output_file: false,
          output_file_msg: '',
          script_out_file: false,
          script_out_file_msg: '',
          valid_expr: false,
          valid_expr_msg: '',
          run_command: false,
          run_command_msg: ''
        }
        this.fetchListValidatorScripts({ challenge_id: this.id })
        this.onCancel()
      }
    },
    onCancel() {
      this.$emit('onCancel', { show: true })
      this.challenge = {}
    }
  },
  computed: {
    ...mapGetters('challenge', ['fetchStatusOfApi', 'fetchErrorMsgs']),
    ...mapGetters('course', ['statusOfS3Getter']),
    isScriptTypeCallback() {
      return this.validator_script?.type?.value === 'callback' || this.validator_script?.type === 'callback'
    }
  }
}
</script>
