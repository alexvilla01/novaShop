# Plan de acción — GitFlow y organización de GitHub

## Situación actual

- Rama única `main` (default), sin protección; CI corre en push a `main` y en todo PR.
- `deploy.yml` existe pero está en `workflow_dispatch` manual (falta VPS + secrets SSH).
- Historial reciente lineal, mensajes Conventional Commits.
- No hay ramas de integración ni tags de versión.

## Objetivo

- `develop`: rama de integración. Todo trabajo aterriza aquí primero.
- `main`: rama de producción/despliegue. Solo recibe releases mergeados desde `develop` (o `hotfix/*`).
- `feature/*`, `fix/*`, `release/*`, `hotfix/*` como ramas de trabajo efímeras.
- GitHub organizado: default `develop`, protección de ramas, CI en ambas, deploy desde `main`.

## Modelo de ramas

| Rama | Sale de | Vuelve a | Uso |
|------|---------|----------|-----|
| `main` | — | — | Producción y despliegue |
| `develop` | `main` | — | Integración continua |
| `feature/<scope>` | `develop` | `develop` (squash) | Funcionalidad nueva |
| `fix/<scope>` | `develop` | `develop` (squash) | Bugs no urgentes |
| `release/<x.y.z>` | `develop` | `main` (merge) + `develop` | Congelar versión y estabilizar |
| `hotfix/<x.y.z>` | `main` | `main` + `develop` | Urgencia en producción |

Reglas:
- Commits en Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.).
- Nunca commit directo a `main`; solo merge de `release/*` u `hotfix/*`.
- `develop` solo recibe PRs con CI verde (PR obligatoria); hotfix de emergencia puede saltarse la protección como admin.
- Las ramas se borran al mergear (`delete_branch_on_merge`).

## Fases

### Fase 0 — Respaldo del estado actual
- [x] `git fetch origin && git pull --ff-only`
- [x] Crear tag anotado del estado actual (`v0.1.0-pre-gitflow`) y subirlo.
- [x] Verificar working tree limpio.

### Fase 1 — Crear `develop` y publicarla
- [x] `git switch -c develop main`
- [x] `git push -u origin develop`
- [x] `gh repo edit --default-branch develop` (nuevas PRs y clones parten de integración).

### Fase 2 — Ajustar CI
- [x] `ci.yml`: `push.branches: [main, develop]` y `pull_request.branches: [main, develop]`.
- [x] Mantener jobs backend + frontend; sin cambios de lógica.
- [x] Verificar run verde en `develop` (run 42506151949).

### Fase 3 — Protección y ajustes de repo en GitHub
- [x] Activar `delete_branch_on_merge`.
- [x] Proteger `main`: PR + CI (backend + frontend), rama al día, sin force push ni borrado, bypass de admin deshabilitado.
- [x] Proteger `develop`: PR + CI, rama al día, sin force push ni borrado, bypass de admin permitido para emergencias.
- [x] Merge methods: squash y merge commit habilitados; rebase deshabilitado.

### Fase 4 — Flujo de trabajo diario
- [x] Bootstrap: `develop` se creó con un commit directo de CI antes de activar la protección; desde entonces todo entra por PR (PR #1 validó el flujo).
- [x] Feature: `git switch develop && git pull` → `git switch -c feature/<scope>` → commits → push → PR a `develop` → CI → squash merge.
- [ ] Release: `release/x.y.z` desde `develop` → estabilizar → PR a `main` → tag `vX.Y.Z` → back-merge a `develop`.
- [ ] Hotfix: `hotfix/x.y.z` desde `main` → PR a `main` → tag → back-merge a `develop`.

### Fase 5 — Despliegue
- [x] Disparador: tag `v*` (+ `workflow_dispatch` como respaldo manual).
- [ ] Activar en `deploy.yml` cuando existan VPS y secrets `SSH_HOST/SSH_USER/SSH_KEY/PROJECT_DIR`.
- [ ] Rollback documentado por tag (`git reset --hard vX.Y.Z` en el VPS y redeploy).

### Fase 6 — Verificación
- [x] PR `fix/* → develop` corre CI y mergea con squash (PR #1).
- [x] CI corre en `develop` y `main`.
- [x] Protecciones verificadas vía API (checks, strict, force push y borrado deshabilitados).
- [ ] Probar PR `release/* → main` y tag `v*` cuando exista el VPS (el deploy se omite con aviso si faltan secrets).

## Comandos base

```bash
# arranque
git fetch origin && git pull --ff-only
git tag -a v0.1.0-pre-gitflow -m "Estado antes de GitFlow"
git push origin v0.1.0-pre-gitflow
git switch -c develop main && git push -u origin develop
gh repo edit --default-branch develop
gh repo edit --delete-branch-on-merge

# feature
git switch develop && git pull --ff-only
git switch -c feature/<scope>
# ... commits ...
git push -u origin feature/<scope>
gh pr create --base develop --fill

# release
git switch -c release/0.2.0 develop
git push -u origin release/0.2.0
gh pr create --base main --title "release: 0.2.0"
git tag -a v0.2.0 -m "v0.2.0" && git push origin v0.2.0
git switch develop && git merge --no-ff main && git push
```

## Decisiones aprobadas

1. GitFlow completo: `develop` + `feature/*`/`fix/*` + `release/*`/`hotfix/*`.
2. `develop` es la default branch de GitHub.
3. Deploy al empujar tag `v*` (respaldo: `workflow_dispatch`).
4. PR obligatoria en `develop` y en `main`, con CI requerida (sin aprobación obligatoria: mantenedor único).
5. `main` no permite bypass ni siquiera a admins; `develop` permite bypass de admin solo para emergencias.
