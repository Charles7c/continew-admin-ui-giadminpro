import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import { resetRouter } from '@/router'
import {
  type AccountLoginReq,
  AuthTypeEnum,
  type EmailLoginReq,
  type PhoneLoginReq,
  type UserInfo,
  accountLogin as accountLoginApi,
  emailLogin as emailLoginApi,
  getUserInfo as getUserInfoApi,
  logout as logoutApi,
  phoneLogin as phoneLoginApi,
  socialLogin as socialLoginApi,
} from '@/apis'
import { clearToken, getToken, setToken } from '@/utils/auth'
import { resetHasRouteFlag } from '@/router/guard'

const storeSetup = () => {
  const userInfo = reactive<UserInfo>({
    id: '',
    username: '',
    nickname: '',
    gender: 0,
    email: '',
    phone: '',
    avatar: '',
    pwdResetTime: '',
    pwdExpired: false,
    registrationDate: '',
    deptName: '',
    roles: [],
    permissions: [],
  })
  const nickname = computed(() => userInfo.nickname)
  const username = computed(() => userInfo.username)
  const avatar = computed(() => userInfo.avatar)

  const token = ref(getToken() || '')
  const pwdExpiredShow = ref<boolean>(true)
  const roles = ref<string[]>([]) // 当前用户角色
  const permissions = ref<string[]>([]) // 当前角色权限标识集合

  // 重置token
  const resetToken = () => {
    token.value = ''
    clearToken()
    resetHasRouteFlag()
  }

  // 登录
  const accountLogin = async (req: AccountLoginReq) => {
    const res = await accountLoginApi({ ...req, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeEnum.ACCOUNT })
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 邮箱登录
  const emailLogin = async (req: EmailLoginReq) => {
    const res = await emailLoginApi({ ...req, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeEnum.EMAIL })
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 手机号登录
  const phoneLogin = async (req: PhoneLoginReq) => {
    const res = await phoneLoginApi({ ...req, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeEnum.PHONE })
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 三方账号登录
  const socialLogin = async (source: string, req: any) => {
    const res = await socialLoginApi({ ...req, source, clientId: import.meta.env.VITE_CLIENT_ID, authType: AuthTypeEnum.SOCIAL })
    setToken(res.data.token)
    token.value = res.data.token
  }

  // 退出登录回调
  const logoutCallBack = async () => {
    roles.value = []
    permissions.value = []
    pwdExpiredShow.value = true
    resetToken()
    resetRouter()
  }

  // 退出登录
  const logout = async () => {
    try {
      await logoutApi()
      await logoutCallBack()
      return true
    } catch (error) {
      return false
    }
  }

  // 获取用户信息
  const getInfo = async () => {
    const res = await getUserInfoApi()
    Object.assign(userInfo, res.data)
    userInfo.avatar = res.data.avatar
    if (res.data.roles && res.data.roles.length) {
      roles.value = res.data.roles
      permissions.value = res.data.permissions
    }
  }

  return {
    userInfo,
    nickname,
    username,
    avatar,
    token,
    roles,
    permissions,
    pwdExpiredShow,
    accountLogin,
    emailLogin,
    phoneLogin,
    socialLogin,
    logout,
    logoutCallBack,
    getInfo,
    resetToken,
  }
}

export const useUserStore = defineStore('user', storeSetup, {
  persist: { paths: ['token', 'roles', 'permissions', 'pwdExpiredShow'], storage: localStorage },
})
