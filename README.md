# Darttavle Prosjekt 🎯

Dette prosjektet er en enkelt nettbasert applikasjon for å spore poeng på en darttavle, den importerer og expoterer XL-filer og viser datane i en tabell. Man har muligheten til å se total summen hvert person fikk av de siste tre runder. Det finnes en funksjon for å legge til flere spiller, men spillerne er begrenset på navn. Ikke mer enn en spiller kan ha sammenavn, blir funksjonet stoppet inntil feiler blir rettet. I tillegg til dette har aplikasjonen input felte hvor man kan sette in verdier til første og andre kast av runden som foregår. Aplikasjonen er utvidet for å utvikles videre og det er mulig man kan jobbe med den på en database 

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
python -m venv myenv
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






