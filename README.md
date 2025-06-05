# Revup Shopping 🛒

Sistema web per la gestione di spesa intelligente e personalizzata.

---

## ✅ Stato attuale

### 🔐 Autenticazione

- [x] Sistema completo con **NextAuth + Prisma** e password hashate (`bcrypt`).
- [x] **Registrazione** (`/register`) con invio email di verifica.
- [x] **Login** (`/login`) con redirect automatico se già autenticato.
- [x] **Protezione rotte private** (es. `/dashboard`) con controllo `session`.
- [x] `SessionProvider` avvolge l’intera app (in `providers.tsx`) per abilitare `useSession`.

---

## 📁 Struttura directory (Next.js 15 – App Router)

app/
├─ (public)/ # Accesso libero
│ ├─ login/
│ ├─ register/
│ ├─ about/
│ ├─ privacy/
│ ├─ layout.tsx
│ └─ page.tsx # Landing page pubblica
├─ (protected)/ # Accesso solo se loggato
│ ├─ dashboard/
│ ├─ profile/
│ ├─ settings/
│ └─ layout.tsx # Wrapper protetto con check sessione
├─ auth/
│ ├─ actions/ # Server actions (login, register, 2FA ecc.)
│ └─ api/
│ └─ auth/ # NextAuth API route: [...nextauth]/route.ts
├─ my-account/ # Gestione profilo e sicurezza
├─ providers.tsx # SessionProvider + ThemeProvider
└─ globals.css

---

## ⚙️ Funzionalità pronte

- 🌗 Dark/light mode con `next-themes`.
- ✅ UI Toaster per notifiche.
- 🧱 Tipi NextAuth estesi (`Session.user.id`).
- ✅ Routing protetto per sezioni private.

---

## 🧪 Server Actions disponibili (`auth/actions`)

- `register` → crea utente + invia email di verifica.
- `login/checkCredentials` → verifica credenziali + stato email.
- Pronte ma non ancora integrate:
  - `requestPasswordReset`
  - `resetPassword`
  - `2fa` (attivazione/disattivazione)
  - `emailSecondaria`

---

## 🛠️ Prossimi step suggeriti

1. 🔗 **Completare verifica email**

   - Pagina di verifica token (`/verify`)
   - API/azione di validazione e aggiornamento stato utente
   - UI con messaggio di successo/errore

2. 🔐 **Recupero password**

   - `request-reset` (email con link/token)
   - `reset-password` (form + validazione token)

3. 👤 **Pagina profilo**

   - Modifica nome, email, immagine profilo

4. 🔒 **2FA**

   - Attiva/disattiva
   - Visualizza QR Code e conferma codice

5. 🚀 **Dashboard**
   - Dati utente, link a sezioni protette, pulsante logout

---

## ✅ Ripresa rapida

Puoi semplicemente scrivere in chat:

```txt
Ripartiamo dal progetto revup-shopping. Siamo fermi a: login/registrazione completati, dashboard protetta. Prossimo passo: [es. verifica email]
Stack

    Next.js 15 (App Router)

    React 19

    TypeScript

    Tailwind CSS 4

    Prisma + PostgreSQL

    NextAuth.js

    pnpm + monorepo

    revup-shopping/
├─ apps/
│  └─ web/          # Frontend Next.js
├─ packages/
│  ├─ prisma/       # Schema e client Prisma
│  └─ auth/         # Azioni Server Actions condivise

Note

    🔒 I dati sensibili degli utenti sono protetti. Le password sono hashate con bcrypt.

    📧 Le email vengono inviate tramite Mailtrap (dev) o Resend (prod).

    🎯 L’obiettivo è scalare da MVP a prodotto finito con funzionalità smart per la spesa.
```

## 🔒 Checklist Sicurezza RevUp Shopping

### Autenticazione e Autorizzazione
- [x] 2FA obbligatorio per admin
- [x] Password policy robusta (12+ caratteri, complessità)
- [x] Rate limiting su login e 2FA
- [x] Sessioni sicure con JWT
- [ ] Single Sign-On (SSO) per enterprise
- [ ] Backup codes per 2FA

### Sicurezza Database
- [x] Connessioni SSL/TLS
- [x] Password hashate con bcrypt (salt 14+)
- [ ] Encryption at rest per dati sensibili
- [ ] Backup automatici crittografati
- [ ] Accesso database limitato per IP

### Sicurezza Network
- [x] HTTPS obbligatorio
- [x] Security headers (CSP, HSTS, etc.)
- [x] Rate limiting globale
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection

### Monitoring e Audit
- [x] Audit log per azioni sensibili
- [x] Monitoraggio tentativi di login
- [ ] Alerting automatico per anomalie
- [ ] Log retention policy
- [ ] SIEM integration

### Compliance e Privacy
- [ ] GDPR compliance
- [ ] Cookie policy
- [ ] Privacy policy
- [ ] Data retention policy
- [ ] Right to be forgotten

### Sicurezza Codice
- [x] Input validation con Zod
- [x] SQL injection prevention (Prisma)
- [x] XSS protection
- [ ] Dependency scanning
- [ ] SAST/DAST testing

### Deployment e Infrastruttura
- [ ] Secrets management (Vault/AWS Secrets)
- [ ] Container security scanning
- [ ] Infrastructure as Code
- [ ] Zero-trust network
- [ ] Regular security updates