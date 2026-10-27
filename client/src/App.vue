<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from './api/client'

type View = 'loading' | 'login' | 'welcome'

const view = ref<View>('loading')
const username = ref('')
const password = ref('')
const accountName = ref('')
const error = ref('')
const busy = ref(false)

// Restore a valid browser session before deciding which screen to show.
onMounted(async () => {
  try {
    const { data, response } = await api.GET('/api/auth/me')
    if (data) {
      accountName.value = data.username
      view.value = 'welcome'
    } else {
      if (response.status !== 401) {
        error.value = 'The server is unavailable. Please try again.'
      }
      view.value = 'login'
    }
  } catch {
    error.value = 'The server is unavailable. Please try again.'
    view.value = 'login'
  }
})

// Keep failed credentials on the form while clearing the secret after an error.
async function signIn() {
  error.value = ''
  busy.value = true
  try {
    const {
      data,
      error: responseError,
      response,
    } = await api.POST('/api/auth/login', {
      body: { username: username.value.trim(), password: password.value },
    })
    if (data) {
      accountName.value = data.username
      password.value = ''
      view.value = 'welcome'
    } else {
      error.value =
        response.status === 401
          ? 'Check your username and password.'
          : responseError
            ? 'Could not sign in. Please try again.'
            : 'Could not sign in.'
      password.value = ''
    }
  } catch {
    error.value = 'The server is unavailable. Please try again.'
  } finally {
    busy.value = false
  }
}

// End the current session and return to the sign-in screen.
async function signOut() {
  busy.value = true
  error.value = ''
  try {
    const { response } = await api.POST('/api/auth/logout')
    if (!response.ok) throw new Error('Could not sign out')
    username.value = ''
    password.value = ''
    accountName.value = ''
    view.value = 'login'
  } catch {
    error.value = 'Could not sign out. Please try again.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="brand" href="/" aria-label="Wine Journal home">
        <span class="brand-mark" aria-hidden="true">W<span class="brand-dot">.</span></span>
        <span class="brand-name">WINE JOURNAL</span>
      </a>
      <span class="header-note">A place for every pour</span>
    </header>

    <main id="main" class="main-content">
      <div v-if="view === 'loading'" class="loading-state" role="status">Opening your journal…</div>

      <div v-else-if="view === 'login'" class="login-layout">
        <section class="editorial-panel" aria-labelledby="editorial-title">
          <p class="eyebrow">YOUR WINE JOURNEY STARTS HERE</p>
          <h1 id="editorial-title">Every bottle has a story. Keep yours close.</h1>
          <p class="editorial-copy">
            A quiet space for the wines you discover and the moments worth remembering.
          </p>
          <div class="illustration" aria-hidden="true">
            <div class="illustration-circle" />
            <div class="glass-stem" />
            <div class="glass-bowl" />
            <div class="glass-wine" />
            <div class="glass-foot" />
            <span class="illustration-caption">SIP · SAVOR · REMEMBER</span>
          </div>
        </section>

        <section class="form-panel" aria-labelledby="login-title">
          <div class="form-inner">
            <p class="eyebrow">WELCOME BACK</p>
            <h2 id="login-title">Sign in to your journal</h2>
            <p class="form-intro">Pick up where your last tasting left off.</p>
            <form @submit.prevent="signIn">
              <div class="field">
                <label for="username">Username</label>
                <input
                  id="username"
                  v-model="username"
                  name="username"
                  autocomplete="username"
                  required
                  maxlength="100"
                  :disabled="busy"
                />
              </div>
              <div class="field">
                <label for="password">Password</label>
                <input
                  id="password"
                  v-model="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  :disabled="busy"
                />
              </div>
              <p v-if="error" class="form-error" role="alert">
                {{ error }}
              </p>
              <button class="primary-button" type="submit" :disabled="busy">
                {{ busy ? 'Signing in…' : 'Sign in' }} <span aria-hidden="true">→</span>
              </button>
            </form>
            <p class="form-footnote">A little space for good wine and good memories.</p>
          </div>
        </section>
      </div>

      <div v-else class="welcome-page">
        <div class="welcome-topline">
          <span class="eyebrow">YOUR WINE JOURNAL</span>
          <button class="text-button" type="button" :disabled="busy" @click="signOut">
            {{ busy ? 'Signing out…' : 'Sign out' }}
          </button>
        </div>
        <section class="welcome-card" aria-labelledby="welcome-title">
          <div class="welcome-card-content">
            <span class="welcome-kicker">A NEW CHAPTER BEGINS</span>
            <h1 id="welcome-title">
              Welcome, {{ accountName }}<span class="heading-period">.</span>
            </h1>
            <p>
              Your space for wines, places, and tasting memories is ready. For now, settle in. There
              is more to discover soon.
            </p>
          </div>
          <div class="welcome-art" aria-hidden="true">
            <span>W.</span>
          </div>
        </section>
        <p v-if="error" class="form-error" role="alert">
          {{ error }}
        </p>
        <div class="coming-soon">
          <span class="coming-soon-line" />
          <p>COMING SOON TO YOUR JOURNAL</p>
          <span class="coming-soon-line" />
        </div>
        <div class="preview-grid">
          <article>
            <span class="preview-number">01</span>
            <h2>Wines</h2>
            <p>Remember every bottle that made an impression.</p>
          </article>
          <article>
            <span class="preview-number">02</span>
            <h2>Regions</h2>
            <p>Explore the places behind the wines you love.</p>
          </article>
          <article>
            <span class="preview-number">03</span>
            <h2>Tasting notes</h2>
            <p>Put every aroma, flavor, and moment into words.</p>
          </article>
        </div>
      </div>
    </main>
    <footer class="site-footer">
      <span>WINE JOURNAL</span><span>Made for the curious palate.</span>
    </footer>
  </div>
</template>
