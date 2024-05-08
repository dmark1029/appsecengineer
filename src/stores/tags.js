import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { showLoader } from 'src/utils/loader'

const useTagsStore = defineStore('tagsStore', {
  state: () => ({
    tags: [],
    isLoading: false
  }),
  getters: {
    addedNewPwd: (state) => state.addedNewPwd,
    loading: (state) => state.isLoggedIn,
    fetchUserInfo: () => LocalStorage.getItem('user'),
    fetchErrorMsgs: (state) => state.error_msgs,
    fetchErrorMsgsForgotPwd: (state) => state.error_msgs_forgot_pwd,
    fetchErrorMsgsForgotPwdWithHash: (state) => state.error_msgs_forgot_pwd_with_hash,
    roleIsAdmin() {
      const userInfo = LocalStorage.getItem('user')
      return !(userInfo.email && userInfo.role === 'Analyst')
    }
  },
  actions: {
    SET_TAG_LIST(data) {
      this.tags = data
    },
    PUSH_SINGLE_ITEM(data) {
      this.tags.push(data)
    },
    SET_LOADING(data) {
      this.isLoading = data
      showLoader(data)
    },
    TEMP_REMOVE(data) {
      this.tags = this.tags.filter((item) => item.sk !== data.tag_id)
    },
    PARTIAL_UPDATE(data) {
      this.tags.forEach((item) => {
        if (item.sk === data.tag_id) {
          item.search_name = data.payload.tag_name
          item.tag_name = data.payload.tag_name
        }
      })
    },
    async getTagList(payload) {
      try {
        this.SET_LOADING(true)
        const res = await api.post('tags/search', payload)
        if (res.data.success) {
          this.tags = res.data.data.data
        }
      } catch (err) {
        console.log(err)
      } finally {
        this.SET_LOADING(false)
      }
    },
    async createTag(payload) {
      try {
        this.SET_LOADING(true)
        const res = await api.post('tags', payload)
        if (res.data.success) {
          this.PUSH_SINGLE_ITEM(res.data.data)
          Notify.create({
            message: 'New tag created successfully',
            type: 'positive',
            color: 'green',
            position: 'top'
          })
        }
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({
            message: error.response.data.message,
            color: 'red',
            position: 'top'
          })
        }
      } finally {
        this.SET_LOADING(false)
      }
    },
    async updateTag(data) {
      try {
        this.SET_LOADING(true)
        const res = await api.patch(`tags/${data.tag_id}`, data.payload)
        if (res.data.success) {
          this.PARTIAL_UPDATE(data)
          Notify.create({
            message: 'Tag updated successfully',
            type: 'positive',
            color: 'green',
            position: 'top'
          })
        }
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({
            message: error.response.data.message,
            color: 'red',
            position: 'top'
          })
        }
      } finally {
        this.SET_LOADING(false)
      }
    },
    async deleteTag(payload) {
      try {
        this.SET_LOADING(true)
        const res = await api.delete(`tags/${payload.tag_id}`)
        if (res.data.success) {
          this.TEMP_REMOVE(payload)
          Notify.create({
            message: 'Tag deleted successfully',
            type: 'positive',
            color: 'green',
            position: 'top'
          })
        }
      } catch (error) {
        if (error.response.status === 400) {
          Notify.create({
            message: error.response.data.message,
            color: 'red',
            position: 'top'
          })
        }
      } finally {
        this.SET_LOADING(false)
      }
    }
  }
})

export { useTagsStore }
