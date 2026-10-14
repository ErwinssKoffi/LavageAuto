import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Menu, Moon, Play, Sun, X } from 'lucide-react'

import { Brand } from '@/components/Brand'
import { Button } from '@/components/ui/primitives'
import { useAuth } from '@/hooks/useAuth'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useTheme } from '@/hooks/useStation'

const BENEFITS = [
  ['01', 'Plus de lavages, moins d’attente', 'Organisez la file, affectez les prestations et gardez chaque véhicule en mouvement.'],
  ['02', 'Une caisse toujours maîtrisée', 'Chaque encaissement, remise et commission est tracé pour supprimer les oublis et les écarts.'],
  ['03', 'Décidez avec vos vrais chiffres', 'Suivez votre chiffre d’affaires, vos services les plus rentables et la performance de votre équipe en temps réel.'],
  ['04', 'Fidélisez sans effort', 'Retrouvez l’historique de chaque client et offrez une expérience assez fluide pour donner envie de revenir.'],
]

const FEATURES = [
  ['Un parcours 100 % digital', 'De l’arrivée du client au reçu, chaque étape est enregistrée dans un espace unique et accessible.'],
  ['Une équipe alignée', 'Les rôles, les prestations et les priorités sont visibles par tous, sur mobile, tablette ou ordinateur.'],
  ['Des rapports qui parlent', 'Transformez vos opérations quotidiennes en décisions concrètes pour augmenter votre rentabilité.'],
  ['Une station prête à grandir', 'Commencez avec une station et déployez les mêmes standards sur plusieurs sites.'],
]

