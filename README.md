# Valtheris Tools

Dashboard privat pentru comunitatea Discord/Minecraft Valtheris. Aplicatia foloseste Discord OAuth2 si permite accesul doar utilizatorilor care au permisiunea `Administrator` pe guild-ul configurat.

## Cerinte

- Node.js 22.13 sau mai nou
- npm
- O aplicatie Discord in Discord Developer Portal
- Guild ID-ul serverului Discord
- Un `SESSION_SECRET` lung, random, de minimum 32 caractere

## Instalare

```bash
npm install
```

## Configurare `.env`

Copiaza `.env.example` in `.env` si completeaza valorile:

```env
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_GUILD_ID=
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/callback
SESSION_SECRET=
NEXT_PUBLIC_APP_NAME=Valtheris Tools
```

`SESSION_SECRET` trebuie sa fie privat si lung. Exemplu pentru generare:

```bash
node -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

## Discord Application

1. Intra in Discord Developer Portal.
2. Creeaza o aplicatie noua.
3. Deschide sectiunea `OAuth2`.
4. Copiaza `Client ID` in `DISCORD_CLIENT_ID`.
5. Reseteaza/copiaza `Client Secret` in `DISCORD_CLIENT_SECRET`.
6. La `Redirects`, adauga exact:

```text
http://localhost:3000/api/auth/callback
```

Pentru productie, adauga si URL-ul final:

```text
https://domeniul-tau.ro/api/auth/callback
```

Seteaza acelasi URL de productie in `.env`:

```env
DISCORD_REDIRECT_URI=https://domeniul-tau.ro/api/auth/callback
```

## Guild ID

1. In Discord, activeaza `Developer Mode`.
2. Click dreapta pe server.
3. Alege `Copy Server ID`.
4. Pune valoarea in `DISCORD_GUILD_ID`.

## Development

```bash
npm run dev
```

Deschide URL-ul local afisat in terminal. Daca `.env` nu este complet, pagina de login afiseaza variabilele lipsa.

## Verificari

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Productie

Build:

```bash
npm run build
```

Pornire:

```bash
npm run start
```

## PM2

Instaleaza PM2 pe server:

```bash
npm install -g pm2
```

Porneste aplicatia:

```bash
pm2 start "npm run start" --name valtheris-tools
pm2 save
pm2 startup
```

## Nginx reverse proxy

Exemplu pentru o aplicatie care ruleaza local pe portul afisat de `npm run start`:

```nginx
server {
  listen 80;
  server_name domeniul-tau.ro;

  location / {
    proxy_pass http://127.0.0.1:8787;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Ruleaza apoi Certbot sau solutia ta TLS preferata pentru HTTPS.

## Securitate

- OAuth state este validat server-side.
- Sesiunile sunt semnate HMAC si au expirare.
- Cookie-ul de sesiune este `HttpOnly`, `SameSite=Lax` si `Secure` in productie.
- Logout-ul foloseste token CSRF legat de sesiune.
- Autorizarea dashboard-ului este verificata server-side.
- Permisiunea Discord `Administrator` se verifica prin bitfield-ul real de permisiuni si owner-ul guild-ului este autorizat automat.
- Secretul Discord, token-urile OAuth si cookie-urile nu sunt expuse clientului.

## Structura proiectului

- `app/api/auth/*` - rute OAuth2, callback si logout
- `app/dashboard/*` - paginile private
- `components/dashboard/*` - shell-ul si navigatia dashboard-ului
- `components/tools/*` - generatoarele interactive
- `lib/auth/*` - sesiuni, cookies, Discord API, rate limiting
- `lib/gradient.ts` - validare HEX si formate Minecraft
- `lib/small-caps.ts` - conversie Unicode small caps
- `lib/symbols.ts` - simboluri grupate pentru Minecraft
- `lib/templates.ts` - template-uri HEX Valtheris
- `test/*` - teste pentru utilitarele importante
