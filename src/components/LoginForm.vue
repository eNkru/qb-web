<template>
  <v-dialog
    :model-value="true"
    persistent
    width="26em"
  >
    <v-card class="login-card">
      <v-toolbar
        color="primary"
        flat
      >
        <v-toolbar-title
          class="pl-2"
          style="font-weight: 600; letter-spacing: 0.01em;"
        >
          <v-icon
            class="mr-2"
            size="small"
          >
            mdi-login
          </v-icon>
          {{ $t('login') }}
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text class="login-card-text">
        <v-form ref="form">
          <div @keyup.enter.capture="submit">
            <v-text-field
              v-model="baseUrl"
              prepend-icon="mdi-network"
              variant="outlined"
              density="compact"
              :label="$t('label.base_url')"
              autofocus
              required
            />
            <v-text-field
              v-model="params.username"
              prepend-icon="mdi-account"
              variant="outlined"
              density="compact"
              :label="$t('username')"
              required
            />
            <v-text-field
              v-model="params.password"
              prepend-icon="mdi-lock"
              variant="outlined"
              density="compact"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              :label="$t('password')"
              :type="showPassword ? 'text' : 'password'"
              required
            />
          </div>
        </v-form>
        <v-alert
          v-if="loginError"
          type="warning"
          variant="tonal"
          density="compact"
          closable
          class="mt-2"
          @click:close="loginError = null"
        >
          {{ loginError }}
        </v-alert>
      </v-card-text>
      <v-card-actions class="login-actions">
        <v-spacer />
        <v-btn
          variant="flat"
          @click="submit"
          color="primary"
          :disabled="submitting"
          :loading="submitting"
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
import { useStore } from '@/store';

export default defineComponent({
  setup(_, { emit }) {
    const store = useStore();
    const data = reactive({
      submitting: false,
      showPassword: false,
      loginError: null as string | null,
      baseUrl: store.getters.config.baseUrl || location.href,
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

          store.commit('updateConfig', {
            key: 'baseUrl',
            value: data.baseUrl,
          });
          store.commit('updateNeedAuth', false);

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
@import '~@/assets/styles.scss';

.login-card {
  border-radius: 12px;
  overflow: hidden;
}

.login-card-text {
  padding: 24px 24px 8px;

  .v-text-field {
    margin-bottom: 8px;
  }
}

.login-actions {
  padding: 8px 24px 20px;
}
</style>
