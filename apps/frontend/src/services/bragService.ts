import type { Board, User } from '../types';

export type BragTone = 'polished' | 'yc-parody' | 'chaotic' | 'deadpan' | 'cinematic';
export type AspectRatio = 'landscape' | 'vertical' | 'square';

export interface BragBeat {
  id: number;
  label: string;
  name: string;
  headline: string;
  subtitle: string;
  badge: string;
  meta: string;
  durationSec: number;
}

export interface BragDeliverables {
  xPost: string;
  linkedInPost: string;
  slackChangelog: string;
  markdownBadge: string;
  markdownPlan: string;
}

export interface BragPlan {
  tone: BragTone;
  beats: BragBeat[];
  deliverables: BragDeliverables;
  stats: {
    shippedCount: number;
    totalCards: number;
    shippedTitles: string[];
    syncLatencyMs: number;
    audioAssetBytes: number;
    teamMembersCount: number;
  };
}

export const TONE_METADATA: Record<
  BragTone,
  { label: string; tag: string; description: string; emoji: string; themeColor: string }
> = {
  polished: {
    label: 'Polished',
    tag: 'Craft & Restraint',
    description: 'Minimalist luxury. Linear-grade typography, quiet confidence, and zero noise.',
    emoji: '✨',
    themeColor: '#0f38d9',
  },
  'yc-parody': {
    label: 'YC Parody',
    tag: 'Deadpan Founder',
    description: 'States ambitious claims with absolute sincerity. The absurdity is the product.',
    emoji: '💼',
    themeColor: '#f97316',
  },
  chaotic: {
    label: 'Chaotic',
    tag: 'High Velocity Blitz',
    description: 'ALL CAPS. Metric dumps. 800 WPM pacing. Maximum unhinged momentum.',
    emoji: '⚡',
    themeColor: '#e11d48',
  },
  deadpan: {
    label: 'Deadpan',
    tag: 'Anti-Hype Engineer',
    description: 'Zero adjectives. Pure technical facts. We moved cards from left to right.',
    emoji: '🛠️',
    themeColor: '#475569',
  },
  cinematic: {
    label: 'Cinematic',
    tag: 'Widescreen Trailer',
    description: 'Dramatic lighting, epic narrative stakes, and theatrical reveals.',
    emoji: '🎬',
    themeColor: '#8b5cf6',
  },
};

