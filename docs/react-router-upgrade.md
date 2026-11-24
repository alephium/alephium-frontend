# React Router 8

The explorer and desktop wallet use the declarative API from `react-router`.
The explorer keeps `BrowserRouter` for normal hosting and `HashRouter` for
GitHub Pages. Its legacy `/#/...` redirect remains supported. The desktop
wallet keeps `HashRouter` with `useTransitions={false}` so navigation does not
hide the unlock loader before the wallet screen mounts.

Development and CI require Node 22.22.0 or newer. The committed lockfile must
resolve React and React DOM to at least 19.2.7. The shared `setup-monorepo`
action and the mobile EAS build use the same Node baseline as `.node-version`
and `.nvmrc`, so installing the shared workspace meets the new engine requirement.

The [v8 upgrade guide](https://reactrouter.com/upgrading/v7) describes middleware,
request passthrough, trailing-slash data requests and split route modules.
Neither app uses loaders, actions, router middleware, framework mode or RSC;
those changes do not require adding data-router configuration here.

`GHSA-qwww-vcr4-c8h2` is no longer suppressed: the selected v8 dependency is at
least 8.3.0. The [advisory](https://github.com/advisories/GHSA-qwww-vcr4-c8h2)
also now lists a patched v7 release; this change still follows issue #1703's
requested v8 migration.

## Navigation regression coverage

`App.routing.test.tsx` mounts the explorer's actual route table in both hosting
modes. It checks deep links, query parameters, link navigation, back/forward,
remounting at the current URL, the not-found page and legacy hash redirects.

`routes/navigation.test.tsx` mounts the desktop's actual nested route tables
and wizard navigation context. It checks wallet pages, hash-only navigation,
history, create/import next/back/exit, locked-wallet redirects and Ledger routing.
Page contents and wallet/network services are replaced by fixtures, so these
tests never access keys or live networks.

Run each app's `test`, `typecheck` and `lint` scripts, then `pnpm audit --prod`.
For release smoke testing, additionally open explorer deep links on the intended
web host and exercise create/import, unlock, activity, addresses and lock in a
packaged desktop build with a disposable test wallet. The component tests do
not replace Electron packaging or deployment-level SPA fallback verification.
