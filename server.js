// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';


console.log('Hieronder moet je waarschijnlijk nog wat veranderen')
// Doe een fetch naar de data die je nodig hebt
const [documentsRes, eventsRes, newsRes, nominationsRes, themesRes, categoriesRes, contactRes] = await Promise.all([
   fetch('https://fdnd-agency.directus.app/items/adconnect_documents'),
   fetch('https://fdnd-agency.directus.app/items/adconnect_events'),
   fetch('https://fdnd-agency.directus.app/items/adconnect_news'),
   fetch('https://fdnd-agency.directus.app/items/adconnect_nominations'),
   fetch('https://fdnd-agency.directus.app/items/adconnect_themes'),
   fetch('https://fdnd-agency.directus.app/items/adconnect_categories'),
   fetch('https://fdnd-agency.directus.app/items/adconnect_contact'),
])

const documents = await documentsRes.json()
const events = await eventsRes.json()
const news = await newsRes.json()
const nominations = await nominationsRes.json()
const themes = await themesRes.json()
const categories = await categoriesRes.json()
const contact = await contactRes.json()

// Controleer eventueel de data in je console
// (Let op: dit is _niet_ de console van je browser, maar van NodeJS, in je terminal)
// console.log(apiResponseJSON)


// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({ extended: true }))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get('/', async function (request, response) {
   // Render index.liquid uit de Views map
   // Geef hier eventueel data aan mee
   response.render('index.liquid', { documents: documents.data, events: events.data, news: news.data, nominations: nominations.data, themes: themes.data, categories: categories.data, contact: contact.data })
})

app.get('/ad-talent-award', async function (request, response) {
   // Render adTalentAward.liquid uit de Views map
   // Geef hier eventueel data aan mee
   response.render('talentAward.liquid', { documents: documents.data, events: events.data, news: news.data, nominations: nominations.data, themes: themes.data, categories: categories.data, contact: contact.data })
})

app.get('/nominee/:naam', async function (request, response) {
   // Render nominee.liquid uit de Views map
   const naam = request.params.naam
   // Haal dash uit volledige naam
   const correcteNaam = naam.replaceAll('-', ' ')
   // Zoek in array op naam
   const fetchedNaam = nominations.data.find(item => item.title === correcteNaam)

   response.render('nominee.liquid', { nomination: fetchedNaam })
})

app.get('/opleidingsprofielen', async function (request, response) {
   // Render opleidingsprofielen.liquid uit de Views map
   // Geef hier eventueel data aan mee
   response.render('opleidingsprofielen.liquid', { documents: documents.data, events: events.data, news: news.data, nominations: nominations.data, themes: themes.data, categories: categories.data, contact: contact.data })
})

app.get('/contact', async function (request, response) {
   // Render opleidingsprofielen.liquid uit de Views map
   // Geef hier eventueel data aan mee
   response.render('contact.liquid', { documents: documents.data, events: events.data, news: news.data, nominations: nominations.data, themes: themes.data, categories: categories.data, contact: contact.data })
})

// Maak een POST route voor de index; hiermee kun je bijvoorbeeld formulieren afvangen
// Hier doen we nu nog niets mee, maar je kunt er mee spelen als je wilt
app.post('/contact', async function (request, response) {
   // Je zou hier data kunnen opslaan, of veranderen, of wat je maar wilt
   // Er is nog geen afhandeling van een POST, dus stuur de bezoeker terug naar /
     await fetch("https://fdnd-agency.directus.app/items/adconnect_contact", {
    method: "POST",
    body: JSON.stringify({
      name: request.body.name,
      email: request.body.email,
      message: request.body.message,
    }),

    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
  });
   response.redirect(303, '/contact')
})


app.use((req, res) => {
  res.status(404).send("Pagina bestaat niet!")
})

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000, als dit ergens gehost wordt, is het waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
   // Toon een bericht in de console en geef het poortnummer door
   console.log(`Application started on http://localhost:${app.get('port')}`)
})
