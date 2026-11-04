# Updating the upstream version

Upstream is a Docker image, pinned by tag: `foxxmd/multi-scrobbler:<version>` in
`startos/manifest/index.ts` (`images['multi-scrobbler'].source.dockerTag`).

## Determining the upstream version

Read the tag list rather than the "Latest" release, and skip prereleases:

```bash
gh release list -R FoxxMD/multi-scrobbler --exclude-pre-releases --limit 10
```

Confirm the exact Docker Hub tag exists and is multi-arch before pinning it. Query the tag
directly: the paginated tag list is dominated by `pr-*` builds and will not show it.

```bash
curl -s "https://hub.docker.com/v2/repositories/foxxmd/multi-scrobbler/tags/<version>" \
  | jq -r '.images[].architecture'
```

Expect both `amd64` and `arm64` in the output. Avoid `latest`/`edge` — pin an explicit
version tag so upgrades are deliberate.

## Applying the bump

Update `images['multi-scrobbler'].source.dockerTag` in `startos/manifest/index.ts`.
