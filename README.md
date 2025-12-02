# Pair+ 👥

A modern web application for managing development teams and pair programming rotations.

## 🚀 Features

- **Team Management** - Create and organize development teams
- **Smart Pair Rotation** - Automatically rotate pairs with intelligent algorithms that avoid immediate repeats
- **Team Member Tracking** - Add and manage team members easily
- **Real-time Updates** - See changes instantly without page refreshes
- **Dark Mode Support** - Beautiful UI that works in light and dark themes
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Theme**: next-themes

## 📖 Usage

### Creating a Team

1. Sign up or log in to your account
2. Click "Create Team" button
3. Enter your team name
4. Click "Create Team"

### Adding Team Members

1. Navigate to your team page
2. In the sidebar, enter a team member's name
3. Click "Add Member"

### Rotating Pairs

1. Ensure you have at least 2 team members
2. Click the "Rotate Pairs" button
3. The algorithm will automatically create random pairs, avoiding immediate repeats from the last rotation

## 🏗️ Project Structure

```
pair-plus/
├── app/
│   ├── auth/          # Authentication pages
│   ├── teams/         # Team management pages
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── components/
│   ├── ui/            # shadcn/ui components
│   └── ...            # Custom components
├── lib/
│   └── supabase/      # Supabase client configuration
└── public/            # Static assets
```

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own teams and data
- Authentication handled by Supabase Auth
- Secure session management with middleware

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database and Auth by [Supabase](https://supabase.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ by the team at [Overmild](https://overmild.com)

