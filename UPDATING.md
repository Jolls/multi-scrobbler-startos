# Updating the upstream version

Upstream is a Docker image, pinned by tag: `foxxmd/multi-scrobbler:<version>` in
`startos/manifest/index.ts` (`images['multi-scrobbler'].source.dockerTag`).

## Determining the upstream version

Check the latest release tag:

```bash
gh release view -R FoxxMD/multi-scrobbler --json tagName -q .tagName
```

Confirm the corresponding Docker Hub tag exists and is multi-arch before pinning it:

```bash
curl -s "https://hub.docker.com/v2/repositories/foxxmd/multi-scrobbler/tags?page_size=25" \
  | jq -r '.results[] | select(.name=="<version>") | .images[].architecture'
```

Expect both `amd64` and `arm64` in the output. Avoid `latest`/`edge` — pin an explicit
version tag so upgrades are deliberate.

## Applying the bump

1. Update `images['multi-scrobbler'].source.dockerTag` in `startos/manifest/index.ts`,
   and update the "Confirmed on Docker Hub \<date\>" comment above it.
2. Add a new entry to `startos/versions/` per [the version rules](../start-technologies/projects/start-sdk/docs/src/versions.md),
   with release notes describing what changed upstream.
3. Rebuild (`make`) and test-install before publishing.
