import Link from 'next/link'
import { Compass, Dna, FlaskConical, ArrowUpRight } from 'lucide-react'

const C = {
  ink: '#1A2417', muted: '#6b7280', faint: '#8A9284', line: '#ECEBE3', card: '#FFFFFF',
  green: '#538A22', greenDeep: '#2F5214', greenSoft: '#F2F9EC', greenBorder: '#C8E9A8',
}

// The platform's home — one CLP account, several separate clinical tools.
// Each tile owns its own data today (CLP Compass and MicrobiomeRX have
// separate patient records, only manually linkable via the MicrobiomeRX
// tab on a CLP Compass patient's page — see MicrobiomeLinkTab.tsx). This
// page is just a launcher, not an integration layer.
const TOOLS = [
  {
    key: 'compass',
    name: 'CLP Compass',
    tagline: 'Coaching plans & patient dashboards',
    description: 'Run sessions, generate personalised wellness roadmaps, and share a live dashboard with every patient.',
    icon: Compass,
    href: '/patients',
    external: false,
    status: 'live' as const,
  },
  {
    key: 'microbiomerx',
    name: 'MicrobiomeRX',
    tagline: 'Gut microbiome report analysis',
    description: 'Upload a BugSpeaks report, get a full clinical breakdown and an AIC supplement protocol. Opens as a separate app.',
    icon: Dna,
    href: 'https://microbiomerx.vercel.app',
    external: true,
    status: 'live' as const,
  },
  {
    key: 'blood',
    name: 'Blood Report Analyzer',
    tagline: 'Blood panel analysis',
    description: 'Structured findings and recommendations from a patient’s blood work.',
    icon: FlaskConical,
    href: null,
    external: false,
    status: 'soon' as const,
  },
]

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Clinic Living Plus
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: C.ink, margin: 0, letterSpacing: '-0.02em' }}>Choose a tool</h1>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>One platform, every patient analysis.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const soon = tool.status === 'soon'
          const content = (
            <div
              style={{
                background: C.card,
                border: `1px solid ${C.line}`,
                borderRadius: 16,
                padding: '22px 22px 20px',
                height: '100%',
                boxSizing: 'border-box',
                boxShadow: soon ? 'none' : '0 1px 3px rgba(26,36,23,0.04)',
                opacity: soon ? 0.6 : 1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.greenSoft, border: `1px solid ${C.greenBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={21} color={C.greenDeep} />
                </div>
                {soon ? (
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: C.faint, background: '#F1F0EB', borderRadius: 20, padding: '3px 9px' }}>Coming soon</span>
                ) : tool.external ? (
                  <ArrowUpRight size={16} color={C.faint} />
                ) : null}
              </div>
              <div style={{ fontSize: 16.5, fontWeight: 700, color: C.ink }}>{tool.name}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.greenDeep, marginTop: 2 }}>{tool.tagline}</div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginTop: 10, marginBottom: 0, flex: 1 }}>{tool.description}</p>
            </div>
          )
          if (soon || !tool.href) {
            return <div key={tool.key} style={{ cursor: 'not-allowed' }}>{content}</div>
          }
          if (tool.external) {
            return (
              <a key={tool.key} href={tool.href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                {content}
              </a>
            )
          }
          return (
            <Link key={tool.key} href={tool.href} style={{ textDecoration: 'none' }}>
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
