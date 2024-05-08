import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { showLoader } from 'src/utils/loader'
import { urlSafeBase64Encode } from 'src/utils/reuseFunctions'

const useInstructorStore = defineStore('instructorStore', {
  state: () => ({
    error_msgs: {
      instructor_name: false,
      instructor_name_msg: '',
      about: false,
      about_msg: '',
      photo: false,
      photo_msg: '',
      photo_name: false,
      photo_name_msg: ''
    },
    instructorInfo: {},
    instructorOptions: [],
    listInstructors: [],
    loading: false,
    paginationKey: {},
    searchByName: '',
    searchFire: false,
    statusOfApi: true
  }),
  getters: {
    fetchErrorMsgs: (state) => state.error_msgs,
    fetchlistInstructors: (state) => state.listInstructors,
    fetchStatusOfApi: (state) => state.statusOfApi,
    instructorOption: (state) => (state.instructorOptions.length > 0 ? [...new Set(state.instructorOptions)] : []),
    instructorPaginationKeyForward: (state) => state.paginationKey,
    isLoading: (state) => state.loading,
    searchByNameGetter: (state) => state.searchByName,
    searchFireActive: (state) => state.searchFire,
    singleInstructorInfo: (state) => (Object.keys(state.instructorInfo).length > 0 ? state.instructorInfo : [])
  },
  actions: {
    LOADING(data) {
      this.loading = data
      showLoader(data)
    },
    LIST_INSTRUCTOR(data) {
      const prev = this.listInstructors
      this.listInstructors = prev.concat(data)
    },
    CREATE_INSTRUCTOR(data) {
      this.listInstructors.unshift(data)
    },
    UPDATE_INSTRUCTOR(data) {
      const index = this.listInstructors.findIndex((instructor) => instructor.id === data.id)
      this.listInstructors.splice(index, 1, data)
    },
    DELETE_INSTRUCTOR(data) {
      const index = this.listInstructors.findIndex((instructor) => instructor.id === data.instructor_id)
      this.listInstructors.splice(index, 1)
    },
    RESET_LIST_INSTRUCTOR(data) {
      this.listInstructors = data
    },
    PAGINATION_KEY(data) {
      this.paginationKey = data
    },
    FETCH_INSTRUCTOR_INFO(data) {
      this.instructorInfo = {}
      this.instructorInfo = data
    },
    OPTION_INSTRUCTOR(data) {
      this.instructorOptions = data
    },
    ERROR_MSGS(data) {
      this.error_msgs = Object.assign(this.error_msgs, data)
    },
    STATUS_OF_API(data) {
      this.statusOfApi = data
    },
    SEARCH_BY_NAME(data) {
      this.searchByName = data
    },
    SEARCH_FIRE(data) {
      this.searchFire = data
    },
    loadingStatus(data) {
      this.LOADING(data)
    },
    errorMsgReset(data) {
      this.ERROR_MSGS(data)
    },
    async fetchInstructors(payload) {
      this.LOADING(true)
      try {
        const res = await api.post('instructor/list', payload.pagination)
        if (res.data.success) {
          const instructorList = res.data.data.data.map((instructor) => ({
            ...instructor,
            id: instructor.sk
          }))
          if (payload.reset) {
            this.RESET_LIST_INSTRUCTOR(instructorList)
          } else {
            this.LIST_INSTRUCTOR(instructorList)
          }
          this.PAGINATION_KEY(res.data.data.last_value || {})
          this.SEARCH_FIRE(false)
        }
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      } finally {
        this.LOADING(false)
      }
    },
    async searchInstructor(payload) {
      this.LOADING(true)
      try {
        const res = await api.post('list/search', payload.pagination)
        if (res.data.success) {
          const instructorList = res.data.data.data.map((instructor) => ({
            name: instructor.instructor_name,
            id: instructor.sk,
            about: instructor.about,
            photo: instructor.photo
          }))

          this.SEARCH_FIRE(true)
          if (payload.reset) {
            this.RESET_LIST_INSTRUCTOR(instructorList)
          } else {
            this.LIST_INSTRUCTOR(instructorList)
          }
          if (res.data.data.pagination) {
            this.PAGINATION_KEY(res.data.data.pagination)
          } else {
            this.PAGINATION_KEY({})
          }
        }
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      } finally {
        this.LOADING(false)
      }
    },
    async searchByNameAction(payload) {
      this.SEARCH_BY_NAME(payload)
    },
    async createInstructor(payload) {
      this.LOADING(true)
      this.ERROR_MSGS({
        instructor_name: false,
        instructor_name_msg: '',
        about: false,
        about_msg: '',
        photo: false,
        photo_msg: '',
        photo_name: false,
        photo_name_msg: ''
      })
      this.STATUS_OF_API(true)

      try {
        const res = await api.post('instructor/create', payload)
        if (res.data.success) {
          this.CREATE_INSTRUCTOR(res.data.data)
          this.STATUS_OF_API(true)
          Notify.create({ message: 'Instructor has been successfully created', color: 'green', position: 'top' })
        }
      } catch (error) {
        if (error.response.status === 400) {
          this.LOADING(false)
          this.STATUS_OF_API(false)
          if (error.response.status === 400) {
            const errMsgs = {
              instructor_name: false,
              instructor_name_msg: '',
              about: false,
              about_msg: '',
              photo: false,
              photo_msg: '',
              photo_name: false,
              photo_name_msg: ''
            }
            if (error.response.data.message.about) {
              if (typeof error.response.data.message.about === 'object') {
                errMsgs.about = true
                errMsgs.about_msg = error.response.data.message.about.toString()
              } else {
                errMsgs.about = true
                errMsgs.about_msg = error.response.data.message.about
              }
            }
            if (error.response.data.message.instructor_name) {
              if (typeof error.response.data.message.instructor_name === 'object') {
                errMsgs.instructor_name = true
                errMsgs.instructor_name_msg = error.response.data.message.instructor_name.toString()
              } else {
                errMsgs.instructor_name = true
                errMsgs.instructor_name_msg = error.response.data.message.instructor_name
              }
            }
            if (error.response.data.message.photo) {
              if (typeof error.response.data.message.photo === 'object') {
                errMsgs.photo = true
                errMsgs.photo_msg = error.response.data.message.photo.toString()
              } else {
                errMsgs.photo = true
                errMsgs.photo_msg = error.response.data.message.photo
              }
            }
            if (error.response.data.message.photo_name) {
              if (typeof error.response.data.message.photo_name === 'object') {
                errMsgs.photo_name = true
                errMsgs.photo_name_msg = error.response.data.message.photo_name.toString()
              } else {
                errMsgs.photo_name = true
                errMsgs.photo_name_msg = error.response.data.message.photo_name
              }
            }
            this.ERROR_MSGS(errMsgs)
            if (typeof error.response.data.message === 'string') {
              Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
            }
          } else {
            Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
          }
        }
      } finally {
        this.LOADING(false)
      }
    },
    async fetchInstructor(payload) {
      this.LOADING(true)
      try {
        const res = await api.post('instructor/get', payload)
        if (res.data.success) {
          const instructorInfo = {
            instructor_name: res.data.data.instructor_name,
            id: res.data.data.sk,
            about: res.data.data.about,
            instructorId: urlSafeBase64Encode(res.data.data.sk),
            image: res.data.data.photo + '?' + new Date(new Date().toUTCString()).toLocaleString(),
            imageName: res.data.data.photo_name
          }
          this.FETCH_INSTRUCTOR_INFO(instructorInfo)
        }
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      } finally {
        this.LOADING(false)
      }
    },
    async updateInstructor(payload) {
      this.LOADING(true)
      this.STATUS_OF_API(true)
      try {
        const res = await api.post('instructor/update', payload)
        if (res.data.success) {
          const instructorInfo = {
            ...res.data.data,
            id: res.data.data.sk
          }
          this.UPDATE_INSTRUCTOR(instructorInfo)
          this.STATUS_OF_API(true)
          Notify.create({ message: 'Instructor has been successfully updated', color: 'green', position: 'top' })
        }
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      } finally {
        this.LOADING(false)
      }
    },
    deleteInstructor(payload) {
      this.LOADING(true)
      try {
        const res = api.post('instructor/delete', payload)
        if (res.data.success) {
          this.DELETE_INSTRUCTOR(payload)
          Notify.create({ message: 'Instructor has been successfully deleted', color: 'red', position: 'top' })
        }
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      } finally {
        this.LOADING(false)
      }
    },
    fetchInstructorOptions() {
      this.LOADING(true)
      try {
        const res = api.get('instructor/option')
        const instructorOptions = res.data.data.data.map((instructor) => ({
          value: instructor.sk,
          label: instructor.instructor_name,
          img: instructor.photo
        }))
        instructorOptions.sort((a, b) => {
          const nameA = a.label.toLowerCase()
          const nameB = b.label.toLowerCase()
          if (nameA < nameB) return -1
          if (nameA > nameB) return 1
          return 0
        })
        this.OPTION_INSTRUCTOR(instructorOptions)
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({ message: error.response.data.message, color: 'red', position: 'top' })
        }
      } finally {
        this.LOADING(false)
      }
    }
  }
})
export { useInstructorStore }
