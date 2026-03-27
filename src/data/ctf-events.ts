export interface CtfEvent {
  title: string;
  startDate: string;
  endDate?: string;
  platform?: string;
  url?: string;
  note?: string;
}

export const CTF_EVENTS_FILE_PATH = 'src/data/ctf-events.ts';
export const CTF_EVENTS_EDIT_URL =
  'https://github.com/cpx1210/cpx1210.github.io/edit/main/src/data/ctf-events.ts';

export const ctfEvents: CtfEvent[] = [
  {
    title: '第一届 Polaris CTF',
    startDate: '2026-03-28T09:00:00+08:00',
    endDate: '2026-03-30T09:00:00+08:00',
    note: '北京时间',
  },
  // Add new events here.
  // Example:
  // {
  //   title: 'ExampleCTF 2026',
  //   startDate: '2026-04-12T09:00:00+08:00',
  //   endDate: '2026-04-13T21:00:00+08:00',
  //   platform: 'ctftime',
  //   url: 'https://ctftime.org/',
  //   note: 'Team event',
  // },
];
