// Drive + GitHub API config for live recrawl
// 1. Drive API key — Google Cloud Console → APIs & Services → Credentials
//    Add HTTP referrer restriction: https://hyperzx2o.github.io/*
// 2. GitHub PAT — https://github.com/settings/tokens (fine-grained, actions:write on notes-porbo)
var DRIVE_CONFIG = {
  driveKey: 'YOUR_GOOGLE_DRIVE_API_KEY',
  ghToken: 'YOUR_GITHUB_PAT',
  folderId: '1M_1z8t7hDfQUgv0BBw3xt6wj1j-iRT9I'
};
