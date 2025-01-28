# Darttavle Prosjekt 🎯

Dette prosjektet er en enkel nettbasert applikasjon designet for å spore poeng på en darttavle. Applikasjonen støtter import og eksport av Excel-filer og viser dataene i et oversiktlig tabellformat. Brukerne kan se den totale poengsummen for hver spiller over de siste tre rundene.

Det finnes en funksjon for å legge til nye spillere, men navnevalgene har begrensninger – ingen spillere kan ha samme navn. Hvis et navn finnes blir skrevet to ganger, vises det en kort feilmelding som forklarer problemet, ved siden av navnet som er skrevet to ganger.

I tillegg inkluderer applikasjonen et inputfelt hvor man kan legge inn verdier for både det første og andre kastet i den pågående runden. Applikasjonen er fleksibel for videreutvikling og kan potensielt jobbe med en database i fremtiden.

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






