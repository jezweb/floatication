# Floatication Vue

A simplified Vue.js version of the Floatication AI workspace management system, designed to be easier for non-developers to understand and modify.

## Features

- 🔐 User authentication with Supabase
- 🏢 Multiple workspace management
- 🤖 AI chat integration (Flowise ready)
- 📄 Document management (coming soon)
- 🎨 Clean UI with Vuetify components

## Project Setup

### Prerequisites

1. Node.js 18+ installed
2. Supabase account and project
3. Flowise instance (for AI features)
4. Qdrant instance (for vector search)

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit http://localhost:5173

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

## Project Structure

```
src/
├── views/              # Page components
│   ├── LoginView.vue   # Authentication page
│   ├── DashboardView.vue # Workspace list
│   └── WorkspaceView.vue # AI chat interface
├── composables/        # Reusable logic
│   └── useAuth.ts      # Authentication logic
├── lib/                # External integrations
│   └── supabase.ts     # Supabase client
├── router/             # Route definitions
└── App.vue             # Main app component
```

## Key Differences from React Version

1. **Simpler Syntax**: Vue templates are more like HTML
2. **Less Boilerplate**: Direct v-model binding, built-in directives
3. **Clearer Structure**: Single-file components with template/script/style
4. **Better Errors**: More helpful error messages

## Next Steps

1. **Flowise Integration**: Connect the chat to your Flowise instance
2. **Document Upload**: Add document management features
3. **Vector Search**: Integrate Qdrant for semantic search
4. **Quick Prompts**: Add saved prompts feature
5. **Custom Pages**: Build the page creator

## Learning Resources

- [Vue.js Documentation](https://vuejs.org/guide/)
- [Vuetify Components](https://vuetifyjs.com/en/components/all/)
- [Supabase Vue Guide](https://supabase.com/docs/guides/with-vue-3)

## Tips for Non-Developers

1. **Start Small**: Modify existing components before creating new ones
2. **Use Vuetify**: Pre-built components save time
3. **Check Console**: Browser DevTools show helpful errors
4. **Test Often**: Run `npm run dev` and test changes immediately
5. **Ask for Help**: Vue community is very beginner-friendly

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).
