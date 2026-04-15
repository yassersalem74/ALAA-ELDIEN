# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# 🚀 Project Initialization Prompt (Professional)

<!--zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz -->
## 🧩 Project Overview

This project is a scalable multi-role platform designed to serve both **individual users** and **companies**. The system enables users to browse and request services, purchase products, and interact with a marketplace. Additionally, users can upgrade their role to become **service providers (partners)** and manage their own offerings through a dedicated dashboard.

The architecture is designed with **scalability, modularity, and API integration readiness** in mind. The current phase focuses on building a **fully dynamic UI** using modern frontend technologies, with a structure that allows seamless backend integration via Swagger APIs at a later stage.

---

## 👥 User Roles & Capabilities

### 1. Individual User

* Register / Login
* Browse services, store, marketplace
* Place orders
* Upgrade to **Partner (Provider)**
* Manage provided services/products after becoming a partner

### 2. Company User

* Register with extended fields (company-specific data)
* Same capabilities as individual users
* Additional feature:

  * Add and manage internal users (team members)
  * Control access via company dashboard

---

## 🔄 Core Flow

1. User lands on the platform
2. Chooses:

   * Login
   * Signup (Individual / Company)
3. After authentication:

   * Can browse and order services/products
4. From profile:

   * Can become a **Partner**
5. Partner gains access to:

   * Add services/products/marketplace listings
   * Manage them via dashboard

---

## 🎯 Current Development Scope

* Build **Authentication UI (Login / Signup)**
* No API integration yet (mock-ready structure)
* Use **dynamic forms** for flexibility
* Ensure components are reusable and scalable
* Prepare architecture for future Swagger API integration

---

## 🎨 Design System

* **Primary Color:** `#011C60`

* **Secondary Color:** `#F6E6A0`

* **Background (Third):** `#E6E8EF`

* Typography:

  * Font Family: **Roboto**
  * Headings: Bold
  * Subtext: Regular
  * Buttons: SemiBold

---

## ⚙️ Tech Stack

* React (Vite)
* TailwindCSS
* DaisyUI
* React Hook Form

---

## 🧱 Architecture Principles

* Keep structure **simple but scalable**
* Separate concerns:

  * UI (components)
  * Logic (hooks)
  * Config (constants)
  * Validation (utils)
* Each form is an independent component
* Inputs are defined dynamically via arrays inside each form
* Ready for API abstraction layer

---

## 📁 Current Project Structure

```bash
src/
│
├── api/
│   └── auth/
│       ├── auth.api.js
│       └── auth.endpoints.js
│
├── assets/
│   └── images/
│       └── auth/
│
├── components/
│   └── auth/
│       ├── AuthContainer.jsx
│       ├── AuthSwitch.jsx
│
│       ├── forms/
│       │   ├── LoginForm.jsx
│       │   ├── SignupIndividualForm.jsx
│       │   └── SignupCompanyForm.jsx
│
├── hooks/
│   └── auth/
│       ├── useLogin.js
│       ├── useSignup.js
│       └── useAuthForm.js
│
├── utils/
│   └── auth/
│       ├── authHelpers.js
│       └── validationSchemas.js
│
├── constants/
│   └── auth.constants.js
│
├── pages/
│   └── AuthPage.jsx
│
├── App.jsx
```

---

## 🧠 Key Implementation Strategy

* **AuthContainer.jsx**

  * Handles layout (image + form)
  * Controls which form is rendered (login / signup)

* **AuthSwitch.jsx**

  * Toggles between:

    * Individual
    * Company

* **Forms**

  * Each form is isolated
  * Inputs defined as arrays داخل الكومبوننت
  * Uses `react-hook-form`

* **Hooks**

  * Abstract business logic (API-ready)
  * Example:

    * `useLogin`
    * `useSignup`

* **Utils**

  * Validation schemas (Yup/Zod later)
  * Helper functions

---

## 🔮 Future Enhancements

* Integrate Swagger APIs
* Add authentication state management (Zustand or Context)
* Implement verification flow
* Build dashboards (User / Company / Partner)
* Role-based access control
* Add marketplace and service modules

