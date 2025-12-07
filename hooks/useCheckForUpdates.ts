import { useState, useEffect } from 'react';

const GITHUB_REPO_API = 'https://api.github.com/repos/gersonsibindemz/EHOPA-AGENT/commits/main';
const STORAGE_KEY = 'ehopa_agent_latest_sha';

export const useCheckForUpdates = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [newVersionSha, setNewVersionSha] = useState<string | null>(null);

  useEffect(() => {
    const checkUpdates = async () => {
      try {
        // Fetch the latest commit from the public GitHub API
        const response = await fetch(GITHUB_REPO_API, {
          headers: { 'Accept': 'application/vnd.github.v3+json' },
          cache: 'no-cache' // Ensure we get fresh data
        });
        
        if (!response.ok) return;

        const data = await response.json();
        const latestSha = data.sha;
        
        if (!latestSha) return;

        const currentSha = localStorage.getItem(STORAGE_KEY);

        // If no local SHA exists (first run or cleared cache), 
        // assume the current version is the latest and save it.
        if (!currentSha) {
          localStorage.setItem(STORAGE_KEY, latestSha);
          return;
        }

        // If the hashes differ, an update is available on the remote
        if (currentSha !== latestSha) {
          setHasUpdate(true);
          setNewVersionSha(latestSha);
        }
      } catch (error) {
        // Silently fail on network errors or API limits (offline safe)
        console.debug('Update check failed:', error);
      }
    };

    checkUpdates();
  }, []);

  const dismissUpdate = () => {
    // When dismissed (or updated), we acknowledge this version
    // so the banner doesn't show again until the hash changes again.
    if (newVersionSha) {
      localStorage.setItem(STORAGE_KEY, newVersionSha);
    }
    setHasUpdate(false);
  };

  return { hasUpdate, dismissUpdate };
};