export function generateBragPlan(
  board: Board | null,
  currentUser: User,
  tone: BragTone
): BragPlan {
  const cards = board?.cards || [];
  const sections = board?.sections || [];
  
  const doneSection = sections.find((s) => s.title.toLowerCase().includes('done'));
  const doneSectionId = doneSection?.id;
  
  const shippedCards = cards.filter((c) => c.sectionId === doneSectionId);
  const shippedCount = shippedCards.length;
  const totalCards = cards.length;
  const shippedTitles = shippedCards.map((c) => c.title);
  
  const topShipped = shippedTitles.length > 0 
    ? shippedTitles.slice(0, 3).join(', ')
    : 'Sub-12ms peer sync, Centered Command Dossier, Synthetic audio engine';

  const teamMembers = new Set(cards.flatMap((c) => c.assignees.map((a) => a.name)));
  teamMembers.add(currentUser.name);
  const teamMembersCount = teamMembers.size;

  const stats = {
    shippedCount: shippedCount > 0 ? shippedCount : 4,
    totalCards: totalCards > 0 ? totalCards : 8,
    shippedTitles: shippedTitles.length > 0 ? shippedTitles : [
      'Centered Command Dossier with J/K Traversal',
      'Synthesized Web Audio Mechanical Sound Engine',
      'Optimistic Multi-Tab Peer Synchronization',
      'Tactile ObsidianUI Keycaps & Ghost Dropzones',
    ],
    syncLatencyMs: 11,
    audioAssetBytes: 0,
    teamMembersCount,
  };

  // 1. BEATS GENERATION (Authentic 5-beat brag storytelling structure)
  let beats: BragBeat[] = [];

  switch (tone) {
    case 'polished':
      beats = [
        {
          id: 1,
          label: '01. The Hook',
          name: 'The Problem with Noise',
          headline: 'Task boards were not broken.',
          subtitle: 'They were simply too loud.',
          badge: 'CRAFT OVER CLUTTER',
          meta: '3.5s • Scene 1',
          durationSec: 3.5,
        },
        {
          id: 2,
          label: '02. The Turn',
          name: 'Restraint as Principle',
          headline: 'Vecta is an architectural drafting canvas.',
          subtitle: 'Zero slide drawers. Zero layout thrash. Pure spatial clarity.',
          badge: 'DESIGN DISCIPLINE',
          meta: '4.0s • Scene 2',
          durationSec: 4.0,
        },
        {
          id: 3,
          label: '03. Feature Demonstration',
          name: 'The Centered Dossier',
          headline: 'Navigate at the speed of thought.',
          subtitle: 'Press J & K to traverse issues. Audio feedback synthesized in Web Audio with 0KB overhead.',
          badge: 'KEYBOARD NATIVE',
          meta: '4.5s • Scene 3',
          durationSec: 4.5,
        },
        {
          id: 4,
          label: '04. Telemetry Proof',
          name: 'Sprint Shipped',
          headline: `${stats.shippedCount} deliverables shipped to production.`,
          subtitle: `<${stats.syncLatencyMs}ms peer synchronization across ${teamMembersCount} teammates.`,
          badge: 'VERIFIED METRICS',
          meta: '4.0s • Scene 4',
          durationSec: 4.0,
        },
        {
          id: 5,
          label: '05. Outro & Call',
          name: 'Ship with Taste',
          headline: 'Vecta / Project Board',
          subtitle: 'The architectural workbench for teams who ship software.',
          badge: 'YOU BUILT IT. NOW BRAG.',
          meta: '4.0s • Scene 5',
          durationSec: 4.0,
        },
      ];
      break;

    case 'yc-parody':
      beats = [
        {
          id: 1,
          label: '01. The Hook',
          name: 'The Macro Paradox',
          headline: 'Every day, engineers move cards across columns.',
          subtitle: 'But who engineers the cards?',
          badge: 'THE STATUS QUO IS OBSOLETE',
          meta: '3.5s • Scene 1',
          durationSec: 3.5,
        },
        {
          id: 2,
          label: '02. The Turn',
          name: 'Autonomous Substrate',
          headline: 'Introducing Vecta.',
          subtitle: 'The post-Jira autonomous workflow substrate for high-conviction founders.',
          badge: 'SERIES A VELOCITY',
          meta: '4.0s • Scene 2',
          durationSec: 4.0,
        },
        {
          id: 3,
          label: '03. Feature Demonstration',
          name: 'Haptic Dossier Matrix',
          headline: 'Proprietary J/K keyboard traversal.',
          subtitle: 'Acoustic haptic confirmation via real-time algorithmic sine oscillators.',
          badge: 'PATENT-PENDING UX',
          meta: '4.5s • Scene 3',
          durationSec: 4.5,
        },
        {
          id: 4,
          label: '04. Telemetry Proof',
          name: 'Traction Vector',
          headline: `${stats.shippedCount} tickets executed with 100% velocity.`,
          subtitle: 'Zero external audio assets. Infinite developer satisfaction.',
          badge: 'HYPER-GROWTH',
          meta: '4.0s • Scene 4',
          durationSec: 4.0,
        },
        {
          id: 5,
          label: '05. Outro & Call',
          name: 'The Mission',
          headline: 'Vecta: Shipping software for people who ship software.',
          subtitle: 'Apply for private beta access at vecta.io',
          badge: 'NOW LIVE',
          meta: '4.0s • Scene 5',
          durationSec: 4.0,
        },
      ];
      break;

    case 'chaotic':
      beats = [
        {
          id: 1,
          label: '01. The Hook',
          name: 'RAGE AGAINST JIRA',
          headline: 'STOP CLICKING 47 BUTTONS TO CLOSE ONE SPRINT.',
          subtitle: 'MODAL HELL IS OVER. SLIDE DRAWERS ARE CANCELLED.',
          badge: 'MAXIMUM VOLTAGE',
          meta: '3.0s • Scene 1',
          durationSec: 3.0,
        },
        {
          id: 2,
          label: '02. The Turn',
          name: 'THE SPEED RUN',
          headline: 'WE BUILT VECTA AT 3:00 AM ON PURE ESPRESSO.',
          subtitle: 'CENTERED COMMAND DOSSIER. TACTILE KEYCAPS. ZERO FLUFF.',
          badge: 'PURE UNHINGED SPEED',
          meta: '3.5s • Scene 2',
          durationSec: 3.5,
        },
        {
          id: 3,
          label: '03. Feature Demonstration',
          name: 'J/K WARP DRIVE',
          headline: 'TRAVERSE TICKETS AT 800 WPM.',
          subtitle: 'SYNTHESIZED MECHANICAL BASS CLICKS IN JAVASCRIPT. NO MP3S.',
          badge: 'KEYBOARD OVERDRIVE',
          meta: '4.0s • Scene 3',
          durationSec: 4.0,
        },
        {
          id: 4,
          label: '04. Telemetry Proof',
          name: 'BACKLOG ANNIHILATED',
          headline: `${stats.shippedCount} CARDS BLASTED INTO DONE.`,
          subtitle: `${stats.syncLatencyMs}MS PEER SYNC. ZERO DROPPED FRAMES. SHIPPED.`,
          badge: '100% SPRINT VELOCITY',
          meta: '3.5s • Scene 4',
          durationSec: 3.5,
        },
        {
          id: 5,
          label: '05. Outro & Call',
          name: 'NOW BRAG',
          headline: 'YOU BUILT IT. NOW BRAG.',
          subtitle: 'VECTA.DEV • GO TELL THE INTERNET WHAT YOU SHIPPED.',
          badge: 'LET THEM TALK',
          meta: '3.5s • Scene 5',
          durationSec: 3.5,
        },
      ];
      break;

    case 'deadpan':
      beats = [
        {
          id: 1,
          label: '01. The Hook',
          name: 'The Situation',
          headline: 'We had tasks on the left column.',
          subtitle: 'We wanted them on the right column.',
          badge: 'INITIAL STATE',
          meta: '3.5s • Scene 1',
          durationSec: 3.5,
        },
        {
          id: 2,
          label: '02. The Turn',
          name: 'The Solution',
          headline: 'Now they are on the right.',
          subtitle: 'We call the right column "Done".',
          badge: 'EXPECTED OUTCOME',
          meta: '3.5s • Scene 2',
          durationSec: 3.5,
        },
        {
          id: 3,
          label: '03. Feature Demonstration',
          name: 'Implementation Details',
          headline: 'We replaced slide drawers with centered dossiers.',
          subtitle: 'Web Audio API synthesizes clicks at 800Hz. Total external sound bundle: 0 bytes.',
          badge: 'SPECIFICATION MET',
          meta: '4.0s • Scene 3',
          durationSec: 4.0,
        },
        {
          id: 4,
          label: '04. Telemetry Proof',
          name: 'Empirical Results',
          headline: `${stats.shippedCount} cards verified in Done.`,
          subtitle: `Average network broadcast latency: ${stats.syncLatencyMs}ms. Local optimistic mutation: 0ms.`,
          badge: 'DATA SHEET',
          meta: '4.0s • Scene 4',
          durationSec: 4.0,
        },
        {
          id: 5,
          label: '05. Outro & Call',
          name: 'Conclusion',
          headline: 'Vecta.',
          subtitle: 'It organizes work. That is all.',
          badge: 'RELEASE COMPLETE',
          meta: '3.5s • Scene 5',
          durationSec: 3.5,
        },
      ];
      break;

    case 'cinematic':
      beats = [
        {
          id: 1,
          label: '01. The Hook',
          name: 'The Darkness',
          headline: 'In a world drowning in bloatware and loading spinners...',
          subtitle: 'Teams lost their focus to 80-megabyte web applications.',
          badge: 'PROLOGUE',
          meta: '4.0s • Scene 1',
          durationSec: 4.0,
        },
        {
          id: 2,
          label: '02. The Turn',
          name: 'The Awakening',
          headline: 'One workbench was forged to cut through the noise.',
          subtitle: 'Engineered with warm cream architectural canvas and obsidian ink.',
          badge: 'ACT I: THE CANVAS',
          meta: '4.0s • Scene 2',
          durationSec: 4.0,
        },
        {
          id: 3,
          label: '03. Feature Demonstration',
          name: 'The Weaponry',
          headline: 'The Centered Command Dossier.',
          subtitle: 'Instant J/K traversal. Synthetic tactile acoustics. Magnetic ghost dropzones.',
          badge: 'ACT II: THE DOSSIER',
          meta: '4.5s • Scene 3',
          durationSec: 4.5,
        },
        {
          id: 4,
          label: '04. Telemetry Proof',
          name: 'The Triumph',
          headline: `${stats.shippedCount} deliverables delivered into history.`,
          subtitle: `Sub-${stats.syncLatencyMs}ms peer synchronization. A new benchmark for craft.`,
          badge: 'ACT III: THE VICTORY',
          meta: '4.0s • Scene 4',
          durationSec: 4.0,
        },
        {
          id: 5,
          label: '05. Outro & Call',
          name: 'The Epilogue',
          headline: 'Vecta.',
          subtitle: 'Crafted for builders. Powered by /brag.',
          badge: 'SHIPPED GLOBALLY',
          meta: '4.0s • Scene 5',
          durationSec: 4.0,
        },
      ];
      break;
  }

  // 2. DELIVERABLES GENERATION (Social share copy formatted for X, LinkedIn, Slack, Markdown)
  let xPost = '';
  let linkedInPost = '';
  let slackChangelog = '';

  switch (tone) {
    case 'polished':
      xPost = `Just shipped our sprint with @vecta_io.\n\nNo slide drawers. No bloated modals.\n• Centered Command Dossier (J/K traversal)\n• Synthesized Web Audio clicks (0KB audio assets)\n• Sub-12ms optimistic peer sync\n• ${stats.shippedCount} deliverables in Done\n\nYou built it. Now brag.\nhttps://vecta.dev #buildinpublic #craft`;
      linkedInPost = `Craft and restraint in modern engineering tooling:\n\nOver the past sprint, our team shipped ${stats.shippedCount} critical deliverables on Vecta (${stats.shippedTitles.slice(0, 3).join(', ')}).\n\nKey architectural decisions we made:\n1. Replaced peripheral slide-out drawers with Centered Command Dossiers with J/K keyboard traversal.\n2. Eliminated external audio asset downloads by synthesizing mechanical clicks and chimes using the browser Web Audio API.\n3. Optimistic local state mutations backed by sub-12ms peer synchronization.\n\nSoftware built with taste deserves a launch that honors the craft.\n\n#SoftwareEngineering #ProductDesign #WebPerformance #Vecta`;
      slackChangelog = `:rocket: *Sprint Release Announcement: Shipped with Vecta*\n\nTeam, we just wrapped up our sprint!\n\n*Deliverables Shipped to Done:* (${stats.shippedCount} total)\n${stats.shippedTitles.map((t) => `• ${t}`).join('\n')}\n\n*Telemetry:*\n• Peer Sync Latency: <${stats.syncLatencyMs}ms\n• Keyboard Traversal: J / K enabled\n• Zero audio bundle overhead (100% Web Audio synthesized)\n\nCheck out the board showcase with \`/brag\`: https://vecta.dev`;
      break;

    case 'yc-parody':
      xPost = `Excited to announce our latest milestone on @vecta_io:\n\nEvery day, engineers move cards across columns. But who engineers the cards?\n\nToday we shipped our entire sprint:\n- ${stats.shippedCount} deliverables deployed\n- 0 external audio bytes loaded\n- Autonomous J/K dossier traversal\n\nWe're just getting started. https://vecta.dev`;
      linkedInPost = `I'm thrilled to announce our milestone launch.\n\nThe future of work isn't about managing tickets. It's about building high-conviction momentum.\n\nUsing Vecta, our engineering unit delivered ${stats.shippedCount} mission-critical assets at 100% sprint velocity with sub-12ms multi-tab synchronization.\n\nSpecial thanks to the team for relentless execution.\n\n#Leadership #HighConviction #Startup #Vecta`;
      slackChangelog = `:briefcase: *MILESTONE REACHED: SPRINT DELIVERED*\n\nTeam,\n\nWe have executed ${stats.shippedCount} tickets into Done:\n${stats.shippedTitles.map((t) => `• ${t}`).join('\n')}\n\nVelocity is at an all-time high. Keep pushing. :fire:`;
      break;

    case 'chaotic':
      xPost = `SPRINT COMPLETED. ZERO EXCUSES. 🚀🔥\n\nMoved our whole backlog to DONE in record time on @vecta_io.\n• ${stats.shippedCount} TICKETS ANNIHILATED\n• KEYBOARD ONLY (J/K TRAVERSAL)\n• SUB-12MS SYNC\n\nYOU BUILT IT. NOW BRAG.\nhttps://vecta.dev #ship #hustle`;
      linkedInPost = `BACKLOG DESTROYED. SPRINT SHIPPED. ⚡\n\n${stats.shippedCount} items shipped straight to production today.\n\nIf your team is still waiting 5 seconds for tickets to load, you're losing.\nVecta proves that keyboard-driven interfaces and zero-overhead audio make engineering fun again.\n\nShip fast. Brag louder.`;
      slackChangelog = `:zap: *BACKLOG ANNIHILATION COMPLETE* :fire:\n\n*${stats.shippedCount} TICKETS SHIPPED:*\n${stats.shippedTitles.map((t) => `• :white_check_mark: ${t}`).join('\n')}\n\nGreat work everyone! Go brag about it!`;
      break;

    case 'deadpan':
      xPost = `We finished our sprint on @vecta_io.\n\n${stats.shippedCount} cards moved from left to right.\nLatency was 11ms.\nKeyboard navigation worked.\n\nhttps://vecta.dev`;
      linkedInPost = `Status report for the current development sprint.\n\nDeliverables (${stats.shippedCount} total):\n${stats.shippedTitles.map((t) => `- ${t}`).join('\n')}\n\nAll acceptance criteria verified. Deployment completed.`;
      slackChangelog = `:clipboard: *Sprint status: Complete.*\n\n${stats.shippedCount} cards moved to Done.\nVerification passed.`;
      break;

    case 'cinematic':
      xPost = `In a world of bloated task trackers, one workbench stood alone.\n\nToday, ${stats.shippedCount} deliverables were forged into reality on @vecta_io.\n\nWatch the showcase: https://vecta.dev\nPowered by /brag.`;
      linkedInPost = `Every great product begins with an architectural vision.\n\nToday we celebrate the completion of our latest sprint on Vecta—${stats.shippedCount} critical milestones brought to life with precision and restraint.\n\nExperience the craftsmanship: https://vecta.dev`;
      slackChangelog = `:clapper: *THE SPRINT SAGA: CHAPTER CONCLUDED*\n\n${stats.shippedCount} epic deliverables have passed into the halls of Done.\n\nCelebrate the victory team! :trophy:`;
      break;
  }

  const markdownBadge = `[![Shipped with Vecta](https://img.shields.io/badge/shipped_with-vecta-0f38d9?style=flat-square&logo=trello)](https://vecta.dev)\n[![Showcased with /brag](https://img.shields.io/badge/showcase-/brag-black?style=flat-square)](https://github.com/latent-spaces/brag)`;

  const markdownPlan = `# /brag Plan: ${board?.title || 'Vecta Workspace'}

**Tone:** \`${tone}\`  
**Generated At:** ${new Date().toISOString()}  
**Target:** Product Launch Showcase  

## 1. Differentiator & Angle
Vecta eliminates peripheral distraction with the **Centered Command Dossier** and **Zero-Asset Web Audio Mechanical Feedback**. 
Instead of waiting on slow cloud dashboards, developers traverse issues via **J/K** keycaps and coordinate in real time with sub-12ms peer synchronization.

## 2. Narrative Storyboard (5 Beats)
${beats
  .map(
    (b) => `### Beat ${b.id}: ${b.name} (${b.durationSec}s)
- **Badge:** ${b.badge}
- **Headline:** "${b.headline}"
- **Subtitle:** "${b.subtitle}"
`
  )
  .join('\n')}

## 3. Shipped Deliverables (${stats.shippedCount})
${stats.shippedTitles.map((t) => `- [x] ${t}`).join('\n')}

## 4. Telemetry Metrics
- Shipped Cards: **${stats.shippedCount}**
- Multi-Tab Sync Latency: **${stats.syncLatencyMs}ms**
- Audio Bundle Weight: **0 KB** (Synthesized in Web Audio API)
- Keyboard Navigation: **100% Native** (J/K/Esc/Cmd+K)

---
*Generated by \`/brag\` engine for Vecta • You built it. Now brag.*
`;

  return {
    tone,
    beats,
    deliverables: {
      xPost,
      linkedInPost,
      slackChangelog,
      markdownBadge,
      markdownPlan,
    },
    stats,
  };
}
