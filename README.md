# Fund me through coinqvest
A simple one-pager that allows receiving payments through [coinqvest.com](https://coinqvest.com).

This is a small nextjs app that highlights selected projects on a given github-account. Interaction with the
coinqvest merchant API is done server-side so your credentials don't get exposed.

## Highlight your own projects
You can get your own funding page up and running in minutes ⏩. 
- 🧬 clone [this project](https://github.com/hanseartic/fund-through-coinqvest)
- 📝 edit [pages/api/projects/index.ts](pages/api/projects/index.ts) to have your user-name and the projects your want to highlight.
- ✒️ sign up on [coinqvest.com](https://coinqvest.com) (if you don't already have an account)
    - 📋 gather your [API credentials](https://www.coinqvest.com/en/api-settings#apiCredentials)
- ✒️ sign up on [vercel.com](https://vercel.com)
  - 🆕[create a new project](https://vercel.com/new)
  - ⌨️ add two environment variables to you project:
    - ```COINQVEST_API_KEY```
    - ```COINQVEST_API_SECRET```
- ✨ deploy your app on vercel
- 📡 share the URL
