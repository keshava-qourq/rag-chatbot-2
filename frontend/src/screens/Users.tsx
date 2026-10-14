// @ts-nocheck -- generated from the approved design under its JS runtime contract; not hand-written TypeScript.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import * as UI from "@/lib/ui";
import { Icons } from "@/lib/icons";
import { brand } from "@/lib/brand";
import { useNavigate } from "@/lib/navigate";

const { Button, Card, CardHeader, CardContent, CardFooter, Input, Label, Table, THead, TBody, TR, TH, TD, Separator } = UI;
const { Search, Check, X, ChevronRight, User, Users, FileText, Clock, Filter, Upload, ArrowRight, AlertCircle, CheckCircle } = Icons;

const ME_ID = 'u_001';
const COMPANY_DOMAIN = 'northgate.co';
const TODAY_LABEL = '14 Oct 2026';

function rgba(hex, a) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return 'rgba(' + ((n >> 16) & 255) + ', ' + ((n >> 8) & 255) + ', ' + (n & 255) + ', ' + a + ')';
}

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

const INITIAL_USERS = [
  {
    id: 'u_001',
    name: 'Dana Whitfield',
    email: 'dana.whitfield@northgate.co',
    role: 'admin',
    created_at: '2026-01-12',
    created_label: '12 Jan 2026',
    last_active: '2026-10-14T09:12',
    last_label: 'Today, 09:12',
    dormant: false,
    uploads: 48,
    roleLog: [{ when: '12 Jan 2026', change: 'First account — admin granted automatically', by: 'System bootstrap' }],
  },
  {
    id: 'u_002',
    name: 'Marcus Ebo',
    email: 'marcus.ebo@northgate.co',
    role: 'admin',
    created_at: '2026-02-03',
    created_label: '3 Feb 2026',
    last_active: '2026-10-13T16:40',
    last_label: 'Yesterday, 16:40',
    dormant: false,
    uploads: 23,
    roleLog: [
      { when: '5 Feb 2026', change: 'Promoted to admin', by: 'Dana Whitfield' },
      { when: '3 Feb 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' },
    ],
  },
  {
    id: 'u_003',
    name: 'Priya Raman',
    email: 'priya.raman@northgate.co',
    role: 'employee',
    created_at: '2026-02-19',
    created_label: '19 Feb 2026',
    last_active: '2026-10-14T08:55',
    last_label: 'Today, 08:55',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '19 Feb 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_004',
    name: 'Tomás Álvarez',
    email: 'tomas.alvarez@northgate.co',
    role: 'employee',
    created_at: '2026-03-04',
    created_label: '4 Mar 2026',
    last_active: '2026-10-14T07:30',
    last_label: 'Today, 07:30',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '4 Mar 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_005',
    name: 'Hannah Breslin',
    email: 'hannah.breslin@northgate.co',
    role: 'employee',
    created_at: '2026-03-27',
    created_label: '27 Mar 2026',
    last_active: '2026-10-10T14:05',
    last_label: '10 Oct, 14:05',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '27 Mar 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_006',
    name: 'Yusuf Demir',
    email: 'yusuf.demir@northgate.co',
    role: 'employee',
    created_at: '2026-04-15',
    created_label: '15 Apr 2026',
    last_active: '2026-09-02T11:18',
    last_label: '2 Sep, 11:18',
    dormant: true,
    uploads: 0,
    roleLog: [{ when: '15 Apr 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_007',
    name: 'Clara Nwosu',
    email: 'clara.nwosu@northgate.co',
    role: 'admin',
    created_at: '2026-05-06',
    created_label: '6 May 2026',
    last_active: '2026-10-12T19:02',
    last_label: '12 Oct, 19:02',
    dormant: false,
    uploads: 15,
    roleLog: [
      { when: '2 Jun 2026', change: 'Promoted to admin', by: 'Marcus Ebo' },
      { when: '6 May 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' },
    ],
  },
  {
    id: 'u_008',
    name: 'Jonah Feld',
    email: 'jonah.feld@northgate.co',
    role: 'employee',
    created_at: '2026-06-01',
    created_label: '1 Jun 2026',
    last_active: '2026-10-09T09:44',
    last_label: '9 Oct, 09:44',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '1 Jun 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_009',
    name: 'Mei-Lin Zhao',
    email: 'meilin.zhao@northgate.co',
    role: 'employee',
    created_at: '2026-07-14',
    created_label: '14 Jul 2026',
    last_active: '2026-10-14T10:02',
    last_label: 'Today, 10:02',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '14 Jul 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_010',
    name: 'Oskar Lindqvist',
    email: 'oskar.lindqvist@northgate.co',
    role: 'employee',
    created_at: '2026-08-20',
    created_label: '20 Aug 2026',
    last_active: '2026-08-21T08:10',
    last_label: '21 Aug, 08:10',
    dormant: true,
    uploads: 0,
    roleLog: [{ when: '20 Aug 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_011',
    name: 'Rachel Oyelaran',
    email: 'rachel.oyelaran@northgate.co',
    role: 'employee',
    created_at: '2026-09-28',
    created_label: '28 Sep 2026',
    last_active: '2026-10-13T12:26',
    last_label: 'Yesterday, 12:26',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '28 Sep 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_012',
    name: 'Daniel Král',
    email: 'daniel.kral@northgate.co',
    role: 'employee',
    created_at: '2026-10-08',
    created_label: '8 Oct 2026',
    last_active: '2026-10-14T11:20',
    last_label: 'Today, 11:20',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '8 Oct 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_013',
    name: 'Sophie Marchetti',
    email: 'sophie.marchetti@northgate.co',
    role: 'employee',
    created_at: '2026-10-12',
    created_label: '12 Oct 2026',
    last_active: '2026-10-13T17:51',
    last_label: 'Yesterday, 17:51',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '12 Oct 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_014',
    name: 'Ibrahim Saleh',
    email: 'ibrahim.saleh@northgate.co',
    role: 'employee',
    created_at: '2026-10-13',
    created_label: '13 Oct 2026',
    last_active: '2026-10-14T06:48',
    last_label: 'Today, 06:48',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '13 Oct 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
  {
    id: 'u_015',
    name: 'Grace Tan',
    email: 'grace.tan@northgate.co',
    role: 'employee',
    created_at: '2026-05-22',
    created_label: '22 May 2026',
    last_active: '2026-10-07T15:33',
    last_label: '7 Oct, 15:33',
    dormant: false,
    uploads: 0,
    roleLog: [{ when: '22 May 2026', change: 'Signed in for the first time — employee', by: 'Google Workspace SSO' }],
  },
];

const ADMIN_RIGHTS = [
  'Ask questions and see every citation',
  'Upload PDF, Word, text and Markdown files',
  'Re-process or delete documents',
  'Promote colleagues to admin',
];

const EMPLOYEE_RIGHTS = ['Ask questions and see every citation'];
const EMPLOYEE_DENIED = ['Upload documents', 'Re-process or delete documents', 'Manage people and roles'];

export default function Screen() {
  const navigate = useNavigate();
  const primary = brand.primaryColor;
  const accent = brand.accentColor;
  const neutral = brand.neutralColor;
  const radius = brand.radius;

  const [users, setUsers] = React.useState(INITIAL_USERS);
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [selectedId, setSelectedId] = React.useState('u_003');
  const [dialog, setDialog] = React.useState(null);
  const [pendingId, setPendingId] = React.useState(null);
  const [failure, setFailure] = React.useState(null);
  const [failedOnce, setFailedOnce] = React.useState({});
  const [toast, setToast] = React.useState(null);
  const [sync, setSync] = React.useState({ state: 'stale', at: '11:46' });

  const timers = React.useRef([]);
  const confirmRef = React.useRef(null);
  const cancelRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => clearTimeout(t));
  }, []);

  const schedule = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  React.useEffect(() => {
    if (dialog && confirmRef.current) confirmRef.current.focus();
  }, [dialog]);

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const newThisWeek = users.filter((u) => u.created_at >= '2026-10-07').length;
  const activeToday = users.filter((u) => u.last_label.indexOf('Today') === 0).length;
  const dormantCount = users.filter((u) => u.dormant).length;

  const q = query.trim().toLowerCase();
  const visible = users
    .filter((u) => {
      if (filter === 'admins' && u.role !== 'admin') return false;
      if (filter === 'employees' && u.role !== 'employee') return false;
      if (filter === 'new' && u.created_at < '2026-10-07') return false;
      if (filter === 'dormant' && !u.dormant) return false;
      if (q && u.name.toLowerCase().indexOf(q) === -1 && u.email.toLowerCase().indexOf(q) === -1) return false;
      return true;
    })
    .sort((a, b) => (a.last_active < b.last_active ? 1 : -1));

  const selected = users.find((u) => u.id === selectedId) || null;

  const FILTERS = [
    { key: 'all', label: 'Everyone', count: users.length },
    { key: 'admins', label: 'Admins', count: adminCount },
    { key: 'employees', label: 'Employees', count: users.length - adminCount },
    { key: 'new', label: 'Joined this week', count: newThisWeek },
    { key: 'dormant', label: 'Dormant 30+ days', count: dormantCount },
  ];

  function openDialog(user, action, ev) {
    triggerRef.current = ev && ev.currentTarget ? ev.currentTarget : null;
    setFailure(null);
    setDialog({ userId: user.id, name: user.name, action: action });
  }

  function closeDialog() {
    setDialog(null);
    if (triggerRef.current && triggerRef.current.focus) triggerRef.current.focus();
  }

  function applyRoleChange(userId, action) {
    setPendingId(userId);
    setFailure(null);
    schedule(() => {
      if (action === 'promote' && userId === 'u_005' && !failedOnce.u_005) {
        setFailedOnce((f) => Object.assign({}, f, { u_005: true }));
        setPendingId(null);
        setFailure({
          userId: userId,
          action: action,
          message:
            'Google Workspace did not confirm the change — the directory call timed out after 10s. Nothing was written, so the role is unchanged.',
        });
        return;
      }
      const nextRole = action === 'promote' ? 'admin' : 'employee';
      let changedName = '';
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          changedName = u.name;
          return Object.assign({}, u, {
            role: nextRole,
            roleLog: [
              {
                when: TODAY_LABEL,
                change: action === 'promote' ? 'Promoted to admin' : 'Admin rights removed — now employee',
                by: 'You (Dana Whitfield)',
              },
            ].concat(u.roleLog),
          });
        })
      );
      setPendingId(null);
      setToast({
        id: userId + ':' + Date.now(),
        text:
          action === 'promote'
            ? changedName + ' is now an admin. The change applies on their next page load.'
            : changedName + ' is back to employee access and can no longer open the admin area.',
      });
      schedule(() => setToast(null), 5200);
    }, 900);
  }

  function confirmDialog() {
    const d = dialog;
    setDialog(null);
    if (triggerRef.current && triggerRef.current.focus) triggerRef.current.focus();
    if (d) applyRoleChange(d.userId, d.action);
  }

  function dialogKeyDown(e) {
    if (e.key === 'Escape') {
      e.stopPropagation();
      closeDialog();
      return;
    }
    if (e.key !== 'Tab') return;
    const first = cancelRef.current;
    const last = confirmRef.current;
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function refreshDirectory() {
    setSync({ state: 'syncing', at: sync.at });
    schedule(() => setSync({ state: 'fresh', at: '11:58' }), 1100);
  }

  const labelStyle = {
    color: neutral,
    letterSpacing: '0.08em',
    fontSize: '0.6875rem',
    textTransform: 'uppercase',
    fontWeight: 600,
  };

  function RolePill(props) {
    const isAdmin = props.role === 'admin';
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold whitespace-nowrap"
        style={{
          borderRadius: '999px',
          backgroundColor: isAdmin ? rgba(accent, 0.3) : rgba(neutral, 0.12),
          color: isAdmin ? primary : neutral,
          border: '1px solid ' + (isAdmin ? rgba(accent, 0.75) : rgba(neutral, 0.25)),
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {isAdmin ? <Icons.Users className="w-3 h-3" aria-hidden="true" /> : <Icons.User className="w-3 h-3" aria-hidden="true" />}
        {isAdmin ? 'Admin' : 'Employee'}
      </span>
    );
  }

  return (
    <div
      className="w-full max-w-[1200px] mx-auto px-5 sm:px-8 py-8"
      style={{ fontFamily: brand.fontBody, color: neutral }}
    >
      <style>{`
        @keyframes kbFadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes kbOverlay { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kbPulse { 0%,100% { opacity: .35; } 50% { opacity: 1; } }
        .kb-anim { animation: kbFadeUp .22s ease-out both; }
        .kb-overlay { animation: kbOverlay .16s ease-out both; }
        .kb-dot { animation: kbPulse 1.1s ease-in-out infinite; }
        .kb-focus:focus-visible { outline: 2px solid ${primary}; outline-offset: 2px; border-radius: ${radius}; }
        @media (prefers-reduced-motion: reduce) {
          .kb-anim, .kb-overlay, .kb-dot, .animate-pulse { animation: none !important; }
        }
      `}</style>

      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <p style={labelStyle}>Admin · Access &amp; roles</p>
          <h1
            className="mt-2 text-[2rem] leading-tight font-semibold"
            style={{ color: primary, fontFamily: brand.fontHeading, letterSpacing: '-0.015em' }}
          >
            People
          </h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed">
            Everyone who has signed in with a <span style={{ color: primary, fontWeight: 600 }}>@{COMPANY_DOMAIN}</span>{' '}
            Google Workspace account. Accounts appear here on first sign-in — there is no invite step and no password
            to issue.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium"
            style={{
              borderRadius: '999px',
              border: '1px solid ' + rgba(neutral, 0.25),
              backgroundColor: rgba(neutral, 0.06),
              color: neutral,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {sync.state === 'syncing' ? (
              <React.Fragment>
                <span className="kb-dot w-2 h-2 rounded-full" style={{ backgroundColor: primary }} aria-hidden="true" />
                Checking Google Workspace…
              </React.Fragment>
            ) : sync.state === 'fresh' ? (
              <React.Fragment>
                <Icons.CheckCircle className="w-3.5 h-3.5" style={{ color: primary }} aria-hidden="true" />
                Synced just now · {sync.at}
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Icons.Clock className="w-3.5 h-3.5" aria-hidden="true" />
                Directory list is 12 minutes old
              </React.Fragment>
            )}
          </div>
          <Button
            onClick={refreshDirectory}
            disabled={sync.state === 'syncing'}
            className="kb-focus"
            style={{
              backgroundColor: 'transparent',
              color: primary,
              border: '1px solid ' + rgba(primary, 0.35),
              borderRadius: radius,
              fontWeight: 600,
            }}
          >
            Refresh directory
          </Button>
        </div>
      </header>

      <dl
        className="mt-7 flex flex-wrap items-baseline gap-x-8 gap-y-3 pb-6"
        style={{ borderBottom: '1px solid ' + rgba(neutral, 0.2), fontVariantNumeric: 'tabular-nums' }}
      >
        {[
          { k: 'Accounts', v: users.length },
          { k: 'Admins', v: adminCount },
          { k: 'Joined this week', v: newThisWeek },
          { k: 'Active today', v: activeToday },
        ].map((s) => (
          <div key={s.k} className="flex items-baseline gap-2">
            <dd className="text-2xl font-semibold" style={{ color: primary }}>
              {s.v}
            </dd>
            <dt className="text-sm">{s.k}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
        {/* ---------- Left pane: directory ---------- */}
        <Card className="bg-white overflow-hidden" style={{ borderRadius: radius, border: '1px solid ' + rgba(neutral, 0.22) }}>
          <CardHeader className="px-5 pt-5 pb-0">
            <h2 className="text-base font-semibold" style={{ color: primary, fontFamily: brand.fontHeading }}>
              Directory
            </h2>
            <p className="mt-1 text-sm">Sorted by most recent sign-in.</p>
          </CardHeader>

          <CardContent className="px-5 pb-0 pt-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 min-w-0">
                <Label htmlFor="people-search" className="block mb-1.5" style={labelStyle}>
                  Find someone
                </Label>
                <Input
                  id="people-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name or company email"
                  className="w-full"
                  style={{ borderRadius: radius }}
                />
              </div>
              <Icons.Search className="w-4 h-4 mb-3 shrink-0" style={{ color: neutral }} aria-hidden="true" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter people by role or activity">
              {FILTERS.map((f) => {
                const on = filter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    aria-pressed={on}
                    className="kb-focus px-3 py-1.5 text-xs font-semibold transition-colors duration-150"
                    style={{
                      borderRadius: '999px',
                      border: '1px solid ' + (on ? primary : rgba(neutral, 0.28)),
                      backgroundColor: on ? primary : 'transparent',
                      color: on ? brand.backgroundColor : neutral,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {f.label} ({f.count})
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-xs" style={{ color: neutral, fontVariantNumeric: 'tabular-nums' }}>
              Showing {visible.length} of {users.length} accounts
            </p>
          </CardContent>

          <div className="mt-3" style={{ borderTop: '1px solid ' + rgba(neutral, 0.18) }}>
            {sync.state === 'syncing' ? (
              <ul className="p-5 space-y-4" aria-label="Loading the people list">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <li key={i} className="animate-pulse flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full shrink-0" style={{ backgroundColor: rgba(neutral, 0.16) }} />
                    <span className="flex-1 space-y-2">
                      <span className="block h-3 w-40" style={{ backgroundColor: rgba(neutral, 0.16), borderRadius: 4 }} />
                      <span className="block h-2.5 w-56" style={{ backgroundColor: rgba(neutral, 0.1), borderRadius: 4 }} />
                    </span>
                  </li>
                ))}
                <li className="sr-only" aria-live="polite">
                  Re-reading the directory from Google Workspace.
                </li>
              </ul>
            ) : visible.length === 0 ? (
              <div className="px-6 py-14 text-center kb-anim">
                <Icons.Search className="w-6 h-6 mx-auto" style={{ color: rgba(neutral, 0.6) }} aria-hidden="true" />
                <h3 className="mt-3 text-sm font-semibold" style={{ color: primary }}>
                  No one here matches {q ? '“' + query.trim() + '”' : 'that filter'}
                </h3>
                <p className="mt-2 text-sm mx-auto max-w-xs">
                  Only people who have signed in at least once appear in this list. Check the spelling, or widen the
                  filter.
                </p>
                <Button
                  onClick={() => {
                    setQuery('');
                    setFilter('all');
                  }}
                  className="kb-focus mt-4"
                  style={{
                    backgroundColor: 'transparent',
                    color: primary,
                    border: '1px solid ' + rgba(primary, 0.35),
                    borderRadius: radius,
                    fontWeight: 600,
                  }}
                >
                  Clear search and filters
                </Button>
              </div>
            ) : (
              <ul className="max-h-[560px] overflow-y-auto divide-y" style={{ borderColor: rgba(neutral, 0.14) }}>
                {visible.map((u) => {
                  const on = u.id === selectedId;
                  return (
                    <li key={u.id} style={{ borderColor: rgba(neutral, 0.14) }}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(u.id)}
                        aria-current={on ? 'true' : undefined}
                        className="kb-focus w-full text-left flex items-center gap-3 px-5 py-3.5 transition-colors duration-150"
                        style={{
                          backgroundColor: on ? rgba(primary, 0.07) : 'transparent',
                          boxShadow: on ? 'inset 3px 0 0 0 ' + primary : 'inset 3px 0 0 0 transparent',
                        }}
                      >
                        <span
                          className="w-9 h-9 shrink-0 rounded-full grid place-items-center text-xs font-semibold"
                          style={{
                            backgroundColor: u.role === 'admin' ? primary : rgba(neutral, 0.16),
                            color: u.role === 'admin' ? brand.backgroundColor : primary,
                          }}
                          aria-hidden="true"
                        >
                          {initials(u.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-[0.95rem] truncate" style={{ color: primary }}>
                              {u.name}
                            </span>
                            {u.id === ME_ID && (
                              <span className="text-[0.6875rem] font-semibold" style={{ color: neutral }}>
                                (you)
                              </span>
                            )}
                            {u.dormant && (
                              <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium" style={{ color: neutral }}>
                                <Icons.Clock className="w-3 h-3" aria-hidden="true" />
                                Dormant
                              </span>
                            )}
                          </span>
                          <span className="block text-xs truncate mt-0.5">{u.email}</span>
                        </span>
                        <span className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                          <RolePill role={u.role} />
                          <span className="text-[0.6875rem]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {u.last_label}
                          </span>
                        </span>
                        <Icons.ChevronRight
                          className="w-4 h-4 shrink-0"
                          style={{ color: on ? primary : rgba(neutral, 0.5) }}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        {/* ---------- Right pane: the person ---------- */}
        <div className="lg:sticky lg:top-6">
          {!selected ? (
            <Card
              className="bg-white px-6 py-14 text-center"
              style={{ borderRadius: radius, border: '1px solid ' + rgba(neutral, 0.22) }}
            >
              <Icons.Users className="w-7 h-7 mx-auto" style={{ color: rgba(primary, 0.5) }} aria-hidden="true" />
              <h2 className="mt-3 text-base font-semibold" style={{ color: primary, fontFamily: brand.fontHeading }}>
                No one selected
              </h2>
              <p className="mt-2 text-sm mx-auto max-w-[17rem]">
                Pick a name from the directory to see when they signed in, what their role lets them do, and whether to
                make them an admin.
              </p>
            </Card>
          ) : (
            <Card
              key={selected.id}
              className="bg-white kb-anim overflow-hidden"
              style={{ borderRadius: radius, border: '1px solid ' + rgba(neutral, 0.22) }}
            >
              <CardHeader className="px-6 pt-6 pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="w-11 h-11 shrink-0 rounded-full grid place-items-center text-sm font-semibold"
                      style={{
                        backgroundColor: selected.role === 'admin' ? primary : rgba(neutral, 0.16),
                        color: selected.role === 'admin' ? brand.backgroundColor : primary,
                      }}
                      aria-hidden="true"
                    >
                      {initials(selected.name)}
                    </span>
                    <div className="min-w-0">
                      <h2
                        className="text-lg font-semibold leading-tight"
                        style={{ color: primary, fontFamily: brand.fontHeading }}
                      >
                        {selected.name}
                      </h2>
                      <p className="text-sm mt-0.5 break-all">{selected.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <RolePill role={selected.role} />
                        {selected.id === ME_ID && (
                          <span
                            className="px-2 py-0.5 text-[0.6875rem] font-semibold"
                            style={{ borderRadius: '999px', border: '1px solid ' + rgba(neutral, 0.3), color: neutral }}
                          >
                            Signed in as you
                          </span>
                        )}
                        {selected.dormant && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[0.6875rem] font-semibold"
                            style={{ borderRadius: '999px', border: '1px solid ' + rgba(neutral, 0.3), color: neutral }}
                          >
                            <Icons.Clock className="w-3 h-3" aria-hidden="true" />
                            Dormant 30+ days
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Close person panel"
                    className="kb-focus shrink-0 p-1.5 transition-colors duration-150"
                    style={{ borderRadius: radius, color: neutral }}
                  >
                    <Icons.X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="px-6 pt-5 pb-0">
                <dl
                  className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  <div>
                    <dt style={labelStyle}>First signed in</dt>
                    <dd className="mt-1" style={{ color: primary }}>
                      {selected.created_label}
                    </dd>
                  </div>
                  <div>
                    <dt style={labelStyle}>Last signed in</dt>
                    <dd className="mt-1" style={{ color: primary }}>
                      {selected.last_label}
                    </dd>
                  </div>
                  <div>
                    <dt style={labelStyle}>Identity</dt>
                    <dd className="mt-1" style={{ color: primary }}>
                      Google Workspace SSO
                    </dd>
                  </div>
                  <div>
                    <dt style={labelStyle}>Account ID</dt>
                    <dd className="mt-1" style={{ color: primary }}>
                      {selected.id}
                    </dd>
                  </div>
                </dl>

                <Separator className="my-5" />

                <h3 className="text-sm font-semibold" style={{ color: primary, fontFamily: brand.fontHeading }}>
                  What this account can do
                </h3>
                <ul className="mt-3 space-y-2 text-sm">
                  {(selected.role === 'admin' ? ADMIN_RIGHTS : EMPLOYEE_RIGHTS).map((r) => (
                    <li key={r} className="flex items-start gap-2">
                      <Icons.Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primary }} aria-hidden="true" />
                      <span style={{ color: primary }}>{r}</span>
                    </li>
                  ))}
                  {selected.role === 'employee' &&
                    EMPLOYEE_DENIED.map((r) => (
                      <li key={r} className="flex items-start gap-2">
                        <Icons.X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: rgba(neutral, 0.75) }} aria-hidden="true" />
                        <span>{r}</span>
                      </li>
                    ))}
                </ul>

                <p
                  className="mt-4 text-xs leading-relaxed px-3 py-2.5"
                  style={{ backgroundColor: rgba(neutral, 0.08), borderRadius: radius }}
                >
                  Chat history stays private to each person. Admin rights never include reading anyone else's
                  conversations.
                </p>

                {selected.role === 'admin' && selected.uploads > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate('documents')}
                    className="kb-focus mt-4 w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors duration-150"
                    style={{ border: '1px solid ' + rgba(neutral, 0.25), borderRadius: radius, color: primary }}
                  >
                    <span className="flex items-center gap-2">
                      <Icons.FileText className="w-4 h-4" aria-hidden="true" />
                      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {selected.uploads} documents uploaded
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold">
                      Open documents
                      <Icons.ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </button>
                )}

                <Separator className="my-5" />

                <h3 className="text-sm font-semibold" style={{ color: primary, fontFamily: brand.fontHeading }}>
                  Role history
                </h3>
                <div className="mt-2" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <Table>
                    <THead>
                      <TR>
                        <TH>When</TH>
                        <TH>Change</TH>
                        <TH>By</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {selected.roleLog.map((entry, i) => (
                        <TR key={entry.when + i}>
                          <TD>
                            <span className="text-xs whitespace-nowrap">{entry.when}</span>
                          </TD>
                          <TD>
                            <span className="text-xs" style={{ color: primary }}>
                              {entry.change}
                            </span>
                          </TD>
                          <TD>
                            <span className="text-xs">{entry.by}</span>
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>
              </CardContent>

              <CardFooter className="px-6 py-5 mt-5" style={{ backgroundColor: rgba(primary, 0.05) }}>
                <div className="w-full">
                  {failure && failure.userId === selected.id ? (
                    <div
                      className="kb-anim p-4"
                      style={{ border: '1px solid ' + rgba(primary, 0.4), borderRadius: radius, backgroundColor: 'white' }}
                      role="alert"
                    >
                      <div className="flex items-start gap-2">
                        <Icons.AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primary }} aria-hidden="true" />
                        <div>
                          <h3 className="text-sm font-semibold" style={{ color: primary }}>
                            The role change didn't go through
                          </h3>
                          <p className="mt-1 text-xs leading-relaxed">{failure.message}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          onClick={() => applyRoleChange(failure.userId, failure.action)}
                          className="kb-focus"
                          style={{
                            backgroundColor: primary,
                            color: brand.backgroundColor,
                            borderRadius: radius,
                            fontWeight: 600,
                          }}
                        >
                          Try promoting again
                        </Button>
                        <Button
                          onClick={() => setFailure(null)}
                          className="kb-focus"
                          style={{
                            backgroundColor: 'transparent',
                            color: neutral,
                            border: '1px solid ' + rgba(neutral, 0.3),
                            borderRadius: radius,
                          }}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ) : selected.id === ME_ID ? (
                    <div className="flex items-start gap-2">
                      <Icons.AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: neutral }} aria-hidden="true" />
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: primary }}>
                          You can't change your own role
                        </h3>
                        <p className="mt-1 text-xs leading-relaxed">
                          Ask {users.filter((u) => u.role === 'admin' && u.id !== ME_ID).map((u) => u.name).join(' or ') ||
                            'another admin'}{' '}
                          to do it. Admin rights are only ever granted by another admin.
                        </p>
                      </div>
                    </div>
                  ) : pendingId === selected.id ? (
                    <div className="flex items-center gap-2 text-sm" aria-live="polite">
                      <span className="kb-dot w-2 h-2 rounded-full" style={{ backgroundColor: primary }} aria-hidden="true" />
                      <span style={{ color: primary, fontWeight: 600 }}>
                        Writing the role change for {selected.name}…
                      </span>
                    </div>
                  ) : selected.role === 'employee' ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={(e) => openDialog(selected, 'promote', e)}
                        className="kb-focus"
                        style={{
                          backgroundColor: primary,
                          color: brand.backgroundColor,
                          borderRadius: radius,
                          fontWeight: 600,
                          padding: '0.625rem 1.1rem',
                        }}
                      >
                        Make {selected.name.split(' ')[0]} an admin
                      </Button>
                      <p className="text-xs" style={{ maxWidth: '14rem' }}>
                        Admins can upload and delete documents for everyone.
                      </p>
                    </div>
                  ) : adminCount === 1 ? (
                    <div className="flex items-start gap-2">
                      <Icons.AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: neutral }} aria-hidden="true" />
                      <p className="text-xs leading-relaxed">
                        <span className="font-semibold" style={{ color: primary }}>
                          Last admin standing.
                        </span>{' '}
                        Promote someone else before removing {selected.name.split(' ')[0]}'s admin rights — the
                        knowledge base needs at least one admin.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        onClick={(e) => openDialog(selected, 'revoke', e)}
                        className="kb-focus"
                        style={{
                          backgroundColor: 'transparent',
                          color: primary,
                          border: '1px solid ' + rgba(primary, 0.4),
                          borderRadius: radius,
                          fontWeight: 600,
                        }}
                      >
                        Remove admin rights
                      </Button>
                      <p className="text-xs" style={{ maxWidth: '13rem' }}>
                        Keeps their account and their chat history — drops upload and delete.
                      </p>
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* ---------- Confirmation dialog ---------- */}
      {dialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 kb-overlay"
          style={{ backgroundColor: rgba(primary, 0.45) }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-dialog-title"
            aria-describedby="role-dialog-desc"
            onKeyDown={dialogKeyDown}
            className="w-full max-w-md bg-white p-6 kb-anim"
            style={{ borderRadius: radius, boxShadow: '0 18px 48px ' + rgba(primary, 0.3) }}
          >
            <h2
              id="role-dialog-title"
              className="text-lg font-semibold"
              style={{ color: primary, fontFamily: brand.fontHeading }}
            >
              {dialog.action === 'promote'
                ? 'Make ' + dialog.name + ' an admin?'
                : 'Remove admin rights from ' + dialog.name + '?'}
            </h2>
            <p id="role-dialog-desc" className="mt-2 text-sm leading-relaxed">
              {dialog.action === 'promote'
                ? 'The change takes effect on their next page load. From then on they can:'
                : 'They keep their account, their questions and their history. From their next page load they lose:'}
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {['Upload PDF, Word, text and Markdown files', 'Re-process or delete documents — deletion is irreversible', 'Promote other colleagues to admin'].map(
                (line) => (
                  <li key={line} className="flex items-start gap-2">
                    {dialog.action === 'promote' ? (
                      <Icons.Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primary }} aria-hidden="true" />
                    ) : (
                      <Icons.X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: rgba(neutral, 0.8) }} aria-hidden="true" />
                    )}
                    <span style={{ color: primary }}>{line}</span>
                  </li>
                )
              )}
            </ul>
            <div className="mt-6 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={closeDialog}
                className="kb-focus px-4 py-2 text-sm font-semibold transition-colors duration-150"
                style={{ borderRadius: radius, border: '1px solid ' + rgba(neutral, 0.3), color: neutral }}
              >
                Cancel
              </button>
              <button
                ref={confirmRef}
                type="button"
                onClick={confirmDialog}
                className="kb-focus px-4 py-2 text-sm font-semibold transition-colors duration-150"
                style={{ borderRadius: radius, backgroundColor: primary, color: brand.backgroundColor }}
              >
                {dialog.action === 'promote' ? 'Yes, make admin' : 'Yes, remove admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Success toast ---------- */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-40 max-w-sm kb-anim flex items-start gap-3 px-4 py-3 bg-white"
          style={{
            borderRadius: radius,
            border: '1px solid ' + rgba(neutral, 0.22),
            borderLeft: '4px solid ' + accent,
            boxShadow: '0 12px 32px ' + rgba(primary, 0.18),
          }}
        >
          <Icons.CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: primary }} aria-hidden="true" />
          <p className="text-sm leading-relaxed" style={{ color: primary }}>
            {toast.text}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss confirmation"
            className="kb-focus shrink-0 p-1"
            style={{ borderRadius: radius, color: neutral }}
          >
            <Icons.X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
