# Custom Builds

## Adding New Features
1. Clone the repository:
   ```bash
   git clone https://github.com/username/project.git
   ```
2. Modify the feature set in `config.json`:
   ```json
   {
     "featureX": true,
     "featureY": false
   }
   ```

## Compiling for Custom Platforms
- **Linux**:
  ```bash
  make build-linux
  ```
- **Windows**:
  ```cmd
  build.bat
  ```

## Extensibility
- Plugins: Create custom plugins using the `Plugin SDK`.
- Themes: Modify styles in the `themes/` directory.
