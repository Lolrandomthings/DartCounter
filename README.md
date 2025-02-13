# Darttavle Prosjekt 🎯

Dette prosjektet er en nettbasert applikasjon for å spore poeng i dartspill. Applikasjonen støtter import og eksport av Excel-filer og viser data i et oversiktlig tabellformat. Brukerne kan:

- Laste opp en Excel-fil med poengdata (for eksempel for enkeltkamper eller sesongstatistikk).

- Se en automatisk beregnet totalsum for hver spiller og en visning av sesongvinneren.  

- Tilbakestille tabellene (enten for en enkelt kamp eller for sesongstatistikk)

Prosjektet er designet med tanke på ekstra tiltak for å hindre feilbruk, og gir tydelige feilmeldinger ved problemer som feil filformat eller tomme tabeller.

## Forutsetninger

For å kjøre prosjektet, må du ha følgende installert på din datamaskin:

- **Python 3.8+**
- **pip** (Pythons pakkehåndterer)
- **Flask** (for servering av applikasjonen)

> **Merk:**  
> Dette prosjektet bruker ikke en database, da all poengberegning og tabellhåndtering skjer direkte i nettleseren.


## Oppsett og Installasjon

1. **Klon prosjektet**

   ```bash
   git clone https://github.com/Lolrandomthings/DartCounter.git
   cd DartCounter
   ```


## Forutsetninger

For å kjøre dette prosjektet trenges det følgende installert på datamaskinen din:

- **Python 3.8+**
- **pip** (Pythons pakkehåndterer)
- **SQLite3** (vanligvis forhåndsinstallert med Python, men kan være nødvendig å installere separat på noen systemer)

## Oppsett og Installasjon

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
myenv\Scripts\activate
````
3. **Installer avhengigheter**

bruk `pip` for å installere Flask og andre nødvendige pakker. 
````bash
pip install -r requirements.txt
````

4. **Kjør aplikasjonen og åpne den i nettleseren** 

Start Flask-aplikasjonen ved å kjøre i terminalen
````bash
python app.py 
````
Når applikasjonen starter, vil terminalen vise en adresse
````plaintext
* Running on http://127.0.0.1:500/ (Press CTRL+ C to quit)
````
Dette betyr at aplikasjonen kjører lokalt på `http://127.0.0.1:5000`

<br> 

# Funksjonalitet

**Excel Import/Export**

Brukerne kan laste opp en .xlsx-fil for å fylle tabellene med poengdata. Totalsummen for hver rad beregnes automatisk, og applikasjonen viser sesongvinneren. Data kan også eksporteres tilbake til en Excel-fil.

**Nullstiling av Tabeller**

Det finnes egne reset-funksjoner for:

- Den vanlige dart-tabellen (hvor bare de relevante scorecellene tilbakestilles, mens navn og andre faste celler beholdes).

- Sesongstatistikktabellen, hvor hele strukturen settes tilbake til standard med de opprinnelige placeholder-tekstene.

- Begge reset-funksjonene inkluderer feilhåndtering for å unngå at applikasjonen krasjer 

**Feilhåndtering**

Applikasjonen gir tydelige feilmeldinger ved for eksempel feil filformat, manglende data eller forsøk på å tilbakestille en allerede tom tabell.






