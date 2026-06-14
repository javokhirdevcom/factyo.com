const serviceModel = require('../models/service.model')

const SEED_SERVICES = [
  {
    title: 'Badkamers',
    slug: 'badkamers',
    tagline: 'Uw droomkamer, vakkundig gerealiseerd',
    shortDescription:
      'Complete badkamerrenovatie van ontwerp tot oplevering. Tegels, sanitair, waterproofing en verlichting — VCA-gecertificeerd en met 2 jaar garantie.',
    description:
      'Oynur Bouw is dé specialist in complete badkamerrenovaties in Nederland. Of het nu gaat om een minimalistische regendouche, een luxe vrijstaand bad of een functionele gezinsbadkamer — wij realiseren uw droomproject. Onze VCA-gecertificeerde vakmensen zorgen voor perfecte waterdichtheid, strak tegelwerk en tijdige oplevering. Van eerste intake tot sleuteloverdracht coördineren wij alles.',
    category: 'badkamers',
    features: [
      'Gratis 3D ontwerp en adviesgesprek',
      'Tegelwerk — vloer én wand',
      'Vloerverwarming installatie',
      'Sanitair montage (douche, bad, toilet, wastafel)',
      'Waterproofing met 10 jaar garantie',
      'Elektrische aansluitingen (VCA-gecertificeerd)',
      'Ventilatiesystemen en dampkap',
      'Maatwerk meubels en spiegelkasten',
      'LED verlichting en sfeerverlichting',
      '2 jaar garantie op alle werkzaamheden',
    ],
    process: [
      {
        step: 1,
        title: 'Intake & 3D Ontwerp',
        description: 'Gratis adviesgesprek aan huis, wensbespreking en 3D visualisatie van uw nieuwe badkamer.',
      },
      {
        step: 2,
        title: 'Transparante Offerte',
        description: 'Gedetailleerde offerte met vaste prijs — geen verrassingen achteraf. AI-gestuurde kostenraming.',
      },
      {
        step: 3,
        title: 'Professionele Uitvoering',
        description: 'Onze gecertificeerde monteurs werken netjes en respecteren uw woning.',
      },
      {
        step: 4,
        title: 'Oplevering & Garantie',
        description: 'Grondige eindcontrole, opleverrapport en 2 jaar garantie op alle werkzaamheden.',
      },
    ],
    coverImage:
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620626011761-996317702782?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop',
    ],
    startingPrice: 4500,
    priceUnit: 'per project',
    estimatedDuration: '1–3 weken',
    isVCARequired: true,
    order: 1,
  },
  {
    title: 'Gipsplaten',
    slug: 'gipsplaten',
    tagline: 'Strakke wanden en plafonds, razendsnel',
    shortDescription:
      'Professioneel gipsplaatwerk voor wanden, plafonds en systeemscheidingen. Snel, netjes en klaar voor de schilder.',
    description:
      'Van een extra kamer in de zolder tot systeemplafonds in kantoorpanden — Oynur Bouw levert vakkundig gipsplaatwerk door heel Nederland. Wij werken met premium Knauf- en Gyproc-materialen voor een perfecte, strakke afwerking die klaar is voor het schilderwerk.',
    category: 'gipsplaten',
    features: [
      'Gipskarton wanden en scheidingswanden',
      'Systeemplafonds en verlaagde plafonds',
      'Brandwerende constructies (EI30/EI60)',
      'Akoestische isolatie',
      'Zolderrenovaties en dakkapellen',
      'Stucwerk en gladpleister afwerking',
      'Knauf en Gyproc premium materialen',
    ],
    process: [
      { step: 1, title: 'Opname & Inmeting', description: 'Gratis inmeting en materiaaladvies op locatie.' },
      { step: 2, title: 'Planning', description: 'Strakke planning zodat u geen dag extra wacht.' },
      { step: 3, title: 'Montage', description: 'Professionele montage door ervaren vakmensen.' },
      { step: 4, title: 'Afwerking', description: 'Gladde afwerking, klaar voor schilderwerk.' },
    ],
    coverImage:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop',
    ],
    startingPrice: 800,
    priceUnit: 'per project',
    estimatedDuration: '1–5 dagen',
    isVCARequired: false,
    order: 2,
  },
  {
    title: 'Schilderwerk',
    slug: 'schilderwerk',
    tagline: 'Stralende muren, perfecte finish',
    shortDescription:
      'Interieur en exterieur schilderwerk met premium verfmerken. Van stucwerk en gladpleister tot behang en kleuradvies.',
    description:
      'Een frisse verflaag vernieuwd uw ruimte volledig. Oynur Bouw verzorgt professioneel schilderwerk en stucwerk voor particulieren en zakelijke klanten. Wij werken met Sigma, Sikkens en andere premium verfmerken voor een duurzame, strakke afwerking.',
    category: 'schilderwerk',
    features: [
      'Interieur schilderwerk (wanden en plafonds)',
      'Exterieur schilderwerk (gevels en kozijnen)',
      'Stucwerk en gladpleister',
      'Behangwerk',
      'Gratis kleuradvies',
      'Premium verfmerken: Sigma, Sikkens, Flexa',
      'Anti-schimmel behandeling',
    ],
    process: [
      { step: 1, title: 'Ondergrond inspectie', description: 'Beoordeling van de ondergrond en eventueel herstelwerk.' },
      { step: 2, title: 'Voorbereiding', description: 'Plamuren, schuren, impregneren en afplakken.' },
      { step: 3, title: 'Uitvoering', description: 'Minimaal 2 lagen premium verf of stuc.' },
      { step: 4, title: 'Oplevering', description: 'Kwaliteitscontrole en schoonmaak van de werkruimte.' },
    ],
    coverImage:
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=800&auto=format&fit=crop',
    ],
    startingPrice: 600,
    priceUnit: 'per project',
    estimatedDuration: '1–3 dagen',
    isVCARequired: false,
    order: 3,
  },
  {
    title: 'Elektra',
    slug: 'elektra',
    tagline: 'Veilig, NEN-conform en VCA-gecertificeerd',
    shortDescription:
      'Complete elektrische installaties door VCA-VOL gecertificeerde monteurs. Meterkast, groepen, EV-laders en domotica.',
    description:
      'Veiligheid staat voorop bij elektrotechnisch werk. Oynur Bouw werkt uitsluitend met VCA-VOL gecertificeerde elektromonteurs die volledig voldoen aan NEN 1010 en alle Arbovoorschriften. Van een simpele meterkast renovatie tot complete nieuwbouwinstallaties.',
    category: 'elektra',
    features: [
      'Meterkast renovatie en verzwaring',
      'Groepen en bedrading aanleggen',
      'Inbouwverlichting en schakelaars',
      'Aardlekschakelaars (RCD) installatie',
      'EV-laadpaal installatie (thuisladen)',
      'Domotica en slimme schakelaars (Hue, KNX)',
      'NEN 3140 veiligheidskeuring',
      'Officieel keuringscertificaat',
    ],
    process: [
      { step: 1, title: 'Elektra-inspectie', description: 'Gratis inspectie van uw bestaande installatie.' },
      { step: 2, title: 'Offerte op maat', description: 'Transparante offerte conform NEN-normen.' },
      { step: 3, title: 'VCA-montage', description: 'Gecertificeerde installatie door onze elektromonteurs.' },
      { step: 4, title: 'Keuring & Certificaat', description: 'Officiële NEN 3140 keuring en opleveringscertificaat.' },
    ],
    coverImage:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
    ],
    startingPrice: 350,
    priceUnit: 'per opdracht',
    estimatedDuration: '1–7 dagen',
    isVCARequired: true,
    order: 4,
  },
  {
    title: 'Zonnepanelen',
    slug: 'zonnepanelen',
    tagline: 'Groene energie met maximaal rendement',
    shortDescription:
      'Professionele installatie van zonnepanelen door VCA-VOL gecertificeerde monteurs. Maximaal rendement met premium A-merk panelen.',
    description:
      'Bespaar structureel op uw energierekening en verhoog de waarde van uw woning. Oynur Bouw installeert zonnepanelen voor particulieren en bedrijven met de hoogste kwaliteitsstandaarden. Wij begeleiden u van dakinspectie tot SDE-subsidie en jaarlijkse monitoring.',
    category: 'zonnepanelen',
    features: [
      'Premium zonnepanelen — Longi, JA Solar, SunPower',
      'Omvormer en monitoring (SolarEdge, Enphase)',
      'Waterdichte dakdoorvoer',
      'Teruglevering configuratie',
      'SDE++ en ISDE subsidie begeleiding',
      '25 jaar productgarantie op panelen',
      '10 jaar installatiegarantie',
      'Jaarlijkse rendementcontrole',
    ],
    process: [
      { step: 1, title: 'Dakinspectie', description: 'Analyse van dakoppervlak, oriëntatie, helling en beschaduwing.' },
      { step: 2, title: 'Systeem ontwerp', description: 'Maatwerk ontwerp voor maximale jaaropbrengst.' },
      { step: 3, title: 'Installatie', description: 'VCA-gecertificeerde montage op één werkdag.' },
      { step: 4, title: 'Activering & Monitoring', description: 'Aansluiting op het net, activering en app-monitoring.' },
    ],
    coverImage:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1548337138-e87d889cc369?q=80&w=800&auto=format&fit=crop',
    ],
    startingPrice: 3200,
    priceUnit: 'per installatie',
    estimatedDuration: '1–2 dagen',
    isVCARequired: true,
    order: 5,
  },
  {
    title: 'Renovatie',
    slug: 'renovatie',
    tagline: 'Van oud naar nieuw — volledig ontzorgd',
    shortDescription:
      'Complete woningrenovaties van A tot Z. Wij coördineren alle vaklieden, houden u op de hoogte en leveren op tijd op.',
    description:
      'Een complete renovatie is een grote investering. Oynur Bouw neemt u het projectmanagement volledig uit handen. Één aanspreekpunt, één contract, alle vaklieden via ons. Van bouwkundige aanpassingen en gipsplaatwerk tot schilderwerk, elektra en badkamer — wij doen het allemaal.',
    category: 'renovatie',
    features: [
      'Complete projectcoördinatie — één aanspreekpunt',
      'Bouwkundige aanpassingen',
      'Alle vakdisciplines in eigen beheer',
      'Wekelijkse voortgangsrapportage',
      'Vaste prijs, geen meerwerk-verrassingen',
      'Tijdsgebonden planning met mijlpalen',
      'Garantie op alle werkzaamheden',
      'Energie-verbeterende renovaties (BENG)',
    ],
    process: [
      { step: 1, title: 'Intake & Wensen', description: 'Uitgebreid gesprek over uw wensen, deadline en budget.' },
      { step: 2, title: 'Projectplan', description: 'Gedetailleerd plan met tijdlijn, vaklieden en vaste prijs.' },
      { step: 3, title: 'Uitvoering', description: 'Gecoördineerde uitvoering door al onze vaklieden.' },
      { step: 4, title: 'Oplevering', description: 'Eindcontrole, snagginglist en officiële overdracht.' },
    ],
    coverImage:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1200&auto=format&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800&auto=format&fit=crop',
    ],
    startingPrice: 10000,
    priceUnit: 'per project',
    estimatedDuration: '2–12 weken',
    isVCARequired: true,
    order: 6,
  },
]

class ServiceController {
  async seedIfEmpty() {
    const count = await serviceModel.countDocuments()
    if (count === 0) {
      await serviceModel.insertMany(SEED_SERVICES)
      console.log('[Services] Database seeded with 6 default services.')
    }
  }

  // [GET] /api/services
  async getAll(req, res, next) {
    try {
      await this.seedIfEmpty()
      const services = await serviceModel
        .find({ isActive: true })
        .sort({ order: 1 })
        .select('-__v')
      return res.json({ success: true, services })
    } catch (error) {
      next(error)
    }
  }

  // [GET] /api/services/:slug
  async getBySlug(req, res, next) {
    try {
      const service = await serviceModel
        .findOne({ slug: req.params.slug, isActive: true })
        .select('-__v')
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' })
      }
      return res.json({ success: true, service })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ServiceController()
