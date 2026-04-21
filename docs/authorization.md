# Autoryzacja i Funkcjonalności Administratora

Aplikacja Local Archive implementuje pełen system autoryzacji i zarządzania uprawnieniami, spełniając kryteria bezpieczeństwa i ról użytkowników. Dokument ten opisuje wdrożone rozwiązania techniczne z perspektywy kodu oraz funkcjonalności biznesowe oddane w ręce administratorów.

## 1. Autoryzacja użytkowników (Google OAuth)

Proces uwierzytelniania w aplikacji został oparty o sprawdzoną bibliotekę **NextAuth.js (v5)**. Zrezygnowano z tradycyjnej autoryzacji bazującej na hasłach na rzecz bezpieczniejszego i wygodniejszego standardu OAuth 2.0.

### Integracja w kodzie (`web/lib/auth.ts`)

- **Dostawca OAuth**: Użyto `GoogleProvider`. Aby system działał, należy podać zmienne środowiskowe `AUTH_GOOGLE_ID` oraz `AUTH_GOOGLE_SECRET`.
- **Zapis użytkowników**: System wykorzystuje `PrismaAdapter`, co oznacza, że po udanym logowaniu przez Google, NextAuth automatycznie tworzy lub aktualizuje rekord w tabeli `User` w bazie PostgreSQL.
- **Strategia JWT**: Skonfigurowano sesję w oparciu o tokeny JWT (`session: { strategy: "jwt" }`). 
- **Zapis ról w Tokenie**: Dzięki nadpisaniu typów (TypeScript) i funkcji zwrotnych (`callbacks.jwt` oraz `callbacks.session`), parametry takie jak rola użytkownika (`role`) czy jego blokada (`blocked`) są wtłaczane bezpośrednio do zaszyfrowanego tokenu ciasteczka (cookie).

### Edge Middleware (`web/middleware.ts`)

Fakt użycia tokenów JWT pozwala na weryfikację uprawnień na tzw. Krawędzi Sieci (Edge). Zanim serwer wygeneruje kod HTML lub sprawdzi bazę danych, Middleware odczytuje token JWT i:

1. Sprawdza, czy użytkownik próbuje wejść na zastrzeżone ścieżki (np. `/creator`, `/admin`).
2. Weryfikuje, czy użytkownik posiada flagę `blocked = true` — jeśli tak, natychmiast przekierowuje go na ścieżkę `/blocked`.

## 2. Zarządzanie użytkownikami (Administrator)

Użytkownicy z najwyższą rolą (`ADMIN`) posiadają dostęp do zamkniętego panelu nawigacyjnego (`/admin`).

### Zmiana ról

W sekcji "User management" administratorzy widzą tabelę z listą wszystkich użytkowników pobraną asynchronicznie za pomocą zapytań Prisma ORM (`db.user.findMany`).

- Administrator może przypisać dowolnemu użytkownikowi jedną z trzech ról: `VIEWER`, `CREATOR`, lub `ADMIN`.
- System wymaga zapisania zmian dedykowanym przyciskiem "Save" obok wiersza użytkownika, co wyzwala wywołanie do API (`PATCH /api/users/[id]/role`).

### Mechanizm blokowania

Administratorzy otrzymują potężne narzędzie prewencyjne. Jeśli dany użytkownik łamie regulamin (np. udostępnia nieodpowiednie zdjęcia), administrator może użyć przełącznika "Blocked" w tej samej tabeli.
Wywołuje to asynchroniczną metodę `PATCH /api/users/[id]/block`. Dzięki architekturze opisanej wyżej, odcięcie użytkownika od platformy działa niemalże natychmiast, a Middleware wyrzuci zablokowanego z jego sesji przy kolejnym przeładowaniu strony.

## 3. Przegląd ostatnio dodanych zdjęć

Panel administratora (`web/app/admin/page.tsx`) posiada wbudowany szybki podgląd do celów moderacyjnych.

- **Działanie**: Na samej górze panelu renderowana jest tabela "Recent uploads".
- **Integracja**: Widok pobiera dane poprzez `db.photo.findMany({ orderBy: { createdAt: "desc" }, take: 20 })`, dynamicznie wiążąc te informacje z danymi wgrywającego (`uploader`) oraz docelową Kategorią.
- **Korzyść**: Administratorzy logując się, widzą błyskawiczne streszczenie ostatnich 20 materiałów przesłanych do archiwum przez twórców bez konieczności nawigowania po całym drzewie kategorii. Pozwala to na szybką identyfikację błędnie otagowanych fotografii i ich ewentualne usunięcie.
