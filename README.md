
Nowoczesny katalog publicznych grup i kanałów WhatsApp. Stack: Next.js App Router + TypeScript, Prisma + PostgreSQL, bcryptjs i Zod. Jeden projekt obsługuje UI oraz endpointy serwerowe.

## Start lokalny

```bash
npm install
Copy-Item .env.example .env
npx prisma generate
npm run dev
```

Otwórz `http://localhost:3000`.

Ustaw `DATABASE_URL` i długi losowy `SESSION_SECRET` w `.env`. Webhook Discord jest opcjonalny i pozostaje wyłącznie zmienną serwerową. Powiadomienia zawierają tylko metadane zdarzeń. Nigdy nie wysyłaj haseł, hashy haseł, tokenów sesji, cookies ani kluczy API; e-mail pozostaje w bazie.

## Endpointy

- `POST /api/auth/register` waliduje konto i zapisuje hasło jako bcrypt hash.
- `POST /api/auth/login` tworzy sesję w bazie i cookie HttpOnly.
- `POST /api/auth/logout` usuwa sesję i czyści cookie.

Schemat znajduje się w `prisma/schema.prisma`; zawiera użytkowników, posty, kategorie, lajki z unikalnym `(userId, postId)`, komentarze, zgłoszenia, sesje i logi bezpieczeństwa.

Seed tworzy wymagane kategorie oraz konto administratora `FilipPankiewicz`. Na Renderze ustaw `ADMIN_PASSWORD` jako sekret o długości co najmniej 8 znaków. Hasło nie jest zapisane w kodzie ani w migracji; do bazy trafia wyłącznie hash bcrypt. Profile użytkowników są przechowywane w tabeli `User`, a posty są powiązane przez `Post.userId`.

### Logowanie administratora

1. W Render Dashboard otwórz usługę `wapromo-api` i dodaj sekret `ADMIN_PASSWORD`.
2. Wykonaj redeploy usługi. Seed utworzy konto `FilipPankiewicz` z tym hasłem i rolą `ADMIN`.
3. Zaloguj się loginem `FilipPankiewicz` oraz wartością ustawioną w `ADMIN_PASSWORD`.
4. Otwórz `/admin` na domenie Render. Panel pozwala zmieniać role użytkowników. Przy frontendzie GitHub Pages użyj linku panelu prowadzącego do domeny Render.

## Render i GitHub Pages

`render.yaml` tworzy usługę `wapromo-api` oraz PostgreSQL. Po wdrożeniu Render ustawia `DATABASE_URL`, `SESSION_SECRET`, `FRONTEND_URL` i opcjonalny webhook. Komenda migracji produkcyjnej to `npx prisma migrate deploy`, a serwer uruchamia `npm start`.

GitHub Actions buduje statyczny frontend przez `npm run build:pages` i publikuje go na GitHub Pages. Frontend używa `NEXT_PUBLIC_API_URL`; domyślnie wskazuje `https://wapromo-api.onrender.com`. Jeżeli Render nada inną domenę, ustaw w repozytorium GitHub variable `NEXT_PUBLIC_API_URL` na właściwy adres usługi i uruchom workflow ponownie. W ustawieniach repozytorium wybierz Pages source: **GitHub Actions**.

## Monitoring

Endpoint `GET /api/health` zwraca prosty status usługi. Lokalny skrypt `npm run keep-alive` pinguję adres z `KEEP_ALIVE_URL` co 3 minuty. Uruchamiaj go na własnym monitoringu lub schedulerze; Render może nadal usypiać usługę zgodnie z zasadami wybranego planu.

Webhook podany w wiadomości nie został zapisany w repozytorium. Ponieważ został ujawniony, unieważnij go i wygeneruj nowy przed użyciem produkcyjnym.
