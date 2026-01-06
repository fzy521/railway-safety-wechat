import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  _id: string
  _openid: string
  name: string
  avatarUrl: string
  phone: string
  email: string
  deptId: string
  position: string
  roles: string[]
  status: number
  inspections: number
  incidents: number
  certificates: number
  experience: number
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem('token') || '')
  const userInfo = ref<UserInfo | null>(null)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  function getUserInfo(): UserInfo | null {
    if (!userInfo.value) {
      const saved = localStorage.getItem('userInfo')
      if (saved) {
        userInfo.value = JSON.parse(saved)
      }
    }
    return userInfo.value
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    token,
    userInfo,
    setToken,
    setUserInfo,
    getUserInfo,
    logout
  }
})