import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const read = (name: string) =>
	readFileSync(fileURLToPath(new URL(`../${name}`, import.meta.url)), 'utf8');

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const npmrc = read('.npmrc');

/**
 * Cloudflare Workers Builds runs `npm clean-install`, which aborts if the lock
 * does not describe exactly the tree npm would resolve from package.json. These
 * guard the two ways that has broken here; neither needs the network.
 */
describe('npm ci inputs', () => {
	// The lock is generated on a machine whose ~/.npmrc sets legacy-peer-deps=true,
	// so it omits peer deps (react, via @clerk/themes -> @clerk/shared -> swr).
	// Without this pin the builder resolves peers, finds react missing from the
	// lock, and fails with "Missing: react@… from lock file".
	it('pins legacy-peer-deps so the builder resolves the same tree as the lock', () => {
		expect(npmrc).toMatch(/^legacy-peer-deps\s*=\s*true$/m);
	});

	it('has no peer-installed react in the lock, matching that setting', () => {
		expect(lock.packages['node_modules/react']).toBeUndefined();
	});

	it('keeps the lock version in step with package.json', () => {
		expect(lock.version).toBe(pkg.version);
		expect(lock.packages[''].version).toBe(pkg.version);
		expect(lock.packages[''].name).toBe(pkg.name);
	});

	it('records every declared dependency in the lock root', () => {
		const declared = { ...pkg.dependencies, ...pkg.devDependencies };
		const locked = { ...lock.packages[''].dependencies, ...lock.packages[''].devDependencies };

		expect(locked).toEqual(declared);
	});

	it('resolves every declared dependency to an installed package', () => {
		const missing = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(
			(name) => !lock.packages[`node_modules/${name}`]
		);

		expect(missing).toEqual([]);
	});
});