---

## ✅ Goal

Build a **clean, maintainable, and scalable authentication system UI** that:

* Supports multiple user types
* Is fully dynamic
* Is ready for seamless backend integration
* Follows modern frontend architecture best practices

<!-- zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz -->

# 🎨 UI Implementation Prompt – Authentication (Login First)

## 🎯 Objective

Start implementing the **Authentication UI (Login screen only)** using the current project structure.
Focus purely on **UI (no API integration)** while ensuring the design is **reusable across all auth forms (Login / Signup / Company / Verify)**.

---

## 🧩 UI Architecture Strategy

The UI should be implemented using the existing structure with clear separation of responsibilities:

### 📁 Where UI should be implemented:

* **AuthContainer.jsx**

  * Main layout (left image + right form)
  * Handles responsive design
  * Wraps all auth forms

* **LoginForm.jsx**

  * Contains:

    * Inputs (dynamic array)
    * Submit button
    * Forget password
  * Uses `react-hook-form`

* **AuthSwitch.jsx** *(not used in login, only signup)*

* **AuthHeader.jsx (optional inside container)**

  * Title + subtitle (shared across all forms)

* **AuthFooter.jsx**

  * "Don’t have an account? Sign up"

---

## 🎨 Design System (STRICT)

### 🔵 Colors

* Primary: `#011C60`
* Secondary: `#F6E6A0`
* Background: `#E6E8EF`
* Text Secondary: `#808DAF`

---

## 🔤 Typography

### ✅ Main Title

* Text: **Welcome Back**
* Font: Roboto
* Weight: 700 (Bold)
* Size: 32px
* Line height: 48px
* Color: `#011C60`
* Align: center

---

### ✅ Subtitle

* Text: **sign in to continue**
* Weight: 400
* Size: 24px
* Line height: 40px
* Color: `#808DAF`
* Align: center

---

### ✅ Input Placeholder

* Example: *Username or Email or Phone Number*
* Weight: 400
* Size: 18px
* Line height: 24px
* Color: `#808DAF`
* Align: center (visually clean input)

---

### ✅ Forget Password

* Text: **forget password ?**
* Size: 18px
* Color: `#011C60`
* Align: right

---

### ✅ Button (Sign in)

* Width: full
* Height: 64px
* Border radius: 16px
* Background: `#011C60`
* Text color: `#FFFFFF`
* Font:

  * Weight: 600
  * Size: 20px

---

### ✅ Footer Text

* Text: *Don’t have an account? Sign up*
* Size: 18px
* Align: center

---

## 🧠 Reusability Rule (VERY IMPORTANT)

All of the following UI elements are:

> ✅ **FIXED across all forms**

* Title style
* Subtitle style
* Input style
* Button style
* Footer style

❗ Only the **content changes**, NOT the design

---

## 🧱 Form Implementation Strategy

Inside `LoginForm.jsx`:

* Define inputs as a **dynamic array**

```js
const inputs = [
  {
    name: "identifier",
    type: "text",
    placeholder: "Username or Email or Phone Number",
  },
  {
    name: "password",
    type: "password",
    placeholder: "Password",
  },
];
```

* Map over inputs to render fields
* Use `react-hook-form` for handling

---

## 🖼️ Assets Usage

Images are located in:

```bash
assets/images/auth/
```

Example:

* loginImage.png → used in left side of AuthContainer

---

## 📐 Layout Behavior

### Desktop:

* Left side → Image + logo
* Right side → Form centered

### Mobile:

* Hide image
* Show only form centered

---

## 🔥 Key Rules

* ❌ No API calls
* ❌ No global state yet
* ✅ Clean UI only
* ✅ Dynamic inputs
* ✅ Reusable styles
* ✅ Ready for future API integration

---

## 🚀 Final Goal

Build a **pixel-perfect, reusable Login UI** that:

* Matches the provided design exactly
* Can be reused بسهولة في Signup / Company / Verify
* Uses clean and scalable component structure
* Is ready to plug into backend APIs without refactoring

---
