# Project requirements

## Opis i cel projektu

Celem projektu jest stworzenie aplikacji internetowej do obsługi cyfrowego archiwum społecznościowego, wspierającego lokalnych mieszkańców i pasjonatów historii w gromadzeniu i udostępnianiu zdjęć przedstawiających historię i ewolucję danego obszaru. Najcenniejsze materiały historyczne często znajdują się w prywatnych dokumentach osób starszych, co wymaga prostego, dostępnego i intuicyjnego interfejsu użytkownika. Jeśli ktoś chce dowiedzieć się, jak dane miejsce zmieniało się na przestrzeni czasu, powinien mieć możliwość wyszukiwania danych w oparciu o lokalizację geograficzną i okres.

### Role w systemie

- Administrator,
- Przeglądający,
- Twórca

### Wymagania funkcjonalne

1. Administrator odpowiada za konfigurację systemu, monitorowanie działań użytkowników oraz przeprowadzanie audytu bezpieczeństwa. Zatem powinien mieć możliwość:
 a. usunięcia wadliwej treści (zdjęcia),
 b. zmiany charakterystyki przesłanego zdjęcia (czyli zmiany wartości metadanych oraz opisu),
 c. oraz zablokowania użytkownika (dodawania materiałów) publikującego wadliwe treści jeśli zajdzie taka konieczność.
2. Przeglądający ma dostęp do przeglądania zdjęć oraz wyników wyszukiwania. Zatem powinien mieć możliwość:
 a. przeglądania dostępnych materiałów wg zdefiniowanej w serwisie hierarchicznej struktury informacji,
 b. wyszukiwania treści na podstawie predefiniowanych metadanych, szukanej frazy, przynależności do wybranego poziomu hierarchicznej struktury.
3. Twórca ma wszystkie uprawnienia Przeglądającego, a do tego odpowiada za zarządzanie swoimi materiałami oraz ich opisem. Zatem powinien mieć możliwość:
 a. zarejestrowania/zalogowania się do witryny (np. poprzez integrację z popularnymi dostawcami tożsamości jak Google czy Facebook),
 b. przesyłania, modyfikowania i usuwania swoich zdjęć,
 c. opisywania swoich materiałów poprzez przypisanie do hierachicznej struktury oraz metadanych, co najmniej: lokalizacja, data utworzenia zdjęcia z dowolną dokładnością, opis tekstowy,
4. System udostępnia publiczne API Rest umożliwiające wyszukiwanie materiałów oraz prywatne API umożliwiające dodawanie materiałów przez twórcę.

### Wymagania niefunkcjonalne

1. System umożliwi korzystanie z responsywnego i intuicyjnego interfejsu użytkownika
spełniającego kryteria standardu WCAG 2.1 na poziomie AA.
2. System umożliwia dostosowanie wyglądu do wybranego przez użytkownika stylu
jasny/ciemny/kontrastowy (dla osób słabo widzących).
