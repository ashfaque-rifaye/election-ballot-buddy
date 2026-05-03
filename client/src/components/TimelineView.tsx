/**
 * Timeline View - Indian Election Process
 * Built with Google Antigravity & Vertex AI
 */
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
interface Phase { id: string; icon: string; name: string; nameHi: string; date: string; duration: string; description: string; details: string[]; color: string; status: 'completed' | 'active' | 'upcoming'; }
interface StateData { name: string; seats: number; lastElection: string; nextDue: string; ceoUrl: string; phases: Phase[]; }

const S: Record<string, StateData> = {
  national: { name: 'Lok Sabha 2024 (18th)', seats: 543, lastElection: 'Apr-Jun 2024', nextDue: '2029', ceoUrl: 'eci.gov.in', phases: [
    { id:'a1', icon:'', name:'Election Announced', nameHi:'Election Announced', date:'16 Mar 2024', duration:'Day 1', description:'CEC Rajiv Kumar announced 7-phase Lok Sabha elections. MCC activated.', details:['96.88 crore eligible voters','10.5 lakh polling stations','7 phases: 19 Apr to 1 Jun','MCC from 16 Mar 2024','15 lakh+ polling personnel'], color:'#FF9933', status:'completed' },
    { id:'a2', icon:'', name:'Nominations', nameHi:'Nominations', date:'20 Mar - 3 May 2024', duration:'Phase-wise', description:'Phase-wise nomination filing. Rs 25,000 deposit. Affidavit mandatory.', details:['Phase-wise deadlines','Rs 25,000 deposit (Rs 12,500 SC/ST)','Criminal record disclosure mandatory','Scrutiny within 3 days','8,360 candidates contested'], color:'#4285F4', status:'completed' },
    { id:'a3', icon:'', name:'Campaigning', nameHi:'Campaigning', date:'Mar - May 2024', duration:'~2 months', description:'Intense nationwide campaigning. Rs 95 lakh expenditure limit. 48hr silence before each phase.', details:['Rs 95 lakh limit per LS candidate','135+ MCC violations reported','Social media monitoring by ECI','Door-to-door rallies roadshows','Campaign silence 48hrs before each phase'], color:'#FBBC04', status:'completed' },
    { id:'a4', icon:'', name:'Polling (7 Phases)', nameHi:'Polling', date:'19 Apr - 1 Jun 2024', duration:'44 days', description:'Voting in 7 phases across 543 seats. EVM+VVPAT. Overall turnout: 65.79%.', details:['Phase 1: 19 Apr - 102 seats','Phase 2: 26 Apr - 89 seats','Phase 3: 7 May - 94 seats','Phase 4: 13 May - 96 seats','Phase 5: 20 May - 49 seats','Phase 6: 25 May - 57 seats','Phase 7: 1 Jun - 57 seats','Turnout: 65.79%'], color:'#34A853', status:'completed' },
    { id:'a5', icon:'', name:'Counting Day', nameHi:'Counting', date:'4 Jun 2024', duration:'1 day', description:'Simultaneous counting across 543 constituencies.', details:['Counting from 8 AM','Postal ballots counted first','VVPAT: 5 random booths per constituency','Real-time results on eci.gov.in'], color:'#EA4335', status:'completed' },
    { id:'a6', icon:'', name:'Results Declared', nameHi:'Results', date:'4 Jun 2024', duration:'Final', description:'NDA: 293 seats (BJP 240). INDIA bloc: 234 seats (INC 99). PM Modi sworn in 9 Jun 2024.', details:['NDA: 293 (BJP 240, TDP 16, JDU 12)','INDIA: 234 (INC 99, SP 37, TMC 29)','Others: 16 seats','PM sworn in: 9 Jun 2024','Next LS election: 2029'], color:'#9C27B0', status:'completed' },
  ]},
  'tamil-nadu': { name: 'Tamil Nadu Assembly', seats: 234, lastElection: 'Apr 2021', nextDue: 'Apr-May 2026', ceoUrl: 'elections.tn.gov.in', phases: [
    { id:'t1', icon:'', name:'Expected Announcement', nameHi:'Announcement', date:'Feb-Mar 2026', duration:'Expected', description:'ECI to announce TN Vidhan Sabha elections. DMK govt term ends May 2026.', details:['234 assembly constituencies','39 Lok Sabha seats','Current CM: M.K. Stalin (DMK)','Single-phase polling expected','CEO: elections.tn.gov.in'], color:'#FF9933', status:'upcoming' },
    { id:'t2', icon:'', name:'Campaign Period', nameHi:'Campaign', date:'Mar-Apr 2026', duration:'~4 weeks', description:'Key parties: DMK, AIADMK, BJP, PMK. Rs 40 lakh expenditure limit.', details:['DMK vs AIADMK primary contest','BJP expanding presence','Rs 40 lakh limit per candidate','Dravidian politics dominates'], color:'#FBBC04', status:'upcoming' },
    { id:'t3', icon:'', name:'Polling Day', nameHi:'Polling', date:'Apr 2026 (Expected)', duration:'Single phase', description:'Single-phase polling for all 234 seats. ~6.3 crore voters.', details:['~6.3 crore eligible voters','Single phase typical for TN','EVM + VVPAT','7 AM to 6 PM'], color:'#34A853', status:'upcoming' },
    { id:'t4', icon:'', name:'Results', nameHi:'Results', date:'May 2026', duration:'Final', description:'Counting and results. New government formation.', details:['Counting 3 days after polling','Results same day'], color:'#9C27B0', status:'upcoming' },
  ]},
  bihar: { name: 'Bihar Assembly', seats: 243, lastElection: 'Oct-Nov 2020', nextDue: 'Oct-Nov 2025', ceoUrl: 'ceobihar.nic.in', phases: [
    { id:'b1', icon:'', name:'Expected Announcement', nameHi:'Announcement', date:'Aug-Sep 2025', duration:'Expected', description:'Bihar Vidhan Sabha elections due late 2025. NDA govt term ends Nov 2025.', details:['243 assembly constituencies','40 Lok Sabha seats','Current CM: Nitish Kumar (JDU/NDA)','Typically 3-phase polling','CEO: ceobihar.nic.in'], color:'#FF9933', status:'active' },
    { id:'b2', icon:'', name:'Campaign Period', nameHi:'Campaign', date:'Sep-Oct 2025', duration:'~6 weeks', description:'Key parties: JDU, RJD, BJP, Congress. Caste dynamics significant.', details:['JDU-BJP vs RJD-Congress','Caste equations crucial','Rs 40 lakh limit per candidate'], color:'#FBBC04', status:'upcoming' },
    { id:'b3', icon:'', name:'Polling (3 Phases Expected)', nameHi:'Polling', date:'Oct-Nov 2025', duration:'Multi-phase', description:'Multi-phase polling across 243 seats. ~7.3 crore voters.', details:['~7.3 crore eligible voters','Typically 3 phases','Heavy security deployment','EVM + VVPAT'], color:'#34A853', status:'upcoming' },
    { id:'b4', icon:'', name:'Results', nameHi:'Results', date:'Nov 2025', duration:'Final', description:'Counting and new Bihar government formation.', details:['Results same day as counting','Government formation within days'], color:'#9C27B0', status:'upcoming' },
  ]},
  kerala: { name: 'Kerala Assembly', seats: 140, lastElection: 'Apr 2021', nextDue: 'Apr-May 2026', ceoUrl: 'ceo.kerala.gov.in', phases: [
    { id:'k1', icon:'', name:'Expected Announcement', nameHi:'Announcement', date:'Feb-Mar 2026', duration:'Expected', description:'Kerala Vidhan Sabha elections due 2026. LDF govt term ends May 2026.', details:['140 assembly constituencies','20 Lok Sabha seats','Current CM: Pinarayi Vijayan (LDF)','Single-phase polling','CEO: ceo.kerala.gov.in'], color:'#FF9933', status:'upcoming' },
    { id:'k2', icon:'', name:'Polling Day', nameHi:'Polling', date:'Apr 2026', duration:'Single phase', description:'Single-phase polling. Kerala has ~77% avg turnout.', details:['~2.7 crore eligible voters','LDF vs UDF vs NDA','Single phase','~77% historical turnout'], color:'#34A853', status:'upcoming' },
    { id:'k3', icon:'', name:'Results', nameHi:'Results', date:'May 2026', duration:'Final', description:'Kerala historically alternates between LDF and UDF.', details:['Anti-incumbency trend historically','LDF broke trend in 2021'], color:'#9C27B0', status:'upcoming' },
  ]},
};
const OPT = [{key:'national',label:'Lok Sabha 2024'},{key:'tamil-nadu',label:'Tamil Nadu'},{key:'bihar',label:'Bihar'},{key:'kerala',label:'Kerala'}];

