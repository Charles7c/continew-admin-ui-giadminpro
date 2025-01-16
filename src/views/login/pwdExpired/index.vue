<template>
  <div class="login pc">
    <h3 class="login-logo">
      <img v-if="logo" :src="logo" alt="logo" />
      <img v-else src="/logo.svg" alt="logo" />
      <span>{{ title }}</span>
    </h3>

    <a-row align="stretch" class="login-box">
      <a-col :xs="0" :sm="12" :md="13">
        <div class="login-left">
          <img class="login-left__img" src="@/assets/images/banner.png" alt="banner" />
        </div>
      </a-col>
      <a-col :xs="24" :sm="12" :md="11">
        <div class="login-right">
          <a-tabs class="login-right__form">
            <template #extra>
              <span style="color: red;">密码已过期，请修改密码</span>
            </template>
            <a-tab-pane key="1" title="密码修改">
              <span></span>
              <ModifyPassword />
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-col>
    </a-row>

    <div v-if="isDesktop" class="footer">
      <div class="beian">
        <div class="below text">
          {{ appStore.getCopyright() }}{{ appStore.getForRecord() ? ` ·
                    ${appStore.getForRecord()}` : '' }}
        </div>
      </div>
    </div>

    <ToggleDark class="theme-btn" />
    <Background />
  </div>
  <div class="login h5">
    <div class="login-logo">
      <img v-if="logo" :src="logo" alt="logo" />
      <img v-else src="/logo.svg" alt="logo" />
      <span>{{ title }}</span>
    </div>
    <a-row align="stretch" class="login-box">
      <a-col :xs="24" :sm="12" :md="11">
        <div class="login-right">
          <a-tabs class="login-right__form">
            <template #extra>
              <span style="color: red;">密码已过期，请修改密码</span>
            </template>
            <a-tab-pane key="1" title="密码修改">
              <ModifyPassword />
            </a-tab-pane>
          </a-tabs>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import Background from '../components/background/index.vue'
import ModifyPassword from '../components/modifyPassword/index.vue'
import { useAppStore } from '@/stores'
import { useDevice } from '@/hooks'

defineOptions({ name: 'PwdExpired' })

const { isDesktop } = useDevice()
const appStore = useAppStore()
const title = computed(() => appStore.getTitle())
const logo = computed(() => appStore.getLogo())
</script>

<style scoped lang="scss">
@media screen and (max-width: 570px) {
    .pc {
        display: none !important;
        background-color: white !important;
    }

    .login {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        background-color: var(--color-bg-5);
        color: #121314;

        &-logo {
            width: 100%;
            height: 104px;
            font-weight: 700;
            font-size: 20px;
            line-height: 32px;
            display: flex;
            padding: 0 20px;
            align-items: center;
            justify-content: start;
            background-image: url('/src/assets/images/login_h5.jpg');
            background-size: 100% 100%;
            box-sizing: border-box;

            img {
                width: 34px;
                height: 34px;
                margin-right: 8px;
            }
        }

        &-box {
            width: 100%;
            display: flex;
            z-index: 999;
        }
    }

    .login-right {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 30px 30px 0;
        box-sizing: border-box;

        &__title {
            color: var(--color-text-1);
            font-weight: 500;
            font-size: 20px;
            line-height: 32px;
            margin-bottom: 20px;
        }

        &__form {
            :deep(.arco-tabs-nav-tab) {
                display: flex;
                justify-content: start;
                align-items: center;
            }

            :deep(.arco-tabs-tab) {
                color: var(--color-text-2);
                margin: 0 20px 0 0;
            }

            :deep(.arco-tabs-tab-title) {
                font-size: 16px;
                font-weight: 500;
                line-height: 22px;
            }

            :deep(.arco-tabs-content) {
                margin-top: 10px;
            }

            :deep(.arco-tabs-tab-active),
            :deep(.arco-tabs-tab-title:hover) {
                color: rgb(var(--arcoblue-6));
            }

            :deep(.arco-tabs-nav::before) {
                display: none;
            }

            :deep(.arco-tabs-tab-title:before) {
                display: none;
            }
        }

    }

    .theme-btn {
        position: fixed;
        top: 20px;
        right: 30px;
        z-index: 9999;
    }

    .footer {
        align-items: center;
        box-sizing: border-box;
        position: absolute;
        bottom: 10px;
        z-index: 999;

        .beian {
            .text {
                font-size: 12px;
                font-weight: 400;
                letter-spacing: 0.2px;
                line-height: 20px;
                text-align: center;
            }

            .below {
                align-items: center;
                display: flex;
            }
        }
    }
}

