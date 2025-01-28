# Darttavle Prosjekt

Dette prosjektet er en nettbasert applikasjon for å spore poeng på en darttavle, lagre data lokalt og samhandle med en database ved bruk av Flask og SQLite3. Applikasjonen inkluderer funksjoner for å legge til spillere, registrere poeng, beregne bonuspoeng, eksportere/importere `.xlsx`-filer og vise data i en tabell.



## Forutsetninger

For å kjøre dette prosjektet trenges det følgende installert på datamaskinen din:

- **Python 3.8+**
- **pip** (Pythons pakkehåndterer)
- **SQLite3** (vanligvis forhåndsinstallert med Python, men kan være nødvendig å installere separat på noen systemer)

## Instruksjoner for oppsett

1. **Klon prosjektet**

````bash
git clone URL ti den repository
cd DartCounter
````
2. **Oprett et virtuelt miljø (Dette er valgfritt, men anbefales)**

Skriv navnet til den virtuelt miljø 

````bash
python -m venv venv
````
Deretter aktiver miljøet 
````bash

venv\Scripts\activate  
````
3. **Installer avhengigheter**

bruk `pip` for å installere Flask og andre nødvendige pakker. 
````bash
pip install -r requirements.txt
````
4. **Sett opp database**

Prosjektet bruker SQLite3 til håndtering av databasen. `app.py`-filen oppretter automatisk en database med nødvendige tabeller når du kjører programmet. 

5. **Kjør aplikasjonen og åpne den i nettleseren** 

Start Flask-aplikasjonen ved å kjøre i terminalen
````bash
python app.py 
````
Når applikasjonen starter, vil terminalen vise en adresse
````plaintext
* Running on http://127.0.0.1:500/ (Press CTRL+ C to quit)
````
Dette betyr at aplikasjonen kjører lokalt på `http://127.0.0.1:5000`






