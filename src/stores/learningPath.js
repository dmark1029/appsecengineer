import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import config from 'src/config'
import { showLoader } from 'src/utils/loader'
import { urlSafeBase64Encode } from 'src/utils/reuseFunctions'

const useLearningPathStore = defineStore('learningPathStore', {
  state: () => ({
    error_msgs: {
      learning_path_name: false,
      learning_path_name_msg: '',
      description: false,
      description_msg: '',
      logo: false,
      logo_msg: '',
      price_id: false,
      price_id_msg: ''
    },
    error_msgs_order: {
      status: false,
      order: false,
      order_msg: '',
      learning_path_id: false,
      learning_path_id_msg: ''
    },
    learningPathEvents: [],
    learningPathEventsDetailed: [],
    learningPathInfo: {},
    learningPathsEnrollmentCounts: {
      data: [],
      labels: []
    },
    learningPathOptions: [],
    listLearningPath: [],
    loading: false,
    paginationKey: {},
    searchByName: '',
    searchFire: false,
    statusOfApi: true,
    descriptiveQuestion: []
  }),
  getters: {
    fetchDetailedLpCourses: (state) => state.learningPathEventsDetailed,
    fetchErrorMsgs: (state) => state.error_msgs,
    fetchErrorMsgsOrder: (state) => state.error_msgs_order,
    fetchLearningPathEvents: (state) => state.learningPathEvents,
    fetchLearningPathsCountsGetter: (state) => state.learningPathsEnrollmentCounts,
    fetchStatusOfApi: (state) => state.statusOfApi,
    instructorPathPaginationKeyForward: (state) => state.paginationKey,
    isLoading: (state) => state.loading,
    learningPathList: (state) => (state.listLearningPath.length > 0 ? [...new Set(state.listLearningPath)] : []),
    learningPathOption: (state) => (state.learningPathOptions.length > 0 ? [...new Set(state.learningPathOptions)] : []),
    searchByNameGetter: (state) => state.searchByName,
    searchFireActive: (state) => state.searchFire,
    singleLearningPathInfo: (state) => (Object.keys(state.learningPathInfo).length > 0 ? state.learningPathInfo : {})
  },
  actions: {
    LOADING(data) {
      this.loading = data
      showLoader(data)
    },
    LIST_LEARNINGPATH(data) {
      const prev = this.listLearningPath
      this.listLearningPath = prev.concat(data)
    },
    CREATE_LEARNINGPATH(data) {
      this.listLearningPath.unshift(data)
    },
    UPDATE_LEARNINGPATH(data) {
      const index = this.listLearningPath.findIndex((lp) => lp.id === data.id)
      this.listLearningPath.splice(index, 1, data)
    },
    DELETE_LEARNINGPATH(data) {
      const index = this.listLearningPath.findIndex((lp) => lp.id === data.learning_path_id)
      this.listLearningPath.splice(index, 1)
    },
    ERROR_MSGS(data) {
      this.error_msgs = Object.assign(this.error_msgs, data)
    },
    ERROR_MSGS_ORDER(data) {
      this.error_msgs_order = Object.assign(this.error_msgs_order, data)
    },
    RESET_LIST_LEARNINGPATH(data) {
      this.listLearningPath = data
    },
    FETCH_LEARNING_PATH(data) {
      this.learningPathInfo = {}
      this.learningPathInfo = data
    },
    OPTION_LEARNING_PATH(data) {
      this.learningPathOptions = data
    },
    LEARNING_PATHS_ENROLLMENT_COUNTS(data) {
      this.learningPathsEnrollmentCounts = data
    },
    LEARNING_PATH_EVENTS(data) {
      this.learningPathEvents = data
    },
    LEARNING_PATH_EVENTS_DETAILED(data) {
      this.learningPathEventsDetailed = data
    },
    STATUS_OF_API(data) {
      this.statusOfApi = data
    },
    PAGINATION_KEY(data) {
      this.paginationKey = data
    },
    SEARCH_BY_NAME(data) {
      this.searchByName = data
    },
    SEARCH_FIRE(data) {
      this.searchFire = data
    },
    SET_DESCRIPTIVE_QUESTION(data) {
      this.descriptiveQuestion = data
    },
    loadingStatus(data) {
      this.LOADING(data)
    },
    errorMsgReset(data) {
      this.ERROR_MSGS(data)
    },
    async searchByNameAction(payload) {
      this.SEARCH_BY_NAME(payload)
    },
    async fetchLearningPaths(payload) {
      this.LOADING(true)
      await api
        .post('learning-path/list', payload.pagination)
        .then((res) => {
          const learningPathData = res.data.data.data.map((data) => ({
            ...data,
            id: data.sk,
            label: data.name || data.learning_path_name,
            value: data.sk
          }))
          this.SEARCH_FIRE(false)
          if (payload.reset) {
            this.RESET_LIST_LEARNINGPATH(learningPathData)
          } else {
            this.LIST_LEARNINGPATH(learningPathData)
          }
          this.PAGINATION_KEY(res.data.data.last_value || {})
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async fetchIndividualLearningPathEvents(payload) {
      this.LOADING(true)
      await api
        .post('learning-path/events', payload)
        .then((res) => {
          const eventsList = []
          res.data.data.forEach((data) => {
            Object.entries(data).forEach(([key, value]) => {
              eventsList.push({
                name: value.name,
                id: key,
                order: value.order
              })
            })
          })
          this.LEARNING_PATH_EVENTS(
            eventsList.sort(function (a, b) {
              return a.order - b.order
            })
          )
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async fetchIndividualLearningPathEventsDetailed(payload) {
      this.LOADING(true)
      await api
        .post('dashboard/get-courses-forlp', payload)
        .then((res) => this.LEARNING_PATH_EVENTS_DETAILED(res.data.data.data))
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async fetchLpCoursesFilters(payload) {
      this.LOADING(true)
      await api
        .post('learning-path/events', payload)
        .then((res) => {
          const eventsList = []
          res.data.data.forEach((data) => {
            Object.entries(data).forEach(([key, value]) => {
              eventsList.push({
                name: value.name,
                id: key,
                order: value.order
              })
            })
          })
          this.LEARNING_PATH_EVENTS(
            eventsList.sort(function (a, b) {
              return a.order - b.order
            })
          )
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async createEventsContentsOrder(payload) {
      this.LOADING(true)
      const errMsgs = {
        status: false,
        order: false,
        order_msg: '',
        learning_path_id: false,
        learning_path_id_msg: ''
      }
      this.ERROR_MSGS_ORDER(errMsgs)
      await api
        .post('learning-path/events/order', payload)
        .then((res) => {
          if (res.data.success) {
            Notify.create({ message: 'Events Contents has been successfully ordered', color: 'green', position: 'top' })
          } else {
            Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: res.data.message })
          }
        })
        .catch((error) => {
          if (error.response.status === 400) {
            const errMsgs = {
              status: true,
              order: false,
              order_msg: '',
              learning_path_id: false,
              learning_path_id_msg: ''
            }
            if (error.response.data.message.order) {
              if (typeof error.response.data.message.order === 'object') {
                let stringData = ''
                Object.entries(error.response.data.message.order).forEach(([key, value]) => {
                  if (typeof value === 'object') {
                    Object.entries(value).forEach(([subkey, subvalue]) => {
                      if (typeof subvalue === 'object') {
                        Object.entries(subvalue).map(([subsubkey, subsubvalue]) => (stringData += `Order=> ${subkey}: ${subsubvalue},`))
                      } else {
                        stringData += ` Order=> ${subkey}: ${subvalue},`
                      }
                    })
                  } else {
                    stringData += `Order => ${key}: ${value},`
                  }
                })
                errMsgs.order = true
                errMsgs.order_msg = stringData
              } else {
                errMsgs.order = true
                errMsgs.order_msg = error.response.data.message.order
              }
            }
            if (error.response.data.message.learning_path_id) {
              if (typeof error.response.data.message.learning_path_id === 'object') {
                errMsgs.learning_path_id = true
                errMsgs.learning_path_id_msg = error.response.data.message.learning_path_id.toString()
              } else {
                errMsgs.learning_path_id = true
                errMsgs.learning_path_id_msg = error.response.data.message.learning_path_id
              }
            }
            if (typeof error.response.data.message === 'string') {
              errMsgs.status = false
              Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
            }
            this.ERROR_MSGS_ORDER(errMsgs)
          } else {
            Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async searchLearningPath(payload) {
      this.LOADING(true)
      api
        .post('list/search', payload.pagination)
        .then((res) => {
          if (res.data.success) {
            const learningPathData = res.data.data.data.map((data) => ({
              name: data.learning_path_name,
              id: data.sk,
              description: data.description
            }))
            this.SEARCH_FIRE(true)
            if (payload.reset) {
              this.RESET_LIST_LEARNINGPATH(learningPathData)
            } else {
              this.LIST_LEARNINGPATH(learningPathData)
            }
            if (res.data.data.pagination) {
              this.PAGINATION_KEY(res.data.data.pagination)
            } else {
              this.PAGINATION_KEY({})
            }
          }
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async createLearningPath(payload) {
      this.LOADING(true)
      this.ERROR_MSGS({
        learning_path_name: false,
        learning_path_name_msg: '',
        description: false,
        description_msg: '',
        logo: false,
        logo_msg: '',
        price_id: false,
        price_id_msg: ''
      })
      this.STATUS_OF_API(true)
      await api
        .post('learning-path/create', payload)
        .then((res) => {
          if (res.data.success) {
            const learningPathData = {
              ...res.data.data,
              id: res.data.data.sk
            }
            this.CREATE_LEARNINGPATH(learningPathData)
            this.STATUS_OF_API(true)
            Notify.create({ message: 'Learning Path has been successfully created', color: 'green', position: 'top' })
          }
        })
        .catch((error) => {
          this.STATUS_OF_API(false)
          if (error.response?.status === 400) {
            const errMsgs = {
              learning_path_name: false,
              learning_path_name_msg: '',
              description: false,
              description_msg: '',
              logo: false,
              logo_msg: ''
            }
            if (error.response.data.message.learning_path_name) {
              if (typeof error.response.data.message.learning_path_name === 'object') {
                errMsgs.learning_path_name = true
                errMsgs.learning_path_name_msg = error.response.data.message.learning_path_name.toString()
              } else {
                errMsgs.learning_path_name = true
                errMsgs.learning_path_name_msg = error.response.data.message.learning_path_name
              }
            }
            if (error.response.data.message.description) {
              if (typeof error.response.data.message.description === 'object') {
                errMsgs.description = true
                errMsgs.description_msg = error.response.data.message.description.toString()
              } else {
                errMsgs.description = true
                errMsgs.description_msg = error.response.data.message.description
              }
            }
            if (error.response.data.message.price_id) {
              if (typeof error.response.data.message.price_id === 'object') {
                errMsgs.price_id = true
                errMsgs.price_id_msg = error.response.data.message.price_id.toString()
              } else {
                errMsgs.price_id = true
                errMsgs.price_id_msg = error.response.data.message.price_id
              }
            }
            if (error.response.data.message.logo) {
              if (typeof error.response.data.message.logo === 'object') {
                errMsgs.logo = true
                errMsgs.logo_msg = error.response.data.message.logo.toString()
              } else {
                errMsgs.logo = true
                errMsgs.logo_msg = error.response.data.message.logo
              }
            }
            this.ERROR_MSGS(errMsgs)
            if (typeof error.response.data.message === 'string') {
              Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
            }
          } else {
            Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: 'Something went wrong' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async fetchLearningPath(payload) {
      this.LOADING(true)
      await api
        .post('learning-path/get', payload)
        .then((res) => {
          if (res.data.success) {
            const learningPathData = {
              name: res.data.data.learning_path_name,
              id: res.data.data.sk,
              description: res.data.data.description,
              learningPathId: urlSafeBase64Encode(res.data.data.sk),
              price_id: res.data.data.price_id || ''
            }
            if (res.data.data.logo) {
              learningPathData.logo = res.data.data.logo + '?' + new Date(new Date().toUTCString()).toLocaleString()
            }
            this.FETCH_LEARNING_PATH(learningPathData)
          }
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    fetchLearningPathsEnrollmentCounts() {
      api
        .get('dashboard/get-learning-path-counts')
        .then((res) => {
          if (res.data.success) {
            const color = ['#246590', '#5AB049', '#F5B041', '#45B39D', '#f08a5d', '#FF5733', '#6f4a8e', '#3282b8', '#00c698', '#0097A7']
            let index = 0
            const learningPathData = []
            const learningPathLabels = []
            res.data.data.data.forEach((data) => {
              learningPathData.push({
                name: data.learning_path_name,
                value: data.count,
                itemStyle: { color: color[index] }
              })
              learningPathLabels.push(data.learning_path_name)
              index += 1
            })
            this.LEARNING_PATHS_ENROLLMENT_COUNTS({
              data: learningPathData,
              labels: learningPathLabels
            })
          }
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
    },
    async updateLearningPath(payload) {
      this.LOADING(true)
      this.STATUS_OF_API(true)
      this.ERROR_MSGS({
        learning_path_name: false,
        learning_path_name_msg: '',
        description: false,
        description_msg: '',
        logo: false,
        logo_msg: '',
        price_id: false,
        price_id_msg: ''
      })
      await api
        .post('learning-path/update', payload)
        .then((res) => {
          if (res.data.success) {
            this.STATUS_OF_API(true)
            const learningPathData = {
              ...res.data.data,
              id: res.data.data.sk
            }
            this.UPDATE_LEARNINGPATH(learningPathData)
            Notify.create({ message: 'Learning Path has been successfully updated', color: 'green', position: 'top' })
          } else {
            this.STATUS_OF_API(false)
          }
        })
        .catch((error) => {
          this.STATUS_OF_API(false)
          if (error.response?.status === 400) {
            const errMsgs = {
              learning_path_name: false,
              learning_path_name_msg: '',
              description: false,
              description_msg: '',
              logo: false,
              logo_msg: ''
            }
            if (error.response.data.message.learning_path_name) {
              if (typeof error.response.data.message.learning_path_name === 'object') {
                errMsgs.learning_path_name = true
                errMsgs.learning_path_name_msg = error.response.data.message.learning_path_name.toString()
              } else {
                errMsgs.learning_path_name = true
                errMsgs.learning_path_name_msg = error.response.data.message.learning_path_name
              }
            }
            if (error.response.data.message.description) {
              if (typeof error.response.data.message.description === 'object') {
                errMsgs.description = true
                errMsgs.description_msg = error.response.data.message.description.toString()
              } else {
                errMsgs.description = true
                errMsgs.description_msg = error.response.data.message.description
              }
            }
            if (error.response.data.message.price_id) {
              if (typeof error.response.data.message.price_id === 'object') {
                errMsgs.price_id = true
                errMsgs.price_id_msg = error.response.data.message.price_id.toString()
              } else {
                errMsgs.price_id = true
                errMsgs.price_id_msg = error.response.data.message.price_id
              }
            }
            if (error.response.data.message.logo) {
              if (typeof error.response.data.message.logo === 'object') {
                errMsgs.logo = true
                errMsgs.logo_msg = error.response.data.message.logo.toString()
              } else {
                errMsgs.logo = true
                errMsgs.logo_msg = error.response.data.message.logo
              }
            }
            this.ERROR_MSGS(errMsgs)
            if (typeof error.response.data.message === 'string') {
              Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
            }
          } else {
            Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: 'Something went wrong' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    deleteLearningPath(payload) {
      this.LOADING(true)
      api
        .post('learning-path/delete', payload)
        .then((res) => {
          if (res.data.success) {
            this.DELETE_LEARNINGPATH(payload)
            Notify.create({ message: 'Learning Path has been successfully deleted', color: 'red', position: 'top' })
          }
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async fetchLearningPathOptions() {
      this.LOADING(true)
      await api
        .get('learning-path/list-options')
        .then((res) => {
          const learningPathOptions = res.data.data.data.map((data) => ({
            value: data.sk,
            label: data.learning_path_name
          }))
          this.OPTION_LEARNING_PATH(learningPathOptions)
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    },
    async generatePathDetail() {
      this.LOADING(true)
      await api
        .get(config.generateQuestionApi + 'generate')
        .then((res) => {
          this.SET_DESCRIPTIVE_QUESTION(res.data.questions)
        })
        .catch((error) => {
          if (error.response.status === 400) {
            Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
          }
        })
        .finally(() => this.LOADING(false))
    }
  }
})
export { useLearningPathStore }
