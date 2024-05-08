<template>
  <div>
    <div class="row">
      <div class="q-pa-md full-width text-white">
        <q-list dark bordered separator class="bg-primary">
          <q-item>
            <q-item-section avatar class="white text-subtitle2 ase-roboto">#</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto">Name</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto">Email</q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            v-for="(info, index) of getPartnersUsersList"
            :key="'companyUSERR' + info.name + '' + index + info.email"
          >
            <q-item-section avatar class="white text-subtitle2 ase-roboto">{{ index + 1 }}</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto">{{ info.name }}</q-item-section>
            <q-item-section class="white text-subtitle2 ase-roboto">{{ info.email }}</q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="col-md-12 col-sm-12 col-xs-12">
        <div class="text-center" style="padding-top: 2%; padding-bottom: 2%" v-if="getPartnersUsersList.length === 0">
          <p class="text-h4 text-weight-bold ase-roboto ase-black-light padding_12 text-center">No Data</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { urlSafeBase64Decode } from 'src/utils/reuseFunctions'

export default {
  name: 'CompanyCoursesTable',
  components: {},
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
      searchRecord: ''
    }
  },
  created() {
    this.fetchPartnerList({
      pagination: {
        partner_id: urlSafeBase64Decode(this.$route.params.partnerId)
      },
      reset: true
    })
  },
  methods: {
    ...mapActions('users', ['fetchPartnerList']),
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
    async searchData(event) {
      const searchList = this.data.filter((data) => data.name.toLowerCase().indexOf(this.searchByName.toLowerCase()) > -1)
      this.cousesList = searchList
    },
    clearSearchData() {
      this.searchByName = ''
      this.cousesList = this.data
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
    ...mapGetters('users', {
      getPartnersUsersList: 'getPartnersUsersList',
      usersPaginationKeyForwardPartner: 'usersPaginationKeyForwardPartner'
    }),
    ...mapGetters('login', {
      roleIsAdmin: 'roleIsAdmin'
    })
  }
}
</script>
