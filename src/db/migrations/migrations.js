// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './20260725114524_quick_golden_guardian/migration.sql';

export default {
  journal: {
    entries: [
      {
        idx: 0,
        when: 20260725114524,
        tag: "20260725114524_quick_golden_guardian",
        breakpoints: true,
      },
    ],
  },
  migrations: {
    "20260725114524_quick_golden_guardian": m0000,
  },
};
