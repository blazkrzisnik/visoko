# Kavarna Visoko – kaj je novo

Datoteke prepiši čez obstoječe na strežniku, skupaj z mapo `slike/`.
`štala.png` se zdaj imenuje `stala.png` (brez šumnika, da deluje na vseh strežnikih).

## Kar moraš narediti sam
1. **Supabase:** v tabelo `ponudba` dodaj stolpce `cena`, `kategorija` in `posebnost`
   ter pravilu za pisanje dodaj UPDATE (SQL je v `NAVODILA-ADMIN.md`, korak 2 in 3).
   Nato v `admin.html` pri vsaki postavki klikni **Uredi** in vpiši ceno in kategorijo.
2. **Hišna posebnost:** »Metina tortica« je predlog (ime in opis sta izmišljena),
   ker Instagrama in Facebooka nisem mogel prebrati. Vse cene so okvirne – popravi jih.
3. **Portret Ivana Tavčarja:** prenesi sliko z
   https://commons.wikimedia.org/wiki/File:Ivan_Tav%C4%8Dar.jpg in jo shrani kot
   `slike/ivan-tavcar.jpg`. Dokler je ni, se slika naloži neposredno z Wikimedie.
   Na strani datoteke preveri, da je slika res v javni domeni.

4. **Delovni čas:** po poljanskadolina.com je kavarna 9.00–19.00 odprta samo do konca
   septembra. Če je zimski čas drugačen, ga popravi v `index.html`, `rezervacije.html` in `okolica.html`.
5. **Dogodki iz baze:** dodaj Adventni sejem (13. 12. 2026) prek `admin.html`, saj baza
   prepiše privzete dogodke.

## Spremembe
- **Slike** so vključene, nova je `macha.png` (Matcha latte na strani Ponudba).
- **Poroke:** prava prizorišča s poljanskadolina.com (paviljon z razgledom na sv. Volbenka,
  Visoški toplar, poročna dvorana s poslikavami, Dvorana pod velbi za do 200 gostov).
- **Ponudba:** temna pasica »Hišna posebnost« na vrhu, spodaj cenik po kategorijah s cenami;
  popravljeno pokvarjeno gnezdenje (noga strani je bila znotraj dveh sekcij).
- **Domov:** »Kaj še odkriti na Visokem« s karticami s slikami in povezavami v Okolico.
- **Zgodba:** portret Ivana Tavčarja s kratkim opisom.
- **Okolica:** tri jasni sklopi (Dediščina, Narava, Doživetja), hitra navigacija,
  izbirnik rezervacij z gumbom, ki odpre obrazec z že izbranim namenom.
- **Rezervacije:** samo obrazec in kontakti (telefon in e-pošta sta klikljiva).
- **Pravopis:** pomišljaji (–), vikanje povsod, slovnične napake v besedilih.
- `.min` datoteke so na novo ustvarjene iz izvornih.
