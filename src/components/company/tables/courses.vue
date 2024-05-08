<template>
  <Page
    v-model:search="searchByName"
    :title="'Courses List'"
    @clearSearchData="clearSearchData"
    @searchData="searchData"
    :isTable="true"
    :isCreateIcon="false"
  >
    <q-table
      :rows="cousesList"
      :columns="columns"
      row-key="index"
      :rows-per-page-options="[0]"
      virtual-scroll
      style="max-height: 70vh"
      hide-bottom
      dark
    >
      <template v-slot:body-cell-Name="props">
        <q-td :props="props">
          <q-item style="max-width: 420px">
            <q-item-section avatar v-if="props.row.logo">
              <q-avatar>
                <img :src="props.row.logo" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="portal_font_family portal_md portal_font_color">
                {{ props.row.event_name }}
                <small><q-chip v-if="props.row.is_event" outline color="orange" text-color="white">Event</q-chip></small>
                <q-tooltip>{{ props.row.event_name }}</q-tooltip>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-td>
      </template>
      <template v-slot:body-cell-Action="props" class="q-table--horizontal-separator thead th">
        <q-td :props="props">
          <q-btn
            round
            color="primary"
            v-if="props.row.achievement_type === 'certificate'"
            icon="send"
            size="sm"
            @click="sendMail(props.row.sk)"
            style="margin-right: 2%"
          >
            <q-tooltip>Send</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <div align="center" v-if="Object.keys(coursesCompanyPaginationKeyForward).length > 0">
      <q-btn
        label="Load More"
        icon="keyboard_arrow_right"
        style="border: 2px solid white; margin: 7px 0px"
        @click="loadMoreCourses(coursesCompanyPaginationKeyForward)"
      />
    </div>
  </Page>
</template>

<script>
import Page from 'components/shared/Page'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'CompanyCoursesTable',
  components: { Page },
  data() {
    return {
      columns: [
        {
          name: 'Name',
          label: 'Name',
          field: 'name',
          sortable: true,
          align: 'left'
        },
        {
          name: 'Action',
          label: 'Action',
          field: 'Action',
          sortable: false,
          align: 'right'
        }
      ],
      cousesList: this.companyInfo.data.events
    }
  },
  props: {
    companyInfo: {}
  },
  created() {
    setTimeout(() => {}, 1000)
  },
  methods: {
    ...mapActions('companycourses', ['fetchCompanyCoursesList', 'searchCompanyCourses', 'searchByNameAction']),
    loadMoreCourses(pagination) {
      let data = {}
      if (Object.keys(pagination).length === 0) {
        data = {
          pagination: {},
          reset: false
        }
        this.fetchCompanyCoursesList(data)
      } else {
        data = {
          pagination: {
            pagination: pagination
          },
          reset: false
        }
        if (this.searchByNameGetter && this.searchFireActive) {
          data.pagination.pk = 'users'
          data.pagination.query = this.searchByNameGetter
          this.searchCompanyCourses(data)
        } else {
          this.fetchCompanyCoursesList(data)
        }
      }
    },
    async searchData() {
      if (this.searchByNameGetter === ' ' || this.searchByNameGetter === '') {
        this.cousesList = this.companyInfo.data.events
      } else {
        const searchList = this.companyInfo.data.events.filter(
          (data) => data.event_name.toLowerCase().indexOf(this.searchByName.toLowerCase()) > -1
        )
        this.cousesList = searchList
      }
    },
    clearSearchData() {
      this.searchByName = ''
      this.cousesList = this.companyInfo.data.events
    },
    sendMail(id) {
      this.$emit('sendMail', { show: true, id: id })
    }
  },
  computed: {
    searchByName: {
      get() {
        return this.$store.state.companycourses.searchByName
      },
      set(value) {
        this.$store.commit('companycourses/SEARCH_BY_NAME', value)
      }
    },
    ...mapGetters('companycourses', {
      getCompanyCoursesListGetter: 'getCompanyCoursesListGetter',
      searchByNameGetter: 'searchByNameGetter',
      searchFireActive: 'searchFireActive',
      coursesCompanyPaginationKeyForward: 'coursesCompanyPaginationKeyForward'
    }),
    ...mapGetters('login', {
      roleIsAdmin: 'roleIsAdmin'
    })
  }
}
</script>