export default function TimelineView() {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sel, setSel] = useState('national');
  const [exp, setExp] = useState<string | null>(null);
  const d = S[sel] || S.national;
  const done = d.phases.filter(p => p.status === 'completed').length;
  const act = d.phases.filter(p => p.status === 'active').length;
  const pct = Math.round(((done + act * 0.5) / d.phases.length) * 100);
  return (
    <div role="main" style={{ minHeight: '100vh', backgroundColor: 'var(--surface-dim)' }}>
      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 24px', backgroundColor:'var(--header-bg)', borderBottom:'1px solid var(--outline)', position:'relative' }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', display:'flex' }}><div style={{ flex:1, backgroundColor:'#FF9933' }}/><div style={{ flex:1, backgroundColor:'#FFF' }}/><div style={{ flex:1, backgroundColor:'#138808' }}/></div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <a href="/chat" style={{ color:'var(--on-surface-secondary)', textDecoration:'none', fontSize:'1.2rem' }}>&larr;</a>
          <div><h1 style={{ margin:0, fontSize:'1.05rem', fontWeight:700, color:'var(--on-surface)' }}>Election Timeline</h1><p style={{ margin:0, fontSize:'0.7rem', color:'var(--on-surface-tertiary)' }}>Accurate data from ECI</p></div>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={toggleTheme} style={{ background:'none', border:'1px solid var(--outline)', borderRadius:'8px', padding:'6px 10px', cursor:'pointer', color:'var(--on-surface-secondary)' }}>{theme==='light'?'Dark':'Light'}</button>
          <button onClick={signOut} style={{ backgroundColor:'transparent', color:'var(--on-surface-secondary)', border:'1px solid var(--outline)', borderRadius:'8px', padding:'6px 12px', cursor:'pointer', fontSize:'0.8rem', fontWeight:500 }}>Sign Out</button>
        </div>
      </header>
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'24px 20px' }}>
        <div style={{ marginBottom:'20px' }}>
          <label style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--on-surface-secondary)', display:'block', marginBottom:'6px' }}>Select Election</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {OPT.map(o=><button key={o.key} onClick={()=>{setSel(o.key);setExp(null);}} style={{ padding:'8px 16px', borderRadius:'20px', border:sel===o.key?'2px solid var(--primary)':'1px solid var(--outline)', backgroundColor:sel===o.key?'var(--primary-light)':'var(--surface-card)', color:sel===o.key?'var(--primary)':'var(--on-surface-secondary)', cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>{o.label}</button>)}
          </div>
        </div>
        <div style={{ backgroundColor:'var(--surface-card)', borderRadius:'16px', padding:'20px 24px', marginBottom:'20px', border:'1px solid var(--outline)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>
            <div>
              <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--on-surface)', margin:0 }}>{d.name}</h2>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'8px' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--on-surface-tertiary)', backgroundColor:'var(--surface-dim)', padding:'3px 10px', borderRadius:'12px' }}>{d.seats} seats</span>
                <span style={{ fontSize:'0.75rem', color:'var(--on-surface-tertiary)', backgroundColor:'var(--surface-dim)', padding:'3px 10px', borderRadius:'12px' }}>Last: {d.lastElection}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--primary)', backgroundColor:'var(--primary-light)', padding:'3px 10px', borderRadius:'12px', fontWeight:600 }}>Next: {d.nextDue}</span>
              </div>
              <a href={'https://'+d.ceoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:'0.75rem', color:'var(--primary)', marginTop:'6px', display:'inline-block' }}>{d.ceoUrl}</a>
            </div>
            <div style={{ textAlign:'right' }}><span style={{ fontSize:'1.8rem', fontWeight:700, color:'var(--primary)' }}>{pct}%</span><p style={{ fontSize:'0.7rem', color:'var(--on-surface-tertiary)', margin:0 }}>{done}/{d.phases.length} done</p></div>
          </div>
          <div style={{ height:'8px', backgroundColor:'var(--outline)', borderRadius:'4px', overflow:'hidden', marginTop:'16px' }} role="progressbar"><div style={{ height:'100%', width:pct+'%', background:'linear-gradient(90deg,#FF9933,#138808)', borderRadius:'4px', transition:'width 0.5s ease' }}/></div>
        </div>
        {d.phases.some(p=>p.status==='upcoming')&&<div style={{ backgroundColor:'var(--primary-light)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', border:'1px solid var(--outline)', fontSize:'0.8rem', color:'var(--on-surface-secondary)' }}>Dates marked Expected are estimates. Check eci.gov.in for confirmed schedules.</div>}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {d.phases.map((p,i)=>{const open=exp===p.id;return(
            <div key={p.id} style={{ animation:'fadeIn 0.3s ease-out '+(i*0.05)+'s both' }}>
              <div style={{ backgroundColor:'var(--surface-card)', borderRadius:'14px', border:'1px solid '+(p.status==='active'?p.color:'var(--outline)'), overflow:'hidden' }}>
                <button onClick={()=>setExp(open?null:p.id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px', border:'none', cursor:'pointer', backgroundColor:'transparent', textAlign:'left' }}>
                  <div style={{ width:'34px', height:'34px', borderRadius:'50%', flexShrink:0, backgroundColor:p.status!=='upcoming'?p.color:'var(--outline)', color:p.status!=='upcoming'?'#fff':'var(--on-surface-tertiary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700 }}>{p.status==='completed'?'\u2713':String(i+1)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'0.9rem', fontWeight:600, color:'var(--on-surface)' }}>{p.name}</span>
                      {p.status==='active'&&<span style={{ fontSize:'0.6rem', fontWeight:700, backgroundColor:p.color, color:'#fff', padding:'2px 8px', borderRadius:'10px' }}>CURRENT</span>}
                      {p.status==='completed'&&<span style={{ fontSize:'0.6rem', fontWeight:600, color:'var(--accent)', backgroundColor:'var(--accent-light)', padding:'2px 8px', borderRadius:'10px' }}>Done</span>}
                    </div>
                    <p style={{ fontSize:'0.72rem', color:'var(--on-surface-tertiary)', margin:'2px 0 0' }}>{p.nameHi} | {p.date} | {p.duration}</p>
                  </div>
                  <span style={{ fontSize:'0.75rem', color:'var(--on-surface-tertiary)', transform:open?'rotate(180deg)':'rotate(0deg)', flexShrink:0 }}>&darr;</span>
                </button>
                {open&&<div style={{ padding:'0 18px 16px' }}><div style={{ borderTop:'1px solid var(--outline)', paddingTop:'12px' }}><p style={{ fontSize:'0.85rem', color:'var(--on-surface-secondary)', lineHeight:1.7, marginBottom:'12px' }}>{p.description}</p><div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>{p.details.map((dd,di)=><div key={di} style={{ display:'flex', gap:'8px' }}><span style={{ width:'18px', height:'18px', borderRadius:'50%', backgroundColor:'var(--primary-light)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', fontWeight:700, flexShrink:0 }}>{di+1}</span><span style={{ fontSize:'0.8rem', color:'var(--on-surface-secondary)', lineHeight:1.5 }}>{dd}</span></div>)}</div></div></div>}
              </div>
            </div>
          );})}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'10px', marginTop:'24px' }}>
          {[{t:'ECI Helpline',v:'1950'},{t:'Voter Portal',v:'voters.eci.gov.in'},{t:'Voter App',v:'Play Store / App Store'},{t:'NVSP',v:'nvsp.in'}].map(c=><div key={c.t} style={{ backgroundColor:'var(--surface-card)', borderRadius:'12px', padding:'14px', border:'1px solid var(--outline)' }}><h3 style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--on-surface)', margin:'0 0 2px' }}>{c.t}</h3><p style={{ fontSize:'0.85rem', fontWeight:700, color:'var(--primary)', margin:0 }}>{c.v}</p></div>)}
        </div>
      </div>
    </div>
  );
}