@media screen and (min-width: 571px) {
    .h5 {
        display: none !important;
    }

    .login {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: var(--color-bg-5);

        &-logo {
            position: fixed;
            top: 20px;
            left: 30px;
            z-index: 9999;
            color: var(--color-text-1);
            font-weight: 500;
            font-size: 20px;
            line-height: 32px;
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
            align-items: center;

            img {
                width: 34px;
                height: 34px;
                margin-right: 8px;
            }
        }

        &-box {
            width: 86%;
            max-width: 850px;
            height: 490px;
            display: flex;
            z-index: 999;
            box-shadow: 0 2px 4px 2px rgba(0, 0, 0, 0.08);
        }
    }

    .login-left {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        overflow: hidden;
        background: linear-gradient(60deg, rgb(var(--primary-6)), rgb(var(--primary-3)));

        &__img {
            width: 100%;
            position: absolute;
            bottom: 0;
            right: 0;
            top: 50%;
            left: 50%;
            transform: translateX(-50%) translateY(-50%);
            transition: all 0.3s;
            object-fit: cover;
        }
    }

    .login-right {
        width: 100%;
        height: 100%;
        background: var(--color-bg-1);
        display: flex;
        flex-direction: column;
        padding: 30px 30px 0;
        box-sizing: border-box;

        &__title {
            color: var(--color-text-1);
            font-weight: 500;
            font-size: 20px;
            line-height: 32px;
            margin-bottom: 20px;
        }

        &__form {
            :deep(.arco-tabs-nav-tab) {
                display: flex;
                // justify-content: center;
                align-items: center;
            }

            :deep(.arco-tabs-tab) {
                color: var(--color-text-2);
            }

            :deep(.arco-tabs-tab-title) {
                font-size: 16px;
                font-weight: 500;
                line-height: 22px;
            }

            :deep(.arco-tabs-content) {
                margin-top: 10px;
            }

            :deep(.arco-tabs-tab-active),
            :deep(.arco-tabs-tab-title:hover) {
                color: rgb(var(--arcoblue-6));
            }

            :deep(.arco-tabs-nav::before) {
                display: none;
            }

            :deep(.arco-tabs-tab-title:before) {
                display: none;
            }
        }

        &__oauth {
            margin-top: auto;
            margin-bottom: 20px;

            :deep(.arco-divider-text) {
                color: var(--color-text-4);
                font-size: 12px;
                font-weight: 400;
                line-height: 20px;
            }

            .list {
                align-items: center;
                display: flex;
                justify-content: center;
                width: 100%;

                .item {
                    margin-right: 15px;
                }

                .mode {
                    color: var(--color-text-2);
                    font-size: 12px;
                    font-weight: 400;
                    line-height: 20px;
                    padding: 6px 10px;
                    align-items: center;
                    border: 1px solid var(--color-border-3);
                    border-radius: 32px;
                    box-sizing: border-box;
                    display: flex;
                    height: 32px;
                    justify-content: center;
                    cursor: pointer;

                    .icon {
                        width: 21px;
                        height: 20px;
                    }
                }

                .mode svg {
                    font-size: 16px;
                    margin-right: 10px;
                }

                .mode:hover,
                .mode svg:hover {
                    background: rgba(var(--primary-6), 0.05);
                    border: 1px solid rgb(var(--primary-3));
                    color: rgb(var(--arcoblue-6));
                }
            }
        }
    }

    .theme-btn {
        position: fixed;
        top: 20px;
        right: 30px;
        z-index: 9999;
    }

    .footer {
        align-items: center;
        box-sizing: border-box;
        position: absolute;
        bottom: 10px;
        z-index: 999;

        .beian {
            .text {
                font-size: 12px;
                font-weight: 400;
                letter-spacing: 0.2px;
                line-height: 20px;
                text-align: center;
            }

            .below {
                align-items: center;
                display: flex;
            }
        }
    }
}
</style>
