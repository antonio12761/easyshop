# Revup Shopping 🛒

Sistema web per la gestione della spesa intelligente e personalizzata.  
Infrastruttura modulare, sicura e scalabile, con focus su privacy e UX.

---

## ✅ Stato attuale

### 🔐 Autenticazione completa

- [x] **Registrazione** con verifica email principale
- [x] **Login** con redirect automatico e sessione protetta
- [x] **Gestione password** (reset via email con token)
- [x] **Autenticazione a due fattori (2FA)** con TOTP
- [x] **Email secondaria** con verifica dedicata
- [x] **Pagina account** con tab per email, password e 2FA
- [x] **Audit log e cronologia login**
- [x] Sistema `SessionProvider` globale

---

## 📁 Struttura progetto (Monorepo con pnpm)


---

## 📣 Note finali

🔐 Password sicure, dati sempre hashati.  
✉️ Email inviate con Mailtrap (dev) e Resend (prod).  
📈 Progetto scalabile e pronto per il deploy su Vercel o piattaforma dedicata.
