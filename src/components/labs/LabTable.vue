<template>
  <q-tabs active-color="white" align="justify" class="text-grey" dense indicator-color="white" v-model="tab">
    <q-tab name="lab" label="Labs" />
    <q-tab name="ou" label="OU" />
  </q-tabs>
  <q-separator dark />
  <q-tab-panels animated dark v-model="tab">
    <q-tab-panel class="q-pa-none" name="lab">
      <Page
        :isCreateIcon="roleIsAdmin"
        :isTable="true"
        showSearch
        title="Labs"
        v-model:search="searchByName"
        @clearSearchData="clearSearchData"
        @createPage="createNewLab"
        @searchData="searchData"
      >
        <div class="flex items-center justify-center q-mb-md">
          Labs
          <q-toggle
            checked-icon="fas fa-chess-board"
            color="orange"
            false-value="lab"
            true-value="challenge"
            unchecked-icon="science"
            v-model="labsOrChallenges"
          />
          Challenges
        </div>
        <q-table
          class="q-table th.sortable sticky-header-table"
          :columns="columns"
          dark
          :rows="labsOrChallenges === 'lab' ? fetchListLabs : fetchListChallengeLabs"
          hide-bottom
          row-key="sk"
          :rows-per-page-options="[0]"
          virtual-scroll
          :visible-columns="roleIsAdmin ? ['name', 'actions'] : ['name']"
        >
          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <q-item>
                <q-item-section>
                  <q-item-label class="portal_font_family portal_md portal_font_color">
                    {{ props.row.name }}
                    <q-badge color="green" size="xs" class="ase-roboto" v-if="props.row.isChallenge && props.row.challenge_id">
                      Challenge
                    </q-badge>
                    <q-badge color="orange" size="xs" class="ase-roboto" v-else-if="props.row.isChallenge">Challenge</q-badge>
                    <q-tooltip>{{ props.row.name }}</q-tooltip>
                    <br />
                    <label dark caption class="text-grey text-caption">{{ props.row.sk }}</label>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td class="q-gutter-x-sm" :props="props">
              <q-btn color="warning" flat icon="edit" round size="sm" @click="updateLab(props.row.sk)">
                <q-tooltip>Update</q-tooltip>
              </q-btn>
              <q-btn color="negative" flat icon="delete" round size="sm" @click="deleteLab(props.row.sk)">
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
          <template v-slot:bottom-row>
            <q-tr v-if="Object.keys(challengeLabPaginationKeyForward).length && labsOrChallenges === 'challenge'">
              <q-td :colspan="2" style="padding: 0">
                <q-separator dark />
                <div class="q-pa-md text-center">
                  <q-btn
                    icon="chevron_right"
                    label="Load More Challenges"
                    style="border: 2px solid white"
                    @click="loadMore(challengeLabPaginationKeyForward)"
                  />
                </div>
              </q-td>
            </q-tr>
            <q-tr v-if="Object.keys(labPaginationKeyForward).length && labsOrChallenges === 'lab'">
              <q-td :colspan="2" style="padding: 0">
                <q-separator dark />
                <div class="q-pa-md text-center">
                  <q-btn
                    icon="chevron_right"
                    label="Load More Labs"
                    style="border: 2px solid white"
                    @click="loadMore(labPaginationKeyForward)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
        <q-dialog v-model="showOUPopUp" persistent transition-show="flip-down" transition-hide="flip-down">
          <q-card class="bg-primary text-white q-pa-sm" style="min-width: 700px; min-height: 30vh">
            <q-bar class="full-width no-padding">
              OU Id Info
              <q-space />
              <q-btn dense flat icon="close" v-close-popup>
                <q-tooltip content-class="bg-white text-primary">Close</q-tooltip>
              </q-btn>
            </q-bar>
            <q-card-section>
              <OuDetails />
            </q-card-section>
          </q-card>
        </q-dialog>
      </Page>
    </q-tab-panel>
    <q-tab-panel name="ou">
      <OuDetails />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script>
import Page from 'components/shared/Page'
import { mapActions, mapGetters } from 'vuex'
import OuDetails from './OuDetails.vue'

export default {
  name: 'LabTable',
  components: { Page, OuDetails },
  emits: ['createNewlab', 'updateLab', 'deleteLab', 'searchData', 'clearSearchData'],
  data() {
    return {
      showOUPopUp: false,
      search: '',
      tab: 'lab',
      labsOrChallenges: 'lab',
      pagination: { sortBy: 'desc', descending: false, page: 1, rowsPerPage: 8 },
      columns: [
        { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
        { name: 'actions', label: '', field: 'actions', sortable: false, align: 'right' }
      ]
    }
  },
  watch: {
    labsOrChallenges: {
      handler(value) {
        this.saveStateLabsOrChallenges(value)
      }
    }
  },
  async created() {
    const data = { pagination: {}, reset: true }
    if (!this.fetchListLabs.lengt) {
      await this.fetchLabs(data)
    }
    if (!this.fetchListChallengeLabs.length) {
      data.pagination = { type: 'challenge' }
      await this.fetchChallengeLabs(data)
    }
    this.labsOrChallenges = this.getLabsOrChallenges
  },
  methods: {
    ...mapActions('labs', ['fetchLabs', 'searchLabs', 'searchByNameAction', 'fetchChallengeLabs', 'saveStateLabsOrChallenges']),
    createNewLab(event) {
      if (event.show) {
        this.$emit('createNewlab', { show: true })
      }
    },
    addOUIDs(id) {
      this.showOUPopUp = true
    },
    cancelOUIDsPopUp(id) {
      this.showOUPopUp = false
    },
    updateLab(id) {
      this.$emit('updateLab', { show: true, id: id })
    },
    deleteLab(id) {
      this.$emit('deleteLab', { show: true, id: id })
    },
    loadMore(pagination) {
      const data = {
        pagination: Object.keys(pagination).length !== 0 ? { pagination } : {},
        reset: false
      }

      if (this.labsOrChallenges === 'challenge') {
        data.pagination.query = 'challenge'
        this.fetchChallengeLabs(data)
      } else {
        this.fetchLabs(data)
      }
    },
    clearSearchData() {
      this.searchByNameAction('')
      const data = { pagination: {}, reset: true }
      if (this.labsOrChallenges === 'challenge') {
        data.pagination.pk = 'challenge'
        this.fetchChallengeLabs(data)
      } else {
        this.fetchLabs(data)
      }
    },
    async searchData() {
      const data = { pagination: {}, reset: true }
      if (!(this.searchByNameGetter === ' ' || this.searchByNameGetter === '')) {
        data.pagination = { pk: this.labsOrChallenges, query: this.searchByNameGetter }
      }
      await this.searchLabs(data)
    }
  },
  computed: {
    searchByName: {
      get() {
        return this.$store.state.labs.searchByName
      },
      set(value) {
        this.$store.commit('labs/SEARCH_BY_NAME', value)
      }
    },
    ...mapGetters('labs', [
      'fetchListLabs',
      'fetchListChallengeLabs',
      'challengeLabPaginationKeyForward',
      'searchByNameGetter',
      'getLabsOrChallenges',
      'labPaginationKeyForward'
    ]),
    ...mapGetters('login', ['roleIsAdmin'])
  }
}
</script>

<style lang="sass">
.sticky-header-table
  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th,
  thead tr th
    background-color: #191919
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
</style>
