<template>
  <div>
    <ChallengeTable
      v-if="!isCreate"
      :title="'Challenge List'"
      :tableData="fetchListChallenges"
      @createPage="showCreateChallenge($event)"
      @solutionPage="showSolutionCard($event)"
      @vScriptPage="showValidatorScriptList($event)"
      @updatePage="showUpdateChallengeObject($event)"
      @deletePage="showChallengeObjectDelete($event)"
    />
    <template v-if="isCreate">
      <CreateChallenge :id="updateId" :show="isCreate" @onCancel="cancelCreateChallenge($event)" />
    </template>
    <template v-if="isSolutionCard">
      <SolutionCard :id="updateId" :show="isSolutionCard" @onCancel="cancelSolutionCard($event)" />
    </template>
    <template v-if="isValidatorScriptList">
      <ValidatorScriptList
        :id="updateId"
        :show="isValidatorScriptList"
        @onCreate="showCreateValidatorScript($event)"
        @onUpdate="showUpdateValidatorScript($event)"
        @onCancel="cancelValidatorScriptList($event)"
      />
    </template>
    <template v-if="isValidatorScript">
      <CreateValidatorScript :id="updateId" :data="updateData" :show="isValidatorScript" @onCancel="cancelValidatorScript($event)" />
    </template>
    <Delete
      v-if="isDelete"
      :show="isDelete"
      :header="'a Challenge'"
      @confirmDelete="challengeConfirmDeletion($event)"
      @confirmDeleteCancel="challengeConfirmDeleteCancel($event)"
    />
  </div>
</template>

<script>
import ChallengeTable from 'components/challenge_object/ChallengeTable'
import CreateChallenge from 'components/challenge_object/CreateChallenge'
import SolutionCard from 'components/challenge_object/SolutionCard'
import CreateValidatorScript from 'components/challenge_object/CreateValidatorScript'
import ValidatorScriptList from 'components/challenge_object/ValidatorScriptList'
import Delete from 'components/shared/Delete.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'ChallengeIndex',
  components: { ChallengeTable, CreateChallenge, Delete, SolutionCard, CreateValidatorScript, ValidatorScriptList },
  data: () => ({
    isCreate: false,
    isSolutionCard: false,
    isValidatorScript: false,
    isValidatorScriptList: false,
    search: '',
    updateData: {},
    updateId: '',
    isDelete: false,
    challengeId: ''
  }),
  async created() {
    if (this.fetchListChallenges.length === 0 && this.searchByNameGetter.length === 0 && !this.searchFireActive) {
      await this.fetchChallenges({ pagination: {}, reset: false })
    }
  },
  methods: {
    ...mapActions('challenge', ['fetchChallenges', 'deleteChallenge', 'errorMsgReset']),
    ...mapActions('labs', ['addOptionsDocs']),
    showCreateChallenge(event) {
      this.addOptionsDocs([])
      this.updateId = ''
      this.errorMsgReset({
        status: true,
        company_name: false,
        company_name_msg: '',
        is_event: false,
        is_event_msg: '',
        num_users: false,
        num_users_msg: '',
        minutes_per_user: false,
        minutes_per_user_msg: '',
        start_date: false,
        start_date_msg: '',
        end_date: false,
        end_date_msg: '',
        payment_complete: false,
        payment_complete_msg: '',
        domains: false,
        domains_msg: '',
        events: false,
        events_msg: '',
        is_poc: false,
        is_poc_msg: '',
        subscription_type: false,
        subscription_type_msg: ''
      })
      this.isCreate = event.show
    },
    async showUpdateChallengeObject(event) {
      this.errorMsgReset({
        status: true,
        name: false,
        name_msg: '',
        description: false,
        description_msg: '',
        lab_id: false,
        lab_id_msg: '',
        approx_time: false,
        approx_time_msg: '',
        instructions: false,
        instructions_msg: '',
        nature: false,
        nature_msg: '',
        difficulty: false,
        difficulty_msg: '',
        learning_path_id: false,
        learning_path_id_msg: '',
        hints: false,
        hints_msg: '',
        tags: false,
        tags_msg: '',
        score: false,
        score_msg: '',
        is_active: false,
        is_active_msg: ''
      })
      if (event.show) {
        if (this.isCreate) {
          this.isCreate = false
        } else {
          this.addOptionsDocs([])
          this.isCreate = true
          this.updateId = ''
          this.updateId = event.id
        }
      }
    },
    showChallengeObjectDelete(event) {
      if (event.show) {
        this.challengeId = ''
        this.challengeId = event.id
        this.isDelete = true
      }
    },
    cancelCreateChallenge() {
      this.isCreate = false
      this.isValidatorScriptList = false
      this.isValidatorScript = false
    },
    showSolutionCard(event) {
      this.updateId = event.id
      this.isSolutionCard = true
    },
    showValidatorScriptList(event) {
      this.updateId = event.id
      this.isValidatorScriptList = true
      this.isValidatorScript = false
    },
    showCreateValidatorScript() {
      this.updateData = {}
      this.isValidatorScript = true
    },
    showUpdateValidatorScript(event) {
      this.updateData = event
      this.isValidatorScript = true
    },
    cancelSolutionCard() {
      this.isSolutionCard = false
    },
    cancelValidatorScriptList() {
      this.isCreate = false
      this.isValidatorScriptList = false
      this.isValidatorScript = false
    },
    cancelValidatorScript() {
      this.isCreate = false
      this.isValidatorScriptList = true
      this.isValidatorScript = false
    },
    challengeConfirmDeletion(event) {
      if (event.show) {
        this.deleteChallenge({ challenge_id: this.challengeId })
        this.challengeId = ''
        this.isDelete = false
      }
    },
    challengeConfirmDeleteCancel(event) {
      if (event.show) {
        if (this.isDelete) {
          this.isDelete = false
          this.challengeId = ''
          return
        }
        this.isDelete = true
      }
    }
  },
  computed: {
    ...mapGetters('challenge', ['fetchListChallenges', 'searchByNameGetter', 'searchFireActive'])
  }
}
</script>
