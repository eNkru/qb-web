<template>
  <v-dialog
    :model-value="true"
    persistent
    max-width="420"
    transition="dialog-top-transition"
    class="login-dialog"
  >
    <v-card class="login-card">
      <div class="login-header">
        <div class="login-icon-wrapper">
          <v-icon
            size="large"
            color="white"
          >
            mdi-shield-lock-outline
          </v-icon>
        </div>
        <h2 class="login-title">
          {{ $t('login') }}
        </h2>
        <p class="login-subtitle">
          Connect to qBittorrent
        </p>
      </div>

      <v-card-text class="login-card-text">
        <v-form ref="form">
          <div @keyup.enter.capture="submit">
            <v-text-field
              v-model="baseUrl"
              prepend-inner-icon="mdi-web"
              variant="outlined"
              density="comfortable"
              :label="$t('label.base_url')"
              autofocus
              required
              class="login-field"
              rounded="lg"
            />
            <v-text-field
              v-model="params.username"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              density="comfortable"
              :label="$t('username')"
              required
              class="login-field"
              rounded="lg"
            />
            <v-text-field
              v-model="params.password"
              prepend-inner-icon="mdi-lock-outline"
              variant="outlined"
              density="comfortable"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              :label="$t('password')"
              :type="showPassword ? 'text' : 'password'"
              required
              class="login-field"
              rounded="lg"
            />
          </div>
        </v-form>
        <v-alert
          v-if="loginError"
          type="error"
          variant="tonal"
          density="compact"
          closable
          class="login-alert"
          @click:close="loginError = null"
          rounded="lg"
        >
          {{ loginError }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="login-card-actions">
        <v-btn
          variant="flat"
          @click="submit"
          color="primary"
          :disabled="submitting"
          :loading="submitting"
          block
          size="large"
          rounded="lg"
          class="login-submit-btn"
        >
          {{ $t('submit') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from 'vue';

import api from '@/Api';
import { useConfigStore } from '@/store/config';
import { useMainStore } from '@/store/index';

export default defineComponent({
  emits: ['input'],
  setup(_, { emit }) {
    const configStore = useConfigStore();
    const mainStore = useMainStore();
    const data = reactive({
      submitting: false,
      showPassword: false,
      loginError: null as string | null,
      baseUrl: configStore.config.baseUrl || location.href,
      params: {
        username: '',
        password: '',
      },
      form: null,
    });

    const submit = async () => {
      if (data.submitting) {
        return;
      }

      if (!(data.form as any).validate()) {
        return;
      }

      data.submitting = true;
      try {
        const resp = await api.login(data.params, data.baseUrl);

        if (resp === 'Ok.') {
          api.changeBaseUrl(data.baseUrl);

          configStore.updateConfig({
            key: 'baseUrl',
            value: data.baseUrl,
          });
          mainStore.updateNeedAuth(false);

          emit('input', false);
          return;
        }

        data.loginError = resp;
      } catch (e) {
        data.loginError = e.message;
      }

      data.submitting = false;
    }

    return {
      ...toRefs(data),
      submit,
    }
  },
});
</script>

<style lang="scss" scoped>
.login-dialog {
  :deep(.v-overlay__scrim) {
    backdrop-filter: blur(8px);
  }
}

.login-card {
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-primary)) 100%);
  padding: 32px 24px 28px;
  text-align: center;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  }
}

.login-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.login-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 4px;
  letter-spacing: 0.02em;
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.875rem;
  margin: 0;
  font-weight: 400;
}

.login-card-text {
  padding: 24px 24px 8px;
}

.login-field {
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
}

.login-alert {
  margin-top: 16px;
}

.login-card-actions {
  padding: 8px 24px 24px;
}

.login-submit-btn {
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: none;
  font-size: 1rem;
}
</style>