function DashboardPreview() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-t-[1.25rem] border border-orange-500/40 bg-[#11100f] text-left shadow-[0_-20px_90px_rgba(249,81,10,.18)]">
      <div className="flex h-10 items-center gap-6 border-b border-white/10 px-5 text-[11px] font-medium text-white/60">
        <span className="font-semibold text-white">WashGuard</span><span>Tableau de bord</span><span>Lavages</span><span>Rapports</span><span>Paramètres</span>
      </div>
      <div className="grid min-h-[330px] grid-cols-[170px_1fr]">
        <aside className="border-r border-white/10 bg-black/20 p-5">
          <p className="text-xs font-semibold text-white">Aujourd&apos;hui</p>
          <div className="mt-5 space-y-2 text-xs text-white/50"><div className="rounded-md bg-white/10 px-3 py-2 text-white">Vue d&apos;ensemble</div><div className="px-3 py-2">Nouveaux lavages</div><div className="px-3 py-2">Caisse</div><div className="px-3 py-2">Équipe</div></div>
        </aside>
        <div className="p-6"><div className="flex items-start justify-between"><div><p className="text-xs text-white/45">Bonjour, WashGuard</p><h3 className="mt-1 text-xl font-semibold text-white">Votre station en un coup d&apos;œil</h3></div><div className="rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-white">+ Nouveau lavage</div></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{[['Recette du jour','184 500 FCFA'],['Lavages réalisés','37'],['Panier moyen','4 986 FCFA']].map(([label,value])=><div key={label} className="rounded-lg border border-white/10 bg-white/[.03] p-4"><p className="text-[11px] text-white/45">{label}</p><p className="mt-2 text-lg font-semibold text-white">{value}</p><p className="mt-1 text-[10px] text-emerald-400">+12% vs hier</p></div>)}</div><div className="mt-5 rounded-lg border border-white/10 bg-white/[.02] p-4"><div className="flex justify-between text-xs text-white/60"><span>Activité de la semaine</span><span>Cette semaine</span></div><div className="mt-5 flex h-24 items-end gap-3">{[35,55,42,75,58,88,68,96,72,84,63,91].map((height,index)=><span key={index} className="flex-1 rounded-t bg-gradient-to-t from-orange-600 to-orange-300" style={{height:`${height}%`}} />)}</div></div></div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const { me } = useAuth()
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  usePageTitle('Accueil')

  return <div className="min-h-dvh overflow-x-hidden bg-[#0a0908] text-white selection:bg-orange-500/30">
    <header className="sticky top-4 z-40 mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-white/10 bg-[#121110]/90 px-4 py-3 backdrop-blur-xl sm:px-5">
      <Link to="/" aria-label="WashGuard accueil"><Brand /></Link>
      <nav className="hidden items-center gap-7 text-sm text-white/75 md:flex"><a href="#benefits" className="transition hover:text-white">La plateforme</a><a href="#testimonials" className="transition hover:text-white">Témoignages</a><a href="#team" className="transition hover:text-white">Équipe</a><a href="#contact" className="transition hover:text-white">Contact</a><a href="#faq" className="transition hover:text-white">FAQ</a></nav>
      <div className="flex items-center gap-2"><button onClick={toggle} aria-label="Changer de thème" className="hidden rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white sm:block">{theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</button><a href="https://github.com/ErwinssKoffi/LavageAuto" target="_blank" rel="noreferrer" aria-label="Voir le projet sur GitHub" className="hidden rounded-lg p-2 text-white/75 transition hover:bg-white/10 hover:text-white sm:block"><span className="text-[11px] font-bold">GH</span></a><button onClick={()=>setMenuOpen(!menuOpen)} className="rounded-lg p-2 text-white md:hidden" aria-label="Menu">{menuOpen?<X size={19}/>:<Menu size={19}/>}</button></div>
      {menuOpen && <nav className="absolute left-0 right-0 top-16 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#151311] p-5 text-sm md:hidden"><a href="#benefits" onClick={()=>setMenuOpen(false)}>La plateforme</a><a href="#testimonials" onClick={()=>setMenuOpen(false)}>Témoignages</a><a href="#team" onClick={()=>setMenuOpen(false)}>Équipe</a><a href="#contact" onClick={()=>setMenuOpen(false)}>Contact</a><a href="#faq" onClick={()=>setMenuOpen(false)}>FAQ</a></nav>}
    </header>

    <main>
      <section className="relative px-4 pb-0 pt-28 text-center sm:pt-36"><div className="pointer-events-none absolute inset-x-0 top-16 mx-auto h-96 max-w-4xl bg-[radial-gradient(ellipse_at_center,rgba(249,81,10,.18),transparent_65%)]"/><div className="relative mx-auto max-w-4xl"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.03] px-3 py-1.5 text-xs text-white/90"><span className="rounded-full bg-orange-500 px-2 py-0.5 font-semibold">Nouveau</span> Le digital au service de votre station</span><h1 className="mx-auto mt-9 max-w-4xl text-5xl font-bold leading-[.98] tracking-[-.055em] sm:text-7xl lg:text-[5.7rem]">Transformez votre station<br/>en <span className="bg-gradient-to-r from-pink-500 via-orange-500 to-orange-300 bg-clip-text text-transparent">business rentable.</span></h1><p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">WashGuard digitalise toute votre activité : accueillez plus vite, encaissez sans erreur, fidélisez vos clients et pilotez votre rentabilité depuis une seule application.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/inscription"><Button variant="primary" size="lg" icon={<ArrowRight size={16}/>}>Commencer maintenant</Button></Link><a href="#benefits" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"><Play size={15} fill="currentColor"/> Découvrir WashGuard</a></div></div><DashboardPreview/></section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center"><p className="text-xs uppercase tracking-[.22em] text-white/35">Ils construisent leur activité avec nous</p><div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-5 text-lg font-semibold text-white/25"><span>CARWASH+</span><span>AutoClean</span><span>STATION 24</span><span>WashPro</span><span>Abidjan Auto</span><span>Élite Lavage</span></div></section>

      <section id="benefits" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20"><div className="max-w-2xl"><p className="text-sm font-semibold text-orange-400">Les bénéfices</p><h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Chaque lavage mieux organisé devient une croissance mesurable.</h2><p className="mt-5 text-white/50">Laissez le papier, les messages dispersés et les approximations derrière vous. WashGuard donne à votre équipe un système simple pour mieux servir et mieux gagner.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{BENEFITS.map(([number,title,text])=><motion.article whileHover={{y:-5}} key={number} className="rounded-xl border border-white/10 bg-white/[.025] p-6 transition hover:border-orange-500/40"><span className="text-xs text-orange-400">{number}</span><h3 className="mt-12 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-white/45">{text}</p></motion.article>)}</div></section>

      <section className="mx-auto max-w-6xl px-4 py-20"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end"><div><p className="text-sm font-semibold text-orange-400">Fonctionnalités</p><h2 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Le cockpit digital de votre station.</h2><p className="mt-5 text-white/50">Un seul outil pour standardiser vos opérations, responsabiliser votre équipe et offrir une expérience client qui se remarque.</p></div><div className="grid gap-x-8 gap-y-9 sm:grid-cols-2">{FEATURES.map(([title,text])=><div key={title} className="border-t border-white/10 pt-4"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/45">{text}</p></div>)}</div></div></section>

      <section id="testimonials" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20"><div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/15 via-white/[.03] to-pink-500/10 p-8 sm:p-14"><p className="text-sm text-orange-300">Témoignages</p><blockquote className="mt-8 max-w-4xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">“Avant WashGuard, nous pilotions au feeling. Aujourd&apos;hui, nous savons combien de véhicules sont passés, ce que nous avons vendu et où agir pour faire progresser la station.”</blockquote><p className="mt-8 text-sm text-white/55">Aïcha K. · Gérante, station automobile à Abidjan</p></div></section>

      <section id="team" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 text-center"><p className="text-sm font-semibold text-orange-400">L&apos;équipe</p><h2 className="mt-3 text-4xl font-bold tracking-tight">Pensé avec le terrain.</h2><p className="mx-auto mt-4 max-w-xl text-white/50">Nous construisons des outils simples pour les équipes qui font avancer les stations chaque jour.</p><div className="mt-10 flex justify-center gap-4"><div className="rounded-xl border border-white/10 bg-white/[.03] px-6 py-5"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-pink-500 font-bold">WG</div><p className="mt-3 text-sm font-semibold">L&apos;équipe WashGuard</p><p className="mt-1 text-xs text-white/45">Produit · Design · Terrain</p></div></div></section>

      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-20"><div className="text-center"><p className="text-sm font-semibold text-orange-400">FAQ</p><h2 className="mt-3 text-4xl font-bold">Les réponses avant de vous lancer.</h2></div><div className="mt-10 divide-y divide-white/10 border-y border-white/10">{['Puis-je essayer WashGuard gratuitement ?','Est-ce adapté à une petite station ?','Mes données sont-elles sécurisées ?','Puis-je utiliser l’application sur mobile ?'].map((question,index)=><div key={question}><button onClick={()=>setOpenFaq(openFaq===index?null:index)} className="flex w-full items-center justify-between py-5 text-left text-sm font-medium"><span>{question}</span><ChevronDown size={17} className={openFaq===index?'rotate-180 text-orange-400':'text-white/40'}/></button>{openFaq===index&&<p className="pb-5 text-sm leading-6 text-white/50">Oui. WashGuard est conçu pour démarrer simplement, sans bouleverser vos habitudes : vous créez votre espace, configurez vos prestations et votre équipe peut commencer à enregistrer les lavages immédiatement.</p>}</div>)}</div></section>

      <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20"><div className="relative overflow-hidden rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-pink-500/10 px-6 py-16 text-center sm:px-10"><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,150,80,.25),transparent_55%)]"/><div className="relative"><h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Votre prochaine journée de lavage peut commencer autrement.</h2><p className="mx-auto mt-4 max-w-xl text-white/55">Passez d&apos;une gestion dispersée à une station pilotée par la donnée. Créez votre espace WashGuard et prenez le contrôle de votre activité.</p><Link to={me?'/tableau-de-bord':'/inscription'} className="mt-8 inline-flex"><Button variant="primary" size="lg" icon={<ArrowRight size={16}/>}>{me?'Accéder à mon espace':'Créer mon espace'}</Button></Link></div></div></section>
    </main>

    <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-4 py-8 text-xs text-white/40"><Brand size="sm"/><p>WashGuard — la gestion simple des stations de lavage.</p><div className="flex items-center gap-4"><span className="inline-flex items-center gap-1.5"><Check size={13} className="text-emerald-400"/> Fait pour le terrain</span><span>© 2026</span></div></footer>
  </div>
}

