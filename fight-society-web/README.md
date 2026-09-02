## Fight Society Web

Frontend Next.js da plataforma Fight Society.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

O projeto usa [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) para carregar a fonte Open Sans de forma otimizada.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy na Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

1. Crie um projeto na Vercel apontando para este repositório.
2. Defina `fight-society-web` como **Root Directory**.
3. Use `npm run build` como build command. A Vercel detecta o framework Next.js automaticamente.
4. Cadastre `NEXT_PUBLIC_API_URL` com a URL pública da API, incluindo `/api`.
5. Faça um novo deploy depois de cadastrar a variável.

Para desenvolvimento local, copie `.env.example` para `.env.local` e substitua a URL pela API local ou de staging.
