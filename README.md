# WAPROMO

Nowoczesny katalog publicznych grup i kanałów WhatsApp. Stack: Next.js App Router + TypeScript, Prisma + SQLite, bcryptjs i Zod. Jeden projekt obsługuje UI oraz endpointy serwerowe.

## Start lokalny

```bash
npm install
Copy-Item .env.example .env
npx prisma migrate dev --name init
npm run dev
```

Otwórz `http://localhost:3000`.

Ustaw `DATABASE_URL` i długi losowy `SESSION_SECRET` w `.env`. Webhook Discord jest opcjonalny i pozostaje wyłącznie zmienną serwerową. Powiadomienia zawierają tylko metadane zdarzeń. Nigdy nie wysyłaj haseł, hashy haseł, tokenów sesji, cookies ani kluczy API; e-mail pozostaje w bazie.

## Endpointy

- `POST /api/auth/register` waliduje konto i zapisuje hasło jako bcrypt hash.
- `POST /api/auth/login` tworzy sesję w bazie i cookie HttpOnly.
- `POST /api/auth/logout` usuwa sesję i czyści cookie.

Schemat znajduje się w `prisma/schema.prisma`; zawiera użytkowników, posty, kategorie, lajki z unikalnym `(userId, postId)`, komentarze, zgłoszenia, sesje i logi bezpieczeństwa. Produkcyjnie użyj PostgreSQL, `npx prisma migrate deploy`, HTTPS i rozproszonego rate limitera.

Webhook podany w wiadomości nie został zapisany w repozytorium. Ponieważ został ujawniony, unieważnij go i wygeneruj nowy przed użyciem produkcyjnym.
