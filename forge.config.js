module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux', 'darwin'],
    },
    // {
    //   name: '@electron-forge/maker-deb',
    //   config: {
        
    //   },
    //   platforms: ['linux']
    // }
  ],
};
